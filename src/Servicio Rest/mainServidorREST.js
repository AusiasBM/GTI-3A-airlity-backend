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
//
// .....................................................................




// .....................................................................
// main()
// .....................................................................
async function main() {

    var laLogica = new LogicaNegocio();
    


    // Creo el servidor
    var servidorExpress = express()

   
    servidorExpress.use ( express.json() )
    servidorExpress.use (bodyParser.text({type : 'application/json'}) )
    servidorExpress.use(express.static("public"));
    servidorExpress.set("port", process.env.port || port );


    // Cargo las reglas REST
    var reglas = require( "./reglasREST.js")
    reglas.cargar( servidorExpress, laLogica )

    // Arranco el servidor
    var servicio = servidorExpress.listen( servidorExpress.get("port"), function() {
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