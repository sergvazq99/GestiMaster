"use strict"
const express = require("express");
const session = require("express-session");
const mysql = require("mysql");
const multer = require('multer');
const path = require("path");
const mysqlSession = require("express-mysql-session");
const MySQLStore = mysqlSession(session);

const pool = mysql.createPool({
    connectionLimit: 10,
    host: "localhost",
    user: "root",
    password: "",
    database: "AW_24"
});

const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

const middlewareSession = session({
    saveUninitialized: false,
    secret: "foobar34",
    resave: false,
    store: new MySQLStore({}, pool)
});

app.use(middlewareSession);

// Configurar multer para manejar las cargas de archivos 
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


app.post('/upload-image', upload.single('imagen'), (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
        return res.status(401).send("Usuario no autenticado");
    }
    const imagen = req.file.buffer;
    pool.query("UPDATE usuarios SET imagen = ? WHERE id = ?", [imagen, userId], (err) => {
        if (err) {
            console.error("Error al actualizar la imagen:", err);
            return res.status(500).send("Error al actualizar la imagen");
        }
        res.redirect("/");
    });
});

app.get('/user-image', (req, res) => {
    const userId = req.session.userId;
    pool.query("SELECT imagen FROM usuarios WHERE id = ?", [userId], (err, results) => {
        if (err || !results[0].imagen) { // Si hay un error o no hay imagen, enviamos una imagen predeterminada 
            return res.sendFile(path.join(__dirname, "public", "imagenes", "perfil.jpg"));
        }
        else {
            res.writeHead(200, { 'Content-Type': 'image/jpeg' });
            res.end(results[0].imagen);
        }
    });
});

app.get("/", (req, res) => {
    const userId = req.session.userId;
    const searchTerm = req.query.q || '';

    let query = `
        SELECT e.id, e.titulo, e.descripcion, e.fecha, e.hora, e.ubicacion, e.capacidad_maxima, e.tipo,
               COALESCE(i.estado_inscripcion, 'no_inscrito') AS estado_inscripcion
        FROM eventos e
        LEFT JOIN inscripciones i ON e.id = i.evento_id AND i.usuario_id = ?
    `;
    let params = [userId];

    if (searchTerm) {
        query += ` WHERE 
            e.titulo LIKE ? OR 
            e.descripcion LIKE ? OR 
            e.fecha LIKE ? OR 
            e.tipo LIKE ? OR 
            e.ubicacion LIKE ? OR 
            e.capacidad_maxima LIKE ?`;
        const wildcardSearch = `%${searchTerm}%`;
        params.push(wildcardSearch, wildcardSearch, wildcardSearch, wildcardSearch, wildcardSearch, wildcardSearch);
    }

    pool.query(query, params, (err, results) => {
        if (err) {
            console.error("Error en la consulta de eventos:", err);
            res.status(500).send("Error en la consulta de eventos.");
        } else {
            res.render("index", { eventos: results, userId, user: { nombre: req.session.nombre, correo: req.session.correo, rol: req.session.rol || null }, q: searchTerm });
        }
    });
});





app.post("/login", (req, res) => {
    const { correo, contrasenia } = req.body;
    pool.query("SELECT * FROM usuarios WHERE correo=? AND contrasenia=?", [correo, contrasenia], (err, results) => {
        if (err) {
            console.log("error");
        }
        else if (results.length > 0) {
            req.session.userId = results[0].id;
            req.session.nombre = results[0].nombre;
            req.session.correo = results[0].correo;
            req.session.telefono = results[0].telefono;
            req.session.facultad = results[0].facultad;
            req.session.contrasenia = results[0].contrasenia;
            req.session.rol = results[0].rol;
            res.redirect("/");
        }
        else {
            console.log("Credenciales incorrectas");
        }
    });

});

app.get("/register", (req, res) => {
    pool.query("SELECT * FROM facultades", (err, results) => {
        if (err) {
            console.log("error");
        }
        else {
            res.render("register", { facultades: results });
        }
    });

});

app.post("/register", (req, res) => {
    const { nombre, correo, telefono, facultad, rol, contrasenia } = req.body;
    pool.query("SELECT correo FROM usuarios WHERE correo=?", [correo], (err, results) => {
        if (err) {
            console.error("Error en la consulta de verificación:", err);
        }
        else if (results.length > 0) {

            console.log("el correo ya está registrado");
        }
        else {
            pool.query("INSERT INTO usuarios (nombre,correo,telefono,facultad,rol,contrasenia) VALUES (?,?,?,?,?,?)", [nombre, correo, telefono, facultad, rol, contrasenia], (err) => {
                if (err) {
                    console.log("error");
                    console.log(nombre, correo, telefono, facultad, rol, contrasenia);
                }
                else {
                    console.log("tu rol es: " + rol);
                    res.redirect("/");
                }
            });
        }
    });
});


app.post('/update-event/:id', (req, res) => {
    const { titulo, descripcion, fecha, hora, ubicacion, capacidad_maxima, tipo } = req.body;
    const id = req.params.id;

    // Verificar el número actual de inscritos
    pool.query("SELECT COUNT(*) AS inscritos_actuales FROM inscripciones WHERE evento_id = ? AND estado_inscripcion = 'inscrito'", [id], (err, result) => {
        if (err) {
            console.error("Error al verificar el número de inscritos:", err);
            return res.status(500).send("Error al verificar el número de inscritos");
        }

        const inscritosActuales = result[0].inscritos_actuales;
        const nuevaCapacidad = parseInt(capacidad_maxima, 10);

        // Verificar si la nueva capacidad es menor a la actual
        if (nuevaCapacidad < inscritosActuales) {
            return res.status(400).send("La capacidad máxima no puede ser menor al número de inscritos actuales");
        }

        // Actualizar el evento
        pool.query("UPDATE eventos SET titulo = ?, descripcion = ?, fecha = ?, hora = ?, ubicacion = ?, capacidad_maxima = ?, tipo = ? WHERE id = ?", 
            [titulo, descripcion, fecha, hora, ubicacion, capacidad_maxima, tipo, id], (err) => {
            if (err) {
                console.error("Error al actualizar el evento:", err);
                return res.status(500).send("Error al actualizar el evento");
            }

            // Verificar y actualizar los inscritos desde la lista de espera
            if (nuevaCapacidad > inscritosActuales) {
                const cupoDisponible = nuevaCapacidad - inscritosActuales;
                pool.query("SELECT usuario_id FROM inscripciones WHERE evento_id = ? AND estado_inscripcion = 'lista de espera' ORDER BY fecha_inscripcion ASC LIMIT ?", 
                    [id, cupoDisponible], (err, usuariosEnEspera) => {
                    if (err) {
                        console.error("Error al obtener usuarios en espera:", err);
                        return res.status(500).send("Error al obtener usuarios en espera");
                    }

                    if (usuariosEnEspera.length > 0) {
                        const idsUsuariosEnEspera = usuariosEnEspera.map(usuario => usuario.usuario_id);
                        const mensajes = usuariosEnEspera.map(usuario => [
                            usuario.usuario_id, 
                            `Usted ha pasado de la lista de espera a estar inscrito en el evento "${titulo}".`
                        ]);

                        pool.query("INSERT INTO mensajes (user_id, mensaje) VALUES ?", [mensajes], (err) => {
                            if (err) {
                                console.error("Error al insertar mensajes:", err);
                                return res.status(500).send("Error al insertar mensajes");
                            }

                            // Actualizar el estado de inscripción a "inscrito"
                            pool.query("UPDATE inscripciones SET estado_inscripcion = 'inscrito' WHERE usuario_id IN (?) AND evento_id = ?", 
                                [idsUsuariosEnEspera, id], (err) => {
                                if (err) {
                                    console.error("Error al actualizar usuarios en espera:", err);
                                    return res.status(500).send("Error al actualizar usuarios en espera");
                                }
                                res.redirect("/events");
                            });
                        });
                    } else {
                        res.redirect("/events");
                    }
                });
            } else {
                res.redirect("/events");
            }
        });
    });
});








app.get("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.log("error al borrar sesión");
        }
        else {
            res.redirect("/");
        }
    });
});

app.get("/update", (req, res) => {
    pool.query("SELECT * FROM facultades", (err, results) => {
        if (err) {
            console.log("error");
        }
        else {
            const user_id = req.session.userId;
            pool.query("SELECT nombre,correo,contrasenia,telefono,facultad FROM usuarios WHERE id=?", [user_id], (err, data_user) => {

                const { nombre, correo, contrasenia, telefono, facultad } = data_user[0];
                const usuario = { nombre, correo, contrasenia, telefono, facultad };
                if (err) {
                    console.log("algún dato del usuario no se procesó corrctamente");
                }
                res.render("update", { user: { nombre: req.session.nombre, correo: req.session.correo, rol: req.session.rol || null }, facultades: results, usuario: usuario });
            });
        }
    });
});

app.post("/update", (req, res) => {
    const { nombre, correo, contrasenia, telefono, facultad } = req.body;
    console.log('Datos recibidos:', req.body);
    pool.query("UPDATE usuarios SET nombre=?,correo=?,contrasenia=?,telefono=?,facultad=? WHERE id=?",
        [nombre, correo, contrasenia, telefono, facultad, req.session.userId], (err) => {
            if (err) {
                console.error("Error al actualizar el usuario");
            }
            res.json({ succes: true, message: "Datos actualizados correctamente" });
        }
    )
});

app.get("/inscribe", (req, res) => {
    const userId = req.session.userId;

    const query = `
        SELECT e.id, e.titulo, e.descripcion, e.fecha, e.hora, e.ubicacion, e.capacidad_maxima, e.tipo,
               COALESCE(i.estado_inscripcion, 'lista de espera') AS estado_inscripcion
        FROM eventos e
        LEFT JOIN inscripciones i ON e.id = i.evento_id AND i.usuario_id = ?
    `;
    console.log(eventos.estado_inscripcion);
    pool.query(query, [userId], (err, results) => {
        if (err) {
            console.error("Error en la consulta de eventos:", err);
            res.status(500).send("Error en la consulta de eventos.");
        } else {
            res.render("/", { eventos: results, userId });
        }
    });
});


app.post("/inscribe", (req, res) => {
    const { usuario_id, evento_id, estado_inscripcion } = req.body;

    const checkCapacityQuery = `
        SELECT e.capacidad_maxima, e.titulo, 
               (SELECT COUNT(*) FROM inscripciones WHERE evento_id = ? AND estado_inscripcion = 'inscrito') AS inscritos
        FROM eventos e
        WHERE e.id = ?
    `;

    pool.query(checkCapacityQuery, [evento_id, evento_id], (err, results) => {
        if (err) {
            console.error("Error al consultar la capacidad del evento:", err);
            return res.status(500).json({ success: false, message: "Error al procesar la inscripción." });
        }

        const { capacidad_maxima, inscritos, titulo } = results[0];
        let estado = inscritos >= capacidad_maxima ? 'lista de espera' : 'inscrito';
        let mensaje = "";

        if (estado === 'lista de espera') {
            mensaje = `Usted ha entrado en la lista de espera del evento "${titulo}" porque la capacidad máxima ha sido superada.`;
        } else {
            mensaje = `Usted se ha inscrito al evento "${titulo}".`;
        }

        pool.query("INSERT INTO inscripciones (usuario_id, evento_id, estado_inscripcion, fecha_inscripcion) VALUES (?, ?, ?, NOW())",
            [usuario_id, evento_id, estado], (err) => {
                if (err) {
                    console.error("Error al procesar la inscripción:", err);
                    return res.status(500).json({ success: false, message: "Error al procesar la inscripción." });
                }


                pool.query("INSERT INTO mensajes (user_id, mensaje) VALUES (?, ?)", [usuario_id, mensaje], (err) => {
                    if (err) {
                        console.error("Error al guardar el mensaje:", err);
                        return res.status(500).json({ success: false, message: "Error al guardar el mensaje." });
                    }

                    res.redirect("/");
                });
            }
        );
    });
});



app.get("/messages", (req, res) => {
    const user_id = req.session.userId;

    pool.query("SELECT id, mensaje, creado_en FROM mensajes WHERE user_id=?", [user_id], (err, results) => {
        if (err) {
            console.log("Error al obtener el mensaje");
        }

        res.render("messages", {
            user: {
                id: user_id,
                nombre: req.session.nombre,
                correo: req.session.correo,
                rol: req.session.rol || null

            },

            mensajes: results
        });
    });
});




app.get("/profile", (req, res) => {
    res.render("profile", {
        user: {
            nombre: req.session.nombre, correo: req.session.correo,
            telefono: req.session.telefono,
            facultad: req.session.facultad,
            rol: req.session.rol
        }
    });
});

app.get("/create-event", (req, res) => {
    pool.query("SELECT * FROM facultades", (err, results) => {
        if (err) {

        }
        else {
            res.render("create-event", { user: { nombre: req.session.nombre, correo: req.session.correo, rol: req.session.rol || null }, facultades: results });
        }
    });
});

app.post("/create-event", (req, res) => {
    const { titulo, descripcion, fecha, hora, ubicacion, capacidad_maxima, tipo } = req.body;
    const org_id = req.session.userId;

    if (!org_id) {
        console.log("No has iniciado sesión");
    }

    pool.query("INSERT INTO eventos (titulo,descripcion,fecha,hora,ubicacion,capacidad_maxima,organizador_id,tipo) VALUES (?,?,?,?,?,?,?,?)", [titulo, descripcion, fecha, hora, ubicacion, capacidad_maxima, org_id, tipo], (err) => {


        if (err) {
            return res.status(500).send("Error al crear evento");
        }
        else {

            res.redirect("/");
        }

    });
});

app.post("/delete/:id", (req, res) => {
    const { id } = req.params;
    const sql = `
        SELECT i.usuario_id, e.titulo 
        FROM inscripciones i
        INNER JOIN eventos e ON i.evento_id = e.id
        WHERE e.id = ?`;

    pool.query(sql, [id], (err, results) => {
        if (err) {
            console.error("Error al obtener los usuarios inscritos:", err);
            return res.status(500).send("Error al obtener los usuarios inscritos");
        }
        const inscritos = results;

        // Si no hay usuarios inscritos, eliminar el evento directamente
        if (inscritos.length === 0) {
            pool.query("DELETE FROM eventos WHERE id=?", [id], (err) => {
                if (err) {
                    console.error("Error al eliminar el evento:", err);
                    return res.status(500).send("Error al eliminar el evento");
                }
                console.log("Evento eliminado.");
                return res.redirect("/events");
            });
        } else {
            const titulo = inscritos[0].titulo;
            const mensaje = `El evento "${titulo}" ha sido eliminado por su organizador. Ya no estás inscrito en este evento.`;
            const mensajes = inscritos.map((usuario) => [usuario.usuario_id, mensaje]);

            pool.query("INSERT INTO mensajes (user_id,mensaje) VALUES ?", [mensajes], (err) => {
                if (err) {
                    console.error("Error al insertar mensajes:", err);
                    return res.status(500).send("Error al insertar mensajes");
                }

                pool.query("DELETE FROM inscripciones WHERE evento_id=?", [id], (err) => {
                    if (err) {
                        console.error("Error al eliminar inscripciones:", err);
                        return res.status(500).send("Error al eliminar inscripciones");
                    }

                    pool.query("DELETE FROM eventos WHERE id=?", [id], (err) => {
                        if (err) {
                            console.error("Error al eliminar el evento:", err);
                            return res.status(500).send("Error al eliminar el evento");
                        }

                        console.log("Evento y sus inscripciones eliminados.");
                        res.redirect("/events");
                    });
                });
            });
        }
    });
});

app.post("/delete_message/:id", (req, res) => {
    const { id } = req.params;



    pool.query("DELETE FROM mensajes WHERE id = ? ", [id], (err) => {
        if (err) {
            console.log("Error al borrar el mensaje:", err);
            return res.status(500).json({ success: false, message: "Error al borrar el mensaje." });
        }
        res.status(200).json({ success: true, message: "Mensaje eliminado con éxito." });
    });
});

app.post("/delete_inscription/:id", (req, res) => {
    const { id } = req.params;
    const userId = req.session.userId;


    pool.query("SELECT e.titulo FROM eventos e WHERE e.id = ?", [id], (err, results) => {
        if (err) {
            console.log("Error al obtener el título del evento:", err);
            return res.status(500).json({ success: false, message: "Error al obtener el título del evento." });
        }

        const eventoTitulo = results[0].titulo;


        pool.query("DELETE FROM inscripciones WHERE evento_id = ? AND usuario_id = ?", [id, userId], (err) => {
            if (err) {
                console.log("Error al borrar una inscripción:", err);
                return res.status(500).json({ success: false, message: "Error al borrar una inscripción." });
            }


            const mensajeEliminar = `Usted se ha quitado del evento "${eventoTitulo}".`;
            pool.query("INSERT INTO mensajes (user_id, mensaje) VALUES (?, ?)", [userId, mensajeEliminar], (err) => {
                if (err) {
                    console.log("Error al guardar el mensaje de eliminación:", err);
                    return res.status(500).json({ success: false, message: "Error al guardar el mensaje de eliminación." });
                }


                pool.query("SELECT e.titulo, i.usuario_id FROM inscripciones i JOIN eventos e ON i.evento_id = e.id WHERE i.evento_id = ? AND i.estado_inscripcion = 'lista de espera' ORDER BY i.fecha_inscripcion ASC LIMIT 1", [id], (err, results) => {
                    if (err) {
                        console.log("Error al obtener la lista de espera:", err);
                        return res.status(500).json({ success: false, message: "Error al obtener la lista de espera." });
                    }

                    if (results.length > 0) {
                        const waitlistedUser = results[0];

                        pool.query("UPDATE inscripciones SET estado_inscripcion = 'inscrito' WHERE evento_id = ? AND usuario_id = ?", [id, waitlistedUser.usuario_id], (err) => {
                            if (err) {
                                console.log("Error al actualizar el estado de inscripción:", err);
                                return res.status(500).json({ success: false, message: "Error al actualizar el estado de inscripción." });
                            }

                            const mensajeListaEspera = `Usted se ha pasado de la lista de espera a inscrito en el evento "${eventoTitulo}".`;

                            pool.query("INSERT INTO mensajes (user_id, mensaje) VALUES (?, ?)", [waitlistedUser.usuario_id, mensajeListaEspera], (err) => {
                                if (err) {
                                    console.log("Error al guardar el mensaje de lista de espera:", err);
                                    return res.status(500).json({ success: false, message: "Error al guardar el mensaje de lista de espera." });
                                }

                                return res.redirect("/inscriptions");
                            });
                        });
                    } else {
                        return res.redirect("/inscriptions");
                    }
                });
            });
        });
    });
});




app.post("/edit/:id", (req, res) => {
    const { id } = req.params;
    const {
        titulo,
        descripcion,
        fecha,
        hora,
        ubicacion,
        capacidad_maxima,
        tipo
    } = req.body;

    pool.query(
        "UPDATE eventos SET titulo=?, descripcion=?, fecha=?, hora=?, ubicacion=?, capacidad_maxima=?, tipo=? WHERE id=?",
        [titulo, descripcion, fecha, hora, ubicacion, capacidad_maxima, tipo, id],
        (err, result) => {
            if (err) {
                console.log("Error al actualizar el evento");
                return res.status(500).json({ success: false, message: "Error al actualizar el evento" });
            }

            pool.query(
                "UPDATE inscripciones SET tipo_inscripcion=? WHERE evento_id=?",
                [id],
                (err, result) => {
                    if (err) {
                        console.log("Error al actualizar la inscripción");
                        return res.status(500).json({ success: false, message: "Error al actualizar la inscripción" });
                    }

                    return res.status(200).json({ success: true, message: "Evento e inscripciones actualizadas correctamente" });
                }
            );
        }
    );
});

app.get("/inscriptions", (req, res) => {
    const searchTerm = req.query.q || '';
    const userId = req.session.userId;

    let sql = "SELECT E.id AS evento_id, E.titulo, E.descripcion, E.fecha, E.hora, E.ubicacion, E.capacidad_maxima, I.estado_inscripcion, I.fecha_inscripcion " +
        "FROM inscripciones I JOIN eventos E ON I.evento_id = E.id WHERE I.usuario_id = ?";
    let params = [userId];

    if (searchTerm) {
         sql += ` AND ( E.titulo LIKE ? OR E.descripcion LIKE ? OR E.fecha LIKE ? OR E.tipo LIKE ? OR E.ubicacion LIKE ? 
            OR E.capacidad_maxima LIKE ? ) `; 
        const wildcardSearch = `%${searchTerm}%`; 
        params.push(wildcardSearch, wildcardSearch, wildcardSearch, wildcardSearch, wildcardSearch, wildcardSearch);
     }

    pool.query(sql, params, (err, results) => {
        if (err) {
            console.log("error");
            res.status(500).send("Error en la consulta de inscripciones.");
        } else {
            res.render("inscriptions", { user: { nombre: req.session.nombre, correo: req.session.correo, rol: req.session.rol || null }, inscripciones: results, q: searchTerm });
        }
    });
});


app.get("/events", (req, res) => {
    const org_id = req.session.userId;
    const searchTerm = req.query.q || '';

    let query = ` SELECT e.id, e.titulo, e.descripcion, e.fecha, e.hora, e.ubicacion, e.capacidad_maxima, e.tipo, (SELECT COUNT(*) FROM inscripciones i WHERE i.evento_id = e.id AND i.estado_inscripcion = 'inscrito') AS inscritos FROM eventos e WHERE e.organizador_id = ? `;
    let params = [org_id];
    if (searchTerm) {
        query += `
            AND (
                titulo LIKE ? 
                OR descripcion LIKE ? 
                OR fecha LIKE ? 
                OR tipo LIKE ? 
                OR ubicacion LIKE ? 
                OR capacidad_maxima LIKE ?
            )
        `;
        const wildcardSearch = `%${searchTerm}%`;
        params.push(wildcardSearch, wildcardSearch, wildcardSearch, wildcardSearch, wildcardSearch, wildcardSearch);
    }

    pool.query(query, params, (err, results) => {
        if (err) {
            console.log("error");
            res.status(500).send("Error en la consulta de eventos.");
        } else {
            res.render("events", { user: { nombre: req.session.nombre, correo: req.session.correo, rol: req.session.rol || null }, eventos: results, q: searchTerm });
        }
    });
});




app.get("/listAlumns", (req, res) => {
    const sql = `
        SELECT 
            I.usuario_id, 
            U.nombre AS usuario_nombre, 
            E.titulo AS evento_nombre, 
            I.estado_inscripcion, 
            I.fecha_inscripcion 
        FROM inscripciones I 
        JOIN usuarios U ON I.usuario_id = U.id 
        JOIN eventos E ON I.evento_id = E.id
    `;

    pool.query(sql, (err, results) => {
        if (err) {
            console.error("Error querying the database:", err);
            return res.status(500).send("Error querying the database.");
        }

        res.render("listAlumns", { inscripciones: results, user: { nombre: req.session.nombre, correo: req.session.correo, rol: req.session.rol || null } });
    });
});



app.get("/forget-password", (req, res) => {
    res.render("/forget-password");
});



app.listen(3000, (req, res) => {
    console.log("Escuchando en el puerto 3000");
});