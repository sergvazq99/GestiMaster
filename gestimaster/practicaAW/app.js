"use strict"
const express=require("express");
const session = require("express-session");
const mysql=require("mysql");
const path=require("path");
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


app.get("/",(req,res)=>{
    res.render("index", {user:{ nombre: req.session.nombre,correo:req.session.correo,rol: req.session.rol|| null }});
});

app.get("/login",(req,res)=>{
    res.render("login");
});

app.post("/login",(req,res)=>{
    const {correo,contrasenia}=req.body;
    pool.query("SELECT * FROM usuarios WHERE correo=? AND contrasenia=?",[correo,contrasenia],(err,results)=>{
        if(err){
            console.log("error");
        }
        else if(results.length>0){
            req.session.userId = results[0].id;
            req.session.nombre = results[0].nombre;
            req.session.correo=results[0].correo;
            req.session.telefono=results[0].telefono;
            req.session.facultad=results[0].facultad;
            req.session.contrasenia=results[0].contrasenia;
            req.session.rol=results[0].rol;
            res.redirect("/");
        }
        else{
            console.log("Credenciales incorrectas");
        }
    });
    
});

app.get("/register",(req,res)=>{
    pool.query("SELECT * FROM facultades",(err,results)=>{
        if(err){
            console.log("error");
        }
        else{
            res.render("register",{facultades:results});
        }
    });
    
});

app.post("/register",(req,res)=>{
    const{nombre,correo,telefono,facultad,rol,contrasenia}=req.body;
    pool.query("SELECT correo FROM usuarios WHERE correo=?",[correo],(err,results)=>{
        if(err){
            console.error("Error en la consulta de verificación:", err);
        }
        else if(results.length>0){
            
            console.log("el correo ya está registrado");
        }
        else{
            pool.query("INSERT INTO usuarios (nombre,correo,telefono,facultad,rol,contrasenia) VALUES (?,?,?,?,?,?)",[nombre,correo,telefono,facultad,rol,contrasenia],(err)=>{
                if(err){
                    console.log("error");
                    console.log(nombre,correo,telefono,facultad,rol,contrasenia);
                }
                else{
                    console.log("tu rol es: "+rol);
                    res.redirect("/");
                }
            });
        }
    });
});

app.get("/logout",(req,res)=>{
   req.session.destroy(err=>{
        if(err){
            console.log("error al borrar sesión");
        }
        else{
            res.redirect("/");
        }
   });
});

app.get("/update",(req,res)=>{
    pool.query("SELECT * FROM facultades",(err,results)=>{
        if(err){
            console.log("error");
        }
        else{
            const user_id=req.session.userId;
            pool.query("SELECT nombre,correo,contrasenia,telefono,facultad FROM usuarios WHERE id=?",[user_id],(err,data_user)=>{
                
                const{nombre,correo,contrasenia,telefono,facultad}=data_user[0];
                const usuario = { nombre, correo, contrasenia, telefono, facultad };
                if(err){
                    console.log("algún dato del usuario no se procesó corrctamente");
                }
                res.render("update",{facultades:results,usuario:usuario});
            });
        }
    });
});

app.post("/update",(req,res)=>{
    const{nombre,correo,contrasenia,telefono,facultad}=req.body;
    console.log('Datos recibidos:', req.body);
    pool.query("UPDATE usuarios SET nombre=?,correo=?,contrasenia=?,telefono=?,facultad=? WHERE id=?",
        [nombre,correo,contrasenia,telefono,facultad,req.session.userId],(err)=>{
            if(err){
                console.error("Error al actualizar el usuario");
            }
            res.json({succes:true,message:"Datos actualizados correctamente"});
        }
    )
});

app.get("/inscribe",(req,res)=>{
    const userId=req.session.userId;
    pool.query("SELECT id,titulo,descripcion,fecha,hora,ubicacion,capacidad_maxima,tipo FROM eventos",(err,results)=>{
        if(err){
            console.log("error");
        }
        else{
            res.render("inscribe",{eventos:results,userId});
        }
    });
});

app.post("/inscribe",(req,res)=>{
    const{evento_id,fecha_inscripcion,tipo_inscripcion}=req.body;
    const usuario_id=req.session.userId;

    pool.query("SELECT * FROM inscripciones WHERE usuario_id = ? AND evento_id = ? AND estado_inscripcion IN ('inscrito', 'lista de espera')",
        [usuario_id, evento_id], (err, results)=>{
            if (err) {
                console.error("Error al verificar la inscripción:", err);
                return res.status(500).json({ success: false, message: "Error al procesar la inscripción." });
            }
            if (results.length > 0) {
                return res.status(400).json({ success: false, message: "Ya te has inscrito en este evento." });
            }

            const sql="SELECT capacidad_maxima, COUNT(*) AS inscritos FROM eventos " +
            "LEFT JOIN inscripciones ON eventos.id = inscripciones.evento_id " +
            "AND inscripciones.estado_inscripcion = 'inscrito' " +
            "WHERE eventos.id = ? GROUP BY eventos.id, eventos.capacidad_maxima";
    
        pool.query(sql,[evento_id],(err,results)=>{
            if (err) {
                console.error("Error al consultar la capacidad del evento:", err);
                return res.status(500).json({ success: false, message: "Error al procesar la inscripción." });
            }
            if (results.length === 0) {
                return res.status(404).json({ success: false, message: "Evento no encontrado." });
            }
    
            const{capacidad_maxima,inscritos}=results[0];
            let estado="inscrito";
            console.log(inscritos);
            console.log(capacidad_maxima)
            if(inscritos>=capacidad_maxima){
                estado="lista de espera";
            }
            
    
            pool.query("INSERT INTO inscripciones (usuario_id,evento_id,estado_inscripcion,fecha_inscripcion,tipo_inscripcion) VALUES (?,?,?,NOW(),?)",
            [usuario_id,evento_id,estado,tipo_inscripcion],(err)=>{
                if(err){
                    return res.status(500).json({ success: false, message: "Error al procesar la inscripción." });
                }
                else{
                    
                    pool.query("SELECT organizador_id,titulo FROM eventos WHERE id=?",[evento_id],(err,results)=>{
                        if(err||results.length===0){
                            console.log("error al obtener el id");
                        }
                        const org_id=results[0].organizador_id;
                        const titulo=results[0].titulo;
                        const mensaje=`Un nuevo asistente se ha inscrito en tu evento "${titulo}"`;
    
                        pool.query("INSERT INTO mensajes (user_id,mensaje) VALUES (?,?)",[org_id,mensaje],(err)=>{
                            if(err){
                                console.log("error al guardar el mensaje");
                            }
                            res.status(200).json({ success: true, message: "Inscripción exitosa." });

                            
                        });
                    });
                }
            });
        });
    });


    
});

app.get("/messages",(req,res)=>{
    const user_id=req.session.userId;
    pool.query("SELECT mensaje,creado_en FROM mensajes WHERE user_id=?",[user_id],(err,results)=>{
        if(err){
            console.log("Error al obtener el mensaje");
        }
        res.render("messages",{mensajes:results});
        
    });
});

app.get("/change-photo",(req,res)=>{
    res.render("change-photo");
});

app.get("/profile",(req,res)=>{
        res.render("profile",{user:{nombre: req.session.nombre,correo:req.session.correo,
        telefono:req.session.telefono,
        facultad:req.session.facultad,
        rol: req.session.rol}});
});

app.get("/create-event",(req,res)=>{
    pool.query("SELECT * FROM facultades",(err,results)=>{
        if(err){

        }
        else{
            res.render("create-event",{facultades:results});
        }
    });
});

app.post("/create-event",(req,res)=>{
    const{titulo,descripcion,fecha,hora,ubicacion,capacidad_maxima,tipo}=req.body;
    const org_id=req.session.userId;

    if(!org_id){
        console.log("No has iniciado sesión");
    }

    pool.query("INSERT INTO eventos (titulo,descripcion,fecha,hora,ubicacion,capacidad_maxima,organizador_id,tipo) VALUES (?,?,?,?,?,?,?,?)",[titulo,descripcion,fecha,hora,ubicacion,capacidad_maxima,org_id,tipo],(err)=>{


        if(err){
            return res.status(500).send("Error al crear evento");
        }
        else{
            
            res.redirect("/");
        }
            
    });
});

app.post("/delete/:id",(req,res)=>{
    const {id}=req.params;
    const sql=`
        SELECT i.usuario_id, e.titulo 
        FROM inscripciones i
        INNER JOIN eventos e ON i.evento_id = e.id
        WHERE e.id = ?`;

    pool.query(sql,[id],(err,results)=>{
        if (err) {
            console.error("Error al obtener los usuarios inscritos:", err);
            return res.status(500).send("Error al obtener los usuarios inscritos");
        }
        const inscritos = results;
        if (inscritos.length === 0) {
            console.log("No hay usuarios inscritos en el evento.");
            return res.status(404).send("No hay usuarios inscritos en el evento");
        }
        const titulo = inscritos[0].titulo;
        const mensaje = `El evento "${titulo}" ha sido eliminado por su organizador. Ya no estás inscrito en este evento.`;
        const mensajes = inscritos.map((usuario) => [usuario.usuario_id, mensaje]);
        pool.query("INSERT INTO mensajes (user_id,mensaje) VALUES ?",[mensajes],(err)=>{
            if (err) {
                console.error("Error al insertar mensajes:", err);
                return res.status(500).send("Error al insertar mensajes");
            }
            pool.query("DELETE FROM inscripciones WHERE evento_id=?",[id],(err)=>{
                if (err) {
                    console.error("Error al eliminar inscripciones:", err);
                    return res.status(500).send("Error al eliminar inscripciones");
                }
                pool.query("DELETE FROM eventos WHERE id=?",[id],(err)=>{
                    
                    res.redirect("/");
                    
                });
            });
        });
    }); 
});

app.post("/delete_inscription/:id",(req,res)=>{
    const{id}=req.params;
    pool.query("DELETE FROM inscripciones WHERE evento_id=?",[id],(err)=>{
        if(err){
            console.log("error al borrar una inscripción");
        }
        else{
            res.json({ success: true, message: "Inscripción eliminada correctamente" });
        }
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

app.get("/inscriptions",(req,res)=>{
    const org_id=req.session.userId;
    const sql="SELECT E.id AS evento_id,E.titulo, E.descripcion, E.fecha,E.hora,E.ubicacion,E.capacidad_maxima,I.estado_inscripcion,"+
    "I.fecha_inscripcion,I.tipo_inscripcion AS tipo_inscripcion FROM inscripciones I JOIN eventos E ON I.evento_id = E.id WHERE I.usuario_id = ?";
            
    pool.query(sql,[req.session.userId],(err,results)=>{
        if(err){
            console.log("error");
        }
        else{
            res.render("inscriptions",{inscripciones:results});
        }
    });
});

app.get("/events",(req,res)=>{
    const org_id=req.session.userId;
    pool.query("SELECT id,titulo,descripcion,fecha,hora,ubicacion,capacidad_maxima,tipo FROM eventos WHERE organizador_id=?",[org_id],(err,results)=>{
        if(err){
            console.log("error");
        }
        else{
            res.render("events",{eventos:results});
        }
    });
});




app.get("/forget-password",(req,res)=>{
    res.render("/forget-password");
});



app.listen(3000,(req,res)=>{
    console.log("Escuchando en el puerto 3000");
});