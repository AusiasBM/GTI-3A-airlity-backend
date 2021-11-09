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
const bodyParser = require( 'body-parser' )
const path = require('path')
const LogicaNegocio = require('../logica/logicaNegocio.js')
const mongoose = require('mongoose');
const port = 3500


// .....................................................................
// main()
// .....................................................................
async function main() {

    var laLogica = new LogicaNegocio();
    


    // Creo el servidor
    var app = express()

    app.use(function (req, res, next) {

        // Website you wish to allow to connect
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
      
        // Request methods you wish to allow
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
      
        // Request headers you wish to allow
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
      
        // Set to true if you need the website to include cookies in the requests sent
        // to the API (e.g. in case you use sessions)
        res.setHeader('Access-Control-Allow-Credentials', true);
      
        // Pass to next layer of middleware
        next();
      });
      
    app.use ( express.json() )
    app.use (bodyParser.text({type : 'application/json'}) )
    app.use(express.static("public"));
    app.set("port", process.env.port || port );


    // Cargo las reglas REST
    var reglas = require( "./reglasREST.js")
    reglas.cargar( app, laLogica )

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