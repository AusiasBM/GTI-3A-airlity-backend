/**
 * mainServidorREST.js
 * @author Aitor Benítez Estruch
 * @date: 2021/10/03
 * 
 * @description:
 * Archivo para configurar el servidor.
 * 
 */

const express = require( 'express' )
const dotenv = require('dotenv');
const reglas = require( "./reglasREST.js")
const bodyParser = require( 'body-parser' )
const path = require('path')
const LogicaNegocio = require('../logica/logicaNegocio.js')
const session = require('express-session')
const jwt = require('jsonwebtoken');
const port = 3500


// .....................................................................
// main()
// .....................................................................
async function main() {

    var laLogica = new LogicaNegocio();
    

    // Creo el servidor
    var app = express()

    //Para usar variables de entorno configuradas (recordar crear .gitignore del archivo .env)
    dotenv.config();

    app.use(function (req, res, next) {

        // Website you wish to allow to connect
        res.setHeader('Access-Control-Allow-Origin', '*');
      
        // Request methods you wish to allow
        res.setHeader('Access-Control-Allow-Methods', '*');
      
        // Request headers you wish to allow
        res.setHeader('Access-Control-Allow-Headers', '*');
      
        // Set to true if you need the website to include cookies in the requests sent
        // to the API (e.g. in case you use sessions)
        //res.setHeader('Access-Control-Allow-Credentials', true);
      
        // Pass to next layer of middleware
        next();
      });
      
    app.use ( express.json() )
    app.use (bodyParser.text({type : 'application/json'}) )
    //app.use(express.static("public"));
    
    
    app.use(session({
        secret: 'gti3a_tricoenvironment',
        resave: false,
        saveUninitialized: true
        
    }))

    app.set("port", port );

    // Cargo las reglas REST
    reglas.cargar( app, laLogica, process.env.TOKEN_SECRET )

    // Arranco el servidor
    var servicio = app.listen( app.get("port"), function() {
        console.log( "servidor REST escuchando en el puerto 3500")
    })

    // capturo control-c para cerrar el servicio ordenadamente
    process.on("SIGINT", function() {
        console.log (" terminando ")
        servicio.close ()
    })

} // ()



// .....................................................................
// .....................................................................
main()
// .....................................................................
// .....................................................................