/**
 * ReglasREST.js
 * @author Aitor Benítez Estruch
 * @date: 2021/11/03
 * 
 * @description:
 * Archivo con las reglas REST para hacer peticiones a la bd. Ver el documento Reglas REST (carpeta Docs) 
 * para ver la descripció de las peticiones.
 * 
 */


module.exports.cargar = function( servidorExpress, laLogica ) {

    // .......................................................
    // POST /mediciones
    // .......................................................
    servidorExpress.post(
        '/mediciones',
        async function( peticion, respuesta ){
            console.log( " * POST /mediciones" )
            console.log(peticion.body)
            var datos =  peticion.body
            console.log( "datos" )
            console.log( datos[0] )
            console.log( "datos22222222222222222222222" )

            console.log( JSON.parse(datos[0]) )
            console.log( "datos333333333333333333333333" )
            console.log( JSON.parse(datos[0]).medida )
           

            var res = await laLogica.guardarMediciones(datos);
            
            console.log(res)
            if(res == 200){
                respuesta.status(200).send("Se ha dado de alta una nueva medida\n")
            }else{
                respuesta.status(400).sendStatus(res)
            }

        }
    ) // post mediciones

    
    // .......................................................
    // GET /todasLasMediciones
    // .......................................................
    servidorExpress.get(
        '/todasLasMediciones', 
        async function( peticion, respuesta){
            console.log(" * GET/todasLasMediciones ")

            var res = await laLogica.obtenerTodasLasMediciones()
            console.log(res)
            if(res.length == 0){
                respuesta.status(404).send("No se ha encontrado ninguna medida")
                return
            }else if (res == 400){
                respuesta.status(400).send("Error en la base de datos")
            }

            //Ok
            respuesta.send(res)
            return
            
    })//get todasLasMediciones

    // .......................................................
    // GET /ultimasMediciones
    // .......................................................
    servidorExpress.get(
        '/ultimasMediciones/:cuantas', 
        async function( peticion, respuesta){
            console.log(" * GET/ultimasMediciones ")

            var cuantas = peticion.params.cuantas
            console.log(cuantas)

            var res = await laLogica.obtenerUltimasMediciones( cuantas )
            console.log(res)
            if(res.length == 0){
                respuesta.status(404).send("No se ha encontrado ninguna medida")
                return
            }else if (res == 400){
                respuesta.status(400).send("Error en la base de datos")
                return
            }

            //Ok
            respuesta.send(res)
            return
            
    })//get ultimasMediciones


    // .......................................................
    // POST /sensor
    // .......................................................
    servidorExpress.post(
        '/sensor',
        async function(peticion, respuesta){
            console.log(" * POST/sensor ")

            var datos =  peticion.body;

            console.log(datos)

            //Comprobamos si el sensor ya está añadido en la tabla Sensors (sólo puede haber una MAC para cada sensor)
            var sensor = await laLogica.buscarSensor(datos.macSensor);
            console.log(sensor)

            //Si la respuesta es 404 significa que no hay ningun sensor con esa MAC almacenada y procedemos a guardarlo
            if(sensor == 404){
                var res = await laLogica.guardarSensor(datos);

                console.log(res)
                if(res == 200){
                    respuesta.status(200).send("Se ha dado de alta un nuevo sensor\n")
                }else{
                    respuesta.status(400).sendStatus(res)
                }
            }else{
                respuesta.status(200).send("El sensor ya está registrado\n")
            }
        }
    )//() post sensor


    // .......................................................
    // GET /todosLosSensores
    // .......................................................
    servidorExpress.get(
        '/todosLosSensores', 
        async function( peticion, respuesta){
            console.log(" * GET/todosLosSensores ")

            var res = await laLogica.obtenerTodosLosSensores()
            console.log(res)
            if(res.length == 0){
                respuesta.status(404).send("No se ha encontrado ningun sensor")
                return
            }else if (res == 400){
                respuesta.status(400).send("Error en la base de datos")
                return
            }

            //Ok
            respuesta.send(res)
            return
            
    })//get todosLosSensores

     // .......................................................
    // GET /sensor?mac= 
    // .......................................................
    servidorExpress.get(
        '/sensor', 
        async function( peticion, respuesta){
            console.log(" * GET/sensor ")

            var mac = peticion.query.mac;

            var res = await laLogica.buscarSensor(mac)
            console.log(res)
            if(res.length == 0){
                respuesta.status(404).send("No se ha encontrado ningun sensor")
                return
            }else if (res == 400){
                respuesta.status(400).send("Error en la base de datos")
                return
            }

            //Ok
            respuesta.send(res)
            return
            
    })//get todosLosSensores


}
