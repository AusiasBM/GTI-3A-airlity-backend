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

 const jwt = require('jsonwebtoken')

 // middleware to validate token (rutas protegidas)
 const verifyToken = (req, res, next) => {
    var token = req.headers['authorization']
     if (!token) return res.status(401).json({ error: 'Acceso denegado' })
     try {
        
        jwt.verify(token, process.env.TOKEN_SECRET, function(err, token) {
            if (err) {
              return res.status(401).send({
                ok: false,
                message: 'Toket inválido'
              });
            } else {
              req.token = token
              next() // continuamos
            }
          });
        
     } catch (error) {
         res.status(400).json({error: 'token no es válido'})
     }
 }


module.exports.cargar = function( servidorExpress, laLogica ) {


    // ------------------------------------------------------------------------------------------------
    // ------------------------------------------------------------------------------------------------
    // Reglas mediciones
    // ------------------------------------------------------------------------------------------------
    // ------------------------------------------------------------------------------------------------


    // .......................................................
    // POST /mediciones
    // .......................................................
    servidorExpress.post(
        '/mediciones', verifyToken,
        async function( peticion, respuesta ){
            console.log( " * POST /mediciones" )
            console.log(peticion.body)
            //var datos =  peticion.body

            var datos = [
                '{"macSensor":"00:00:00:00:00:00","tipoMedicion":"O3", "medida":123,"temperatura": 10,"humedad": 100, "latitud":38.99586,"longitud":-0.166152,"fecha":1234567890123}',
                '{"macSensor":"00:00:00:00:00:00","tipoMedicion":"O3", "medida":456,"temperatura": 10,"humedad": 100, "latitud":38.99586,"longitud":-0.166152,"fecha":1234567890123}'
            ]
            //A ver como estan organizados los datos...
            console.log( "datos" )
            console.log( datos[0] )

            console.log( "datos2" )
            console.log( JSON.parse(datos[0]) )

            console.log( "datos3" )
            console.log( JSON.parse(datos[0]).medida )
           
            var id = peticion.token.id;
            console.log(id)

            var res = await laLogica.guardarMediciones(id, datos);
            
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
        '/todasLasMediciones', verifyToken,
        async function( peticion, respuesta){
            console.log(" * GET/todasLasMediciones ")

            var res = await laLogica.obtenerTodasLasMediciones()
            //console.log(res)
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
            }else if (res == 500){
                respuesta.status(500).send("Error en el servidor")
                return
            }

            //Ok
            respuesta.send(res)
            return
            
    })//get ultimasMediciones



    // .......................................................
    // GET /estadisticasMedicionesUsuario
    //
    // Mètode de provaa!!!!!!!!!
    //
    // .......................................................
    servidorExpress.get(
        '/estadisticasMedicionesUsuario', /*verifyToken,*/
        async function(peticion, respuesta){
            console.log(' * GET/ estadisticasMedicionesUsuario?fechaIni=FechaInicial&fechaFin=FechaFinal')

            var fechaIni = parseInt(peticion.query.fechaIni);
            var fechaFin = parseInt(peticion.query.fechaFin);
            console.log(fechaIni)
            console.log(fechaFin)

            /*
            var id = peticion.token.id;

            //Obtenemos la fecha de hoy a medianoche en milisegundos (mm-dd-yyyy 00:00:0000 -> a milisegundos)
            //resultado.fecha = d.getMonth() +1 + "-" + d.getDate() + "-" + d.getFullYear()
            //let fechaInicio = Date.parse(resultado.fecha)

            var res = await laLogica.getMedicionesDeUsuarioPorTiempo(id, fechaIni, fechaFin );

           */

            var res = [

                {idUsuario:1,
                    macSensor: "00:00:00:00:00:00",
                    tipoMedicion: 'CO',
                    medida: 15.0,
                    temperatura: 20,
                    humedad: 64,
                    latitud: 123.3,
                    longitud: 321.1,
                    fecha: Date.now() - 40707000
                },
                {idUsuario:1,
                    macSensor: "00:00:00:00:00:00",
                    tipoMedicion: 'CO',
                    medida: 12.0,
                    temperatura: 20,
                    humedad: 64,
                    latitud: 123.3,
                    longitud: 321.1,
                    fecha: Date.now() - 40706000
                },
                {idUsuario:1,
                    macSensor: "00:00:00:00:00:00",
                    tipoMedicion: 'CO',
                    medida: 10.0,
                    temperatura: 20,
                    humedad: 64,
                    latitud: 123.3,
                    longitud: 321.1,
                    fecha: Date.now() - 20702000
                },
                {idUsuario:1,
                    macSensor: "00:00:00:00:00:00",
                    tipoMedicion: 'CO',
                    medida: 5.0,
                    temperatura: 20,
                    humedad: 64,
                    latitud: 123.3,
                    longitud: 321.1,
                    fecha: Date.now() - 15707000
                },
                {idUsuario:1,
                    macSensor: "00:00:00:00:00:00",
                    tipoMedicion: 'CO',
                    medida: 6.0,
                    temperatura: 20,
                    humedad: 64,
                    latitud: 123.3,
                    longitud: 321.1,
                    fecha: Date.now() - 15706000
                },
                {idUsuario:1,
                    macSensor: "00:00:00:00:00:00",
                    tipoMedicion: 'CO',
                    medida: 4.0,
                    temperatura: 20,
                    humedad: 64,
                    latitud: 123.3,
                    longitud: 321.1,
                    fecha: Date.now() - 15702000
                },
                {idUsuario:1,
                    macSensor: "00:00:00:00:00:00",
                    tipoMedicion: 'CO',
                    medida: 28.0,
                    temperatura: 20,
                    humedad: 64,
                    latitud: 123.3,
                    longitud: 321.1,
                    fecha: Date.now() - 10707000
                },
                {idUsuario:1,
                    macSensor: "00:00:00:00:00:00",
                    tipoMedicion: 'CO',
                    medida: 30.0,
                    temperatura: 20,
                    humedad: 64,
                    latitud: 123.3,
                    longitud: 321.1,
                    fecha: Date.now() - 10706000
                },
                {idUsuario:1,
                    macSensor: "00:00:00:00:00:00",
                    tipoMedicion: 'CO',
                    medida: 27.0,
                    temperatura: 20,
                    humedad: 64,
                    latitud: 123.3,
                    longitud: 321.1,
                    fecha: Date.now() - 10702000
                },
                {idUsuario:1,
                    macSensor: "00:00:00:00:00:00",
                    tipoMedicion: 'CO',
                    medida: 29.0,
                    temperatura: 20,
                    humedad: 64,
                    latitud: 123.3,
                    longitud: 321.1,
                    fecha: Date.now() - 10701000
                },
                {idUsuario:1,
                macSensor: "00:00:00:00:00:00",
                tipoMedicion: 'CO',
                medida: 15.0,
                temperatura: 20,
                humedad: 64,
                latitud: 123.3,
                longitud: 321.1,
                fecha: Date.now() - 505000
                },
                {idUsuario:1,
                    macSensor: "00:00:00:00:00:00",
                    tipoMedicion: 'CO',
                    medida: 15.0,
                    temperatura: 20,
                    humedad: 64,
                    latitud: 123.3,
                    longitud: 321.1,
                    fecha: Date.now() - 504000
                },
                {idUsuario:1,
                    macSensor: "00:00:00:00:00:00",
                    tipoMedicion: 'CO',
                    medida: 15.0,
                    temperatura: 20,
                    humedad: 64,
                    latitud: 123.3,
                    longitud: 321.1,
                    fecha: Date.now() - 503000
                },
                {idUsuario:1,
                    macSensor: "00:00:00:00:00:00",
                    tipoMedicion: 'CO',
                    medida: 15.0,
                    temperatura: 20,
                    humedad: 64,
                    latitud: 123.3,
                    longitud: 321.1,
                    fecha: Date.now() - 502000
                },
                {idUsuario:1,
                    macSensor: "00:00:00:00:00:00",
                    tipoMedicion: 'CO',
                    medida: 15.0,
                    temperatura: 20,
                    humedad: 64,
                    latitud: 123.3,
                    longitud: 321.1,
                    fecha: Date.now() - 501000
                },
                {idUsuario:1,
                    macSensor: "00:00:00:00:00:00",
                    tipoMedicion: 'CO',
                    medida: 15.0,
                    temperatura: 20,
                    humedad: 64,
                    latitud: 123.3,
                    longitud: 321.1,
                    fecha: Date.now() - 105000
                },
                {idUsuario:1,
                    macSensor: "00:00:00:00:00:00",
                    tipoMedicion: 'CO',
                    medida: 15.0,
                    temperatura: 20,
                    humedad: 64,
                    latitud: 123.3,
                    longitud: 321.1,
                    fecha: Date.now() - 104000
                },
                {idUsuario:1,
                    macSensor: "00:00:00:00:00:00",
                    tipoMedicion: 'CO',
                    medida: 17.0,
                    temperatura: 20,
                    humedad: 64,
                    latitud: 123.3,
                    longitud: 321.1,
                    fecha: Date.now() - 103000
                },
                {idUsuario:1,
                    macSensor: "00:00:00:00:00:00",
                    tipoMedicion: 'CO',
                    medida: 22.0,
                    temperatura: 20,
                    humedad: 64,
                    latitud: 123.3,
                    longitud: 321.1,
                    fecha: Date.now() - 102000
                },
                {idUsuario:1,
                    macSensor: "00:00:00:00:00:00",
                    tipoMedicion: 'CO',
                    medida: 23.0,
                    temperatura: 20,
                    humedad: 64,
                    latitud: 123.3,
                    longitud: 321.1,
                    fecha: Date.now() - 101000
                },
                {idUsuario:1,
                    macSensor: "00:00:00:00:00:00",
                    tipoMedicion: 'CO',
                    medida: 21.0,
                    temperatura: 20,
                    humedad: 64,
                    latitud: 123.3,
                    longitud: 321.1,
                    fecha: Date.now() - 100000
                }     
            ]

            //console.log(res);


            var estadisticas = laLogica.obtenerEstadisticas(res, 20)

            console.log(estadisticas);

            if(estadisticas != null){
                respuesta.send(estadisticas)
            }else{
                respuesta.status(500).send("Ha habido un problema");
            }
            
        }
    )


        // .......................................................
    // GET /estadisticasMedicionesUsuario
    //
    // Mètode de provaa!!!!!!!!!
    //
    // .......................................................
    servidorExpress.get(
        '/datosGraficaUsuario', /*verifyToken,*/ 
        async function(peticion, respuesta){
            console.log(' * GET/ datosGraficaUsuario?fechaIni=FechaInicial&fechaFin=FechaFinal')

            var fechaIni = parseInt(peticion.query.fechaIni);
            var fechaFin = parseInt(peticion.query.fechaFin);
            console.log(fechaIni)
            console.log(fechaFin)

            /*resultado.fecha = d.getMonth() +1 + "-" + d.getDate() + "-" + d.getFullYear()

            var id = peticion.token.id;
            //Obtenemos la fecha de hoy a medianoche en milisegundos (mm-dd-yyyy 00:00:0000 -> a milisegundos)
            let fechaInicio = Date.parse(resultado.fecha)
            var res = await laLogica.getMedicionesDeUsuarioPorTiempo(id, fechaInicio, Date.now() );

            if(res = 500){
                respuesta.status(200).sendStatus(res)
            }*/

            var res = [

                {idUsuario:1,
                    macSensor: "00:00:00:00:00:00",
                    tipoMedicion: 'CO',
                    medida: 15.0,
                    temperatura: 20,
                    humedad: 64,
                    latitud: 123.3,
                    longitud: 321.1,
                    fecha: Date.now() - 40707000
                },
                {idUsuario:1,
                    macSensor: "00:00:00:00:00:00",
                    tipoMedicion: 'CO',
                    medida: 12.0,
                    temperatura: 20,
                    humedad: 64,
                    latitud: 123.3,
                    longitud: 321.1,
                    fecha: Date.now() - 40706000
                },
                {idUsuario:1,
                    macSensor: "00:00:00:00:00:00",
                    tipoMedicion: 'CO',
                    medida: 10.0,
                    temperatura: 20,
                    humedad: 64,
                    latitud: 123.3,
                    longitud: 321.1,
                    fecha: Date.now() - 20702000
                },
                {idUsuario:1,
                    macSensor: "00:00:00:00:00:00",
                    tipoMedicion: 'CO',
                    medida: 5.0,
                    temperatura: 20,
                    humedad: 64,
                    latitud: 123.3,
                    longitud: 321.1,
                    fecha: Date.now() - 15707000
                },
                {idUsuario:1,
                    macSensor: "00:00:00:00:00:00",
                    tipoMedicion: 'CO',
                    medida: 6.0,
                    temperatura: 20,
                    humedad: 64,
                    latitud: 123.3,
                    longitud: 321.1,
                    fecha: Date.now() - 15706000
                },
                {idUsuario:1,
                    macSensor: "00:00:00:00:00:00",
                    tipoMedicion: 'CO',
                    medida: 4.0,
                    temperatura: 20,
                    humedad: 64,
                    latitud: 123.3,
                    longitud: 321.1,
                    fecha: Date.now() - 15702000
                },
                {idUsuario:1,
                    macSensor: "00:00:00:00:00:00",
                    tipoMedicion: 'CO',
                    medida: 28.0,
                    temperatura: 20,
                    humedad: 64,
                    latitud: 123.3,
                    longitud: 321.1,
                    fecha: Date.now() - 10707000
                },
                {idUsuario:1,
                    macSensor: "00:00:00:00:00:00",
                    tipoMedicion: 'CO',
                    medida: 30.0,
                    temperatura: 20,
                    humedad: 64,
                    latitud: 123.3,
                    longitud: 321.1,
                    fecha: Date.now() - 10706000
                },
                {idUsuario:1,
                    macSensor: "00:00:00:00:00:00",
                    tipoMedicion: 'CO',
                    medida: 27.0,
                    temperatura: 20,
                    humedad: 64,
                    latitud: 123.3,
                    longitud: 321.1,
                    fecha: Date.now() - 10702000
                },
                {idUsuario:1,
                    macSensor: "00:00:00:00:00:00",
                    tipoMedicion: 'CO',
                    medida: 29.0,
                    temperatura: 20,
                    humedad: 64,
                    latitud: 123.3,
                    longitud: 321.1,
                    fecha: Date.now() - 10701000
                },
                {idUsuario:1,
                macSensor: "00:00:00:00:00:00",
                tipoMedicion: 'CO',
                medida: 15.0,
                temperatura: 20,
                humedad: 64,
                latitud: 123.3,
                longitud: 321.1,
                fecha: Date.now() - 505000
                },
                {idUsuario:1,
                    macSensor: "00:00:00:00:00:00",
                    tipoMedicion: 'CO',
                    medida: 15.0,
                    temperatura: 20,
                    humedad: 64,
                    latitud: 123.3,
                    longitud: 321.1,
                    fecha: Date.now() - 504000
                },
                {idUsuario:1,
                    macSensor: "00:00:00:00:00:00",
                    tipoMedicion: 'CO',
                    medida: 15.0,
                    temperatura: 20,
                    humedad: 64,
                    latitud: 123.3,
                    longitud: 321.1,
                    fecha: Date.now() - 503000
                },
                {idUsuario:1,
                    macSensor: "00:00:00:00:00:00",
                    tipoMedicion: 'CO',
                    medida: 15.0,
                    temperatura: 20,
                    humedad: 64,
                    latitud: 123.3,
                    longitud: 321.1,
                    fecha: Date.now() - 502000
                },
                {idUsuario:1,
                    macSensor: "00:00:00:00:00:00",
                    tipoMedicion: 'CO',
                    medida: 15.0,
                    temperatura: 20,
                    humedad: 64,
                    latitud: 123.3,
                    longitud: 321.1,
                    fecha: Date.now() - 501000
                },
                {idUsuario:1,
                    macSensor: "00:00:00:00:00:00",
                    tipoMedicion: 'CO',
                    medida: 15.0,
                    temperatura: 20,
                    humedad: 64,
                    latitud: 123.3,
                    longitud: 321.1,
                    fecha: Date.now() - 105000
                },
                {idUsuario:1,
                    macSensor: "00:00:00:00:00:00",
                    tipoMedicion: 'CO',
                    medida: 15.0,
                    temperatura: 20,
                    humedad: 64,
                    latitud: 123.3,
                    longitud: 321.1,
                    fecha: Date.now() - 104000
                },
                {idUsuario:1,
                    macSensor: "00:00:00:00:00:00",
                    tipoMedicion: 'CO',
                    medida: 17.0,
                    temperatura: 20,
                    humedad: 64,
                    latitud: 123.3,
                    longitud: 321.1,
                    fecha: Date.now() - 103000
                },
                {idUsuario:1,
                    macSensor: "00:00:00:00:00:00",
                    tipoMedicion: 'CO',
                    medida: 22.0,
                    temperatura: 20,
                    humedad: 64,
                    latitud: 123.3,
                    longitud: 321.1,
                    fecha: Date.now() - 102000
                },
                {idUsuario:1,
                    macSensor: "00:00:00:00:00:00",
                    tipoMedicion: 'CO',
                    medida: 23.0,
                    temperatura: 20,
                    humedad: 64,
                    latitud: 123.3,
                    longitud: 321.1,
                    fecha: Date.now() - 101000
                },
                {idUsuario:1,
                    macSensor: "00:00:00:00:00:00",
                    tipoMedicion: 'CO',
                    medida: 21.0,
                    temperatura: 20,
                    humedad: 64,
                    latitud: 123.3,
                    longitud: 321.1,
                    fecha: Date.now() - 100000
                }     
            ]

            var datosGrafica = laLogica.obtenerDatosParaGrafico(fechaIni, fechaFin, res)

            console.log(datosGrafica);

            if(datosGrafica != null){
                respuesta.send(datosGrafica)
            }else{
                respuesta.status(500).send("Ha habido un problema");
            }
            
        }
    )


    // ------------------------------------------------------------------------------------------------
    // ------------------------------------------------------------------------------------------------
    // Reglas sensores
    // ------------------------------------------------------------------------------------------------
    // ------------------------------------------------------------------------------------------------


    // .......................................................
    // POST /sensor
    // .......................................................
    servidorExpress.post(
        '/sensor', verifyToken,
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
        '/todosLosSensores', verifyToken,
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
        '/sensor', verifyToken,
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





    // ------------------------------------------------------------------------------------------------
    // ------------------------------------------------------------------------------------------------
    // Reglas usuarios
    // ------------------------------------------------------------------------------------------------
    // ------------------------------------------------------------------------------------------------

    // .......................................................
    // POST /registrarUsuario
    // .......................................................
    servidorExpress.post(
        '/registrarUsuario',
        async function(peticion, respuesta){
            console.log(" * POST/registrarUsuario ")

            var datos =  peticion.body;

            console.log(datos)

            //Comprobamos si el sensor ya está añadido en la tabla Sensors (sólo puede haber una MAC para cada sensor)
            var res = await laLogica.registrarUsuario(datos);
            console.log(res)

            if(res == 200){
                respuesta.status(200).send("Se ha dado de alta un nuevo usuario\n");
            }else if(res == 400){
                respuesta.status(400).send("Error: faltan parametros\n")
            }if(res == 403){
                respuesta.status(403).send("Operación no autorizada: el usuario ya está registrado\n")
            }else if (res == 500){
                respuesta.status(500).sendStatus(res);
            }
            
        }
    )//() post registrar usuario


    // .......................................................
    // POST /registrarUsuario
    // .......................................................
    servidorExpress.post(
        '/login',
        async function(peticion, respuesta){
            console.log(" * POST/login ")

            var datos =  peticion.body;

            console.log(datos)

            //Comprobamos si el sensor ya está añadido en la tabla Sensors (sólo puede haber una MAC para cada sensor)
            var res = await laLogica.buscarUsuario(datos.correo, datos.contrasenya);
            console.log(res)

            if(res == 404){
                respuesta.status(400).send("Correo o contrasenya erroneos\n")
            }else if (res == 500){
                respuesta.status(500).sendStatus(res);
            }else{
                const token = jwt.sign({
                    id: res._id
                }, process.env.TOKEN_SECRET)
                
                respuesta.header('auth-token', token).json({
                    error: null,
                    data: {token}
                })
            }
            
        }
    )//() post registrar usuario

    

}
