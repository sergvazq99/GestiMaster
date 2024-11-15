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
    res.render("index", {user:{ nombre: req.session.nombre,correo:req.session.correo,rol: req.session.rol || null }});
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

app.get("/inscribe",(req,res)=>{
    pool.query("SELECT * FROM eventos",(err,results)=>{
        if(err){
            console.log("error")
        }
        else{
            res.render("inscribe",{eventos:results});
        }
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
    const{titulo,descripcion,fecha,hora,ubicacion,capacidad_maxima}=req.body;
    const org_id=req.session.userId;

    if(!org_id){
        console.log("No has iniciado sesión");
    }

    pool.query("INSERT INTO eventos (titulo,descripcion,fecha,hora,ubicacion,capacidad_maxima,organizador_id) VALUES (?,?,?,?,?,?,?)",[titulo,descripcion,fecha,hora,ubicacion,capacidad_maxima,org_id],(err)=>{


        if(err){
            console.log("error al crear un evento");
        }
        else{
            console.log("evento creado");
            res.redirect("/");
        }
            
    });
});

app.get("/events",(req,res)=>{
    pool.query("SELECT titulo,descripcion,fecha,hora,ubicacion,capacidad_maxima FROM eventos",(err,results)=>{
        if(err){
            console.log("error");
        }
        else{
            res.render("events",{eventos:results});
        }
    });
});

app.listen(3000,(req,res)=>{
    console.log("Escuchando en el puerto 3000");
});