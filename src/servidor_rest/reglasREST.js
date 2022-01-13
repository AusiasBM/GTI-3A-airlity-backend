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
const verificarCorreo = require("./Correo")
//verificarCorreo("perette93@gmail.com", "Pere");
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


    /**
     * POST /mediciones
     * -> se envía a través del cuerpo de la petición un array JSON ([{macSensor: texto, tipoMedicion: texto, 
     * medida: real, temperatura: entero, humedad: entero, fecha: entero, latitud: real, longitud: real } ]) 
     * y se registra en la tabla Mediciones. 
     * 
     * 
     */
    servidorExpress.post(
        '/mediciones', verifyToken,
        async function( peticion, respuesta ){
            console.log( " * POST /mediciones" )
            console.log(peticion.body)
            var datos =  peticion.body

           /* Datos de prueba
           var datos = [
                '{"macSensor":"00:00:00:00:00:00","tipoMedicion":"O3", "medida":-123.1,"temperatura": 10,"humedad": 100, "latitud":38.99586,"longitud":-0.166152,"fecha":1639600728531}',
                '{"macSensor":"00:00:00:00:00:00","tipoMedicion":"O3", "medida":456,"temperatura": 10,"humedad": 100, "latitud":38.99586,"longitud":-0.166152,"fecha":1639600728531}'
            ]*/
            //A ver como estan organizados los datos...
            /*console.log( "datos" )
            console.log( datos[0] )

            console.log( "datos2" )
            console.log( JSON.parse(datos[0]) )

            console.log( "datos3" )
            console.log( JSON.parse(datos[0]).medida )
            var id = 22;*/

            var id = peticion.token.id;//*/
            
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


     /**
     * POST /medicionesOficiales 
     * -> se envía a través del cuerpo de la petición un array JSON [{"poblacion": texto, "codigo": N, 
     * fecha: entero, "lat": real, "lng": real, mediciones: [{ tipoMedicion: texto, medida: R}]} ]
     * y se registra en la tabla MedicionesOficiales. 
     * 
     * 
     */
      servidorExpress.post(
        '/medicionesOficiales', verifyToken,
        async function( peticion, respuesta ){
            console.log( " * POST /mediciones" )
            //console.log(peticion.body)
            var datos =  JSON.parse(peticion.body)

           /* Datos de prueba
           var datos = [
                {"poblacion":"Gandia","codigo": 123 , "fecha":1639513614185,"lat": 38.99586,"lng": -0.166152, "mediciones": [{"tipoMedicion": "O3", "medida": 56},{"tipoMedicion": "NO2", "medida": 5},{"tipoMedicion": "CO", "medida": 0.5},{"tipoMedicion": "SO2", "medida": 3}] },
                {"poblacion":"Alcoi","codigo": 124 , "fecha":1639513614185,"lat": 2,"lng": 4, "mediciones": [{"tipoMedicion": "O3", "medida": 6},{"tipoMedicion": "NO2", "medida": 15},{"tipoMedicion": "CO", "medida": 20.5},{"tipoMedicion": "SO2", "medida": 5.5}] }
            ]//*/
            /*//A ver como estan organizados los datos...
            console.log( "datos" )
            console.log( datos[0] )

            console.log( "datos2" )
            console.log( JSON.parse(datos[0]) )

            console.log( "datos3" )
            console.log( JSON.parse(datos[0]).medida )
           
            */

            var res = await laLogica.guardarMedicionesOficiales(datos);
            
            console.log(res)
            if(res == 200){
                respuesta.status(200).send("Se ha dado de alta una nueva medida\n")
            }else{
                
                respuesta.status(400).sendStatus(res)
            }

        }
    )//post mediciones oficiles

    

    /**
     * GET /todasLasMediciones
     * -> se envía a través de la URL y devuelve un array JSON [{macSensor: texto, tipoMedicion: texto, medida: real,
     *  temperatura: entero, humedad: entero, fecha: entero, latitud: real, longitud: real } ]) desde la tabla
     *  Mediciones con todas las mediciones registradas.
     */
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



    /**
     * GET /ultimasMediciones
     * -> se envía a través de la URL un texto con el número de mediciones que se quieren obtener y devuelve un array JSON 
     *  [{macSensor: texto, tipoMedicion: texto, medida: real, temperatura: entero, humedad: entero, fecha: entero, latitud: real, longitud: real }])
     *  desde la tabla Mediciones con las ‘n’ últimas mediciones registradas.
     */
    servidorExpress.get(
        '/ultimasMediciones/:cuantas',/* verifyToken,*/
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

     /**
     * GET /estadisticasMedicionesUsuario
     * -> Se manda a través de la URL una query ?fechaIni=FechaInicial&fechaFin=FechaFinal de la fecha de inicio y de fin del periodo que se quiere obtener las mediciones
     *  para llamar al método getMedicionesDeUsuarioPorTiempo de la lógica del negocio el cual obtiene una lista 
     *  de mediciones de ese usuario en ese periodo, para posteriormente llamar al método obtenerEstadisticas
     *  para devolver un JSON {valorMax: R, media: R, tiempo: N, advertencias: [ Lista de JSON {fechaIni: N, fechaFin: N, periodoTiempoTranscurrido: N,
     *  mediaPeriodo: R, valorMaximoPeriodo: R} ] }
     * 
     */
    servidorExpress.get(
        '/estadisticasMedicionesUsuario', verifyToken,
        async function(peticion, respuesta){
            console.log(' * GET/ estadisticasMedicionesUsuario?fechaIni=FechaInicial&fechaFin=FechaFinal')

            var fechaIni = parseInt(peticion.query.fechaIni);
            var fechaFin = parseInt(peticion.query.fechaFin);
            console.log(fechaIni)
            console.log(fechaFin)

            /*
            var id = peticion.token.id;

            var res = await laLogica.getMedicionesDeUsuarioPorTiempo(id, fechaIni, fechaFin );

            if(res != 500){

                var tipoMedicion = res[0].tipoMedicion;
                console.log(tipoMedicion)

                var estadisticas = laLogica.obtenerEstadisticas(res, tipoMedicion)

                console.log(estadisticas);

                if(estadisticas != null){
                    respuesta.send(estadisticas)
                }else{
                    respuesta.status(500).send("Ha habido un problema");
                }

            }else{
                respuesta.status(500).send("Ha habido un problema en el servidor");
            }

           */

            //Simulación Datos de prueba (para no tener que estar midiendo datos del sensor)!!!!!!!!!!!!
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

            console.log(res);


            var tipoMedicion = res[0].tipoMedicion;
            console.log(tipoMedicion)
            var estadisticas = laLogica.obtenerEstadisticas(res, tipoMedicion)

            console.log(estadisticas);

            if(estadisticas != null){
                respuesta.send(estadisticas)
            }else{
                respuesta.status(500).send("Ha habido un problema");
            }
            
        }
    )


    // .......................................................
    // GET /datosGraficaUsuario
    //
    // Mètode de provaa!!!!!!!!!
    //
    // .......................................................

    /**
     * GET /datosGraficaUsuario
     * -> Se manda a través de la URL una query ?fechaIni=FechaInicial&fechaFin=FechaFinal de la fecha de inicio y de fin del periodo que se quiere obtener las mediciones
     *  para llamar al método getMedicionesDeUsuarioPorTiempo de la lógica del negocio el cual obtiene una lista 
     *  de mediciones de ese usuario en ese periodo, para posteriormente llamar al método obtenerDatosParaGrafico
     *  para devolver un JSON {medias:[Lista R], fechas: [Lista N]}
     * 
     */
    servidorExpress.get(
        '/datosGraficaUsuario', verifyToken,
        async function(peticion, respuesta){
            console.log(' * GET/ datosGraficaUsuario?fechaIni=FechaInicial&fechaFin=FechaFinal')

            var fechaIni = parseInt(peticion.query.fechaIni);
            var fechaFin = parseInt(peticion.query.fechaFin);
            console.log(fechaIni)
            console.log(fechaFin)

            /*resultado.fecha = d.getMonth() +1 + "-" + d.getDate() + "-" + d.getFullYear()

            var id = peticion.token.id;
            
            var res = await laLogica.getMedicionesDeUsuarioPorTiempo(id, fechaIni, fechaFin);

            if(res != 500){
                var datosGrafica = laLogica.obtenerDatosParaGrafico(fechaIni, fechaFin, res)

                //console.log(datosGrafica);

                if(datosGrafica != null){
                    respuesta.send(datosGrafica)
                }else{
                    respuesta.status(400).send("Ha habido un problema");
                }
            }else{
                respuesta.status(500).send("Ha habido un problema en el servidor");
            }
            */

             //Simulación Datos de prueba (para no tener que estar midiendo datos del sensor)!!!!!!!!!!!!
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

            var ini = Date.now() - 86300000;
            var datosGrafica = laLogica.obtenerDatosParaGrafico(ini, Date.now(), res)

            //console.log(datosGrafica);

            if(datosGrafica != null){
                respuesta.send(datosGrafica)
            }else{
                respuesta.status(500).send("Ha habido un problema");
            }
            
        }
    )

    // .......................................................
    // GET /mapaContaminacionActual
    // Ruta accesible para todo el mundo (ciudadanos y usuarios registrados)
    //
    // .......................................................

    /**
     * GET /mapaContaminacionActual 
     * -> Se manda a través de la URL una query ?ciudad=NombreCiudad&tipoMedicion=Gas con la ciudad y del tipo de medicion 
     *  para llamar primero al método buscarPoblacion para obtener las coordenadas para acotar la busqueda de las mediciones a
     *  una cuuadrícula geográfica correspondiente a la ciudad, y después llamar al método getMedicionesPorTiempoZona el cual obtiene una lista 
     *  de mediciones de todos los usuarios registradas en la última hora, filtrando por el tipo de gas y la zona geográfica.
     * 
     */
     servidorExpress.get(
        '/mapaContaminacionActual', 
        async function(peticion, respuesta){
            console.log(' * GET/ mapaContaminacionActual?ciudad=NombreCiudad&tipoMedicion=Gas')

            var nombreCiudad = peticion.query.ciudad;
            var tipoMedicion = peticion.query.tipoMedicion;
            console.log(nombreCiudad)
            console.log(tipoMedicion)

            //Obtenemos las coordenadas de la cuadrícula que engloba la ciudad
            var poblacion = await laLogica.buscarPoblacion(nombreCiudad);
            console.log(poblacion)

            if(poblacion != 404 && poblacion != 500){
                //Obtenemos los datos de la última hora (para que sea actual...)
                //var res = await laLogica.getMedicionesPorTiempoZona(poblacion.posicionSO, poblacion.posicionNE,  Date.now()-86400000*8/*Date.now() - 3600000*/, Date.now(), tipoMedicion);
                var res = [
                    {
                  "macSensor": "http://rootear.com/author/txaber-guereta",
                  "tipoMedicion": "O3",
                  "medida": 76,
                  "fecha": 1639143098121,
                  "latitud": 38.968664,
                  "longitud": -0.180861
                  },
                    {
                  "macSensor": "http://rootear.com/author/txaber-guereta",
                  "tipoMedicion": "O3",
                  "medida": 59,
                  "fecha": 1639143098121,
                  "latitud": 38.967024,
                  "longitud": -0.181076
                  },
                    {
                  "macSensor": "http://rootear.com/author/txaber-guereta",
                  "tipoMedicion": "O3",
                  "medida": 54,
                  "fecha": 1639143098121,
                  "latitud": 38.965589,
                  "longitud":  -0.181091
                  },
                    {
                  "macSensor": "http://rootear.com/author/txaber-guereta",
                  "tipoMedicion": "O3",
                  "medida": 43,
                  "fecha": 1639143098121,
                  "latitud": 38.964063,
                  "longitud": -0.182647
                  },
                    {
                  "macSensor": "http://rootear.com/author/txaber-guereta",
                  "tipoMedicion": "O3",
                  "medida": 153,
                  "fecha": 1639143098121,
                  "latitud": 38.965047,
                  "longitud": -0.183642
                  },
                    {
                  "macSensor": "http://www.codigos-qr.com",
                  "tipoMedicion": "O3",
                  "medida": 123,
                  "fecha": 1639143098121,
                  "latitud": 38.965675,
                  "longitud": -0.183749
                  },
                    {
                  "macSensor": "http://www.xataka.com",
                  "tipoMedicion": "O3",
                  "medida": 103,
                  "fecha": 1639143098121,
                  "latitud": 38.965738,
                  "longitud": -0.184352
                  },
                    {
                  "macSensor": "http://www.codigos-qr.com",
                  "tipoMedicion": "O3",
                  "medida": 120,
                  "fecha": 1639143098121,
                  "latitud": 38.965920,
                  "longitud": 0.185489
                  },
                    {
                  "macSensor": "http://www.xataka.com",
                  "tipoMedicion": "O3",
                  "medida": 115,
                  "fecha": 1639143098121,
                  "latitud": 38.966065,
                  "longitud": -0.186496
                  },
                    {
                  "macSensor": "http://rootear.com/author/txaber-guereta",
                  "tipoMedicion": "O3",
                  "medida": 103,
                  "fecha": 1639143098121,
                  "latitud": 38.966331,
                  "longitud": -0.188037
                  },
                    {
                  "macSensor": "http://www.codigos-qr.com",
                  "tipoMedicion": "O3",
                  "medida": 123,
                  "fecha": 1639143098121,
                  "latitud": 38.966352,
                  "longitud": -0.188362
                  },
                    {
                  "macSensor": "http://www.xataka.com",
                  "tipoMedicion": "O3",
                  "medida": 132,
                  "fecha": 1639143098121,
                  "latitud": 38.966494,
                  "longitud": -0.188984
                  },
                    {
                  "macSensor": "00:00:00:00:00:00",
                  "tipoMedicion": "O3",
                  "medida": 136,
                  "fecha": 1639419932071,
                  "latitud": 38.966494,
                  "longitud":  -0.189478
                  },
                    {
                  "macSensor": "00:00:00:00:00:00",
                  "tipoMedicion": "O3",
                  "medida": 146,
                  "fecha": 1639419932071,
                  "latitud": 38.966794,
                  "longitud": -0.190540
                  },
                    {
                  "macSensor": "Gandia",
                  "tipoMedicion": "O3",
                  "medida": 56,
                  "fecha": 1639513614185,
                  "latitud": 38.968214,
                  "longitud": -0.191079
                  },
                  {
                  "macSensor": "00:00:00:00:00:00",
                  "tipoMedicion": "O3",
                  "medida": 146,
                  "fecha": 1639419932071,
                  "latitud": 38.975481,
                  "longitud": -0.182538
                  },
                  {
                  "macSensor": "00:00:00:00:00:00",
                  "tipoMedicion": "O3",
                  "medida": 176,
                  "fecha": 1639419932071,
                  "latitud": 38.975481,
                  "longitud": -0.182538
                  },
                  {
                  "macSensor": "00:00:00:00:00:00",
                  "tipoMedicion": "O3",
                  "medida": 183,
                  "fecha": 1639419932071,
                  "latitud": 38.974760,
                  "longitud": -0.182376
                  },
                  {
                  "macSensor": "00:00:00:00:00:00",
                  "tipoMedicion": "O3",
                  "medida": 164,
                  "fecha": 1639419932071,
                  "latitud": 38.973103,
                  "longitud": -0.181875
                  },
                  {
                  "macSensor": "00:00:00:00:00:00",
                  "tipoMedicion": "O3",
                  "medida": 176,
                  "fecha": 1639419932071,
                  "latitud": 38.975998,
                  "longitud": -0.182151
                  },
                  {
                  "macSensor": "00:00:00:00:00:00",
                  "tipoMedicion": "O3",
                  "medida": 194,
                  "fecha": 1639419932071,
                  "latitud": 38.975784,
                  "longitud": -0.179944
                  },
                  {
                  "macSensor": "00:00:00:00:00:00",
                  "tipoMedicion": "O3",
                  "medida": 189,
                  "fecha": 1639419932071,
                  "latitud": 38.975584,
                  "longitud": -0.178260
                  },
                  {
                  "macSensor": "00:00:00:00:00:00",
                  "tipoMedicion": "O3",
                  "medida": 186,
                  "fecha": 1639419932071,
                  "latitud": 38.975233,
                  "longitud": -0.176597
                  },
                  {
                  "macSensor": "00:00:00:00:00:00",
                  "tipoMedicion": "O3",
                  "medida": 208,
                  "fecha": 1639419932071,
                  "latitud": 38.974833,
                  "longitud":  -0.175223
                  },
                  {
                  "macSensor": "00:00:00:00:00:00",
                  "tipoMedicion": "O3",
                  "medida": 195,
                  "fecha": 1639419932071,
                  "latitud": 38.974324,
                  "longitud": -0.174258
                  },
                  {
                  "macSensor": "http://rootear.com/author/txaber-guereta",
                  "tipoMedicion": "O3",
                  "medida": 123,
                  "fecha": 1639143098121,
                  "latitud": 38.9669053,
                  "longitud": -0.1810745
                  },
                    {
                  "macSensor": "http://rootear.com/author/txaber-guereta",
                  "tipoMedicion": "O3",
                  "medida": 123,
                  "fecha": 1639143098121,
                  "latitud": 38.9669053,
                  "longitud": -0.1810745
                  },
                    {
                  "macSensor": "http://rootear.com/author/txaber-guereta",
                  "tipoMedicion": "O3",
                  "medida": 123,
                  "fecha": 1639143098121,
                  "latitud": 38.9669053,
                  "longitud": -0.1510745
                  },
                    {
                  "macSensor": "http://rootear.com/author/txaber-guereta",
                  "tipoMedicion": "O3",
                  "medida": 123,
                  "fecha": 1639143098121,
                  "latitud": 38.9869053,
                  "longitud": -0.1810745
                  },
                    {
                  "macSensor": "http://rootear.com/author/txaber-guereta",
                  "tipoMedicion": "O3",
                  "medida": 123,
                  "fecha": 1639143098121,
                  "latitud": 38.9697862,
                  "longitud": -0.1390964
                  },
                    {
                  "macSensor": "http://www.codigos-qr.com",
                  "tipoMedicion": "O3",
                  "medida": 123,
                  "fecha": 1639143098121,
                  "latitud": 38.9663203,
                  "longitud": -0.1886397
                  },
                    {
                  "macSensor": "http://www.xataka.com",
                  "tipoMedicion": "O3",
                  "medida": 123,
                  "fecha": 1639143098121,
                  "latitud": 38.9951063,
                  "longitud": -0.1659536
                  },
                    {
                  "macSensor": "http://www.codigos-qr.com",
                  "tipoMedicion": "O3",
                  "medida": 123,
                  "fecha": 1639143098121,
                  "latitud": 38.9958526,
                  "longitud": -0.1666134
                  },
                    {
                  "macSensor": "http://www.xataka.com",
                  "tipoMedicion": "O3",
                  "medida": 123,
                  "fecha": 1639143098121,
                  "latitud": 38.9970533,
                  "longitud": -0.1648753
                  },
                    {
                  "macSensor": "http://rootear.com/author/txaber-guereta",
                  "tipoMedicion": "O3",
                  "medida": 123,
                  "fecha": 1639143098121,
                  "latitud": 38.9965032,
                  "longitud": -0.1662111
                  },
                    {
                  "macSensor": "http://www.codigos-qr.com",
                  "tipoMedicion": "O3",
                  "medida": 123,
                  "fecha": 1639143098121,
                  "latitud": 38.9968657,
                  "longitud": -0.1634216
                  },
                    {
                  "macSensor": "http://www.xataka.com",
                  "tipoMedicion": "O3",
                  "medida": 123,
                  "fecha": 1639143098121,
                  "latitud": 38.9974869,
                  "longitud": -0.1642799
                  },
                    {
                  "macSensor": "00:00:00:00:00:00",
                  "tipoMedicion": "O3",
                  "medida": 97,
                  "fecha": 1639419932071,
                  "latitud": 39.005,
                  "longitud": -0.176152
                  },
                    {
                  "macSensor": "00:00:00:00:00:00",
                  "tipoMedicion": "O3",
                  "medida": 146,
                  "fecha": 1639419932071,
                  "latitud": 38.99386,
                  "longitud": -0.169152
                  },
                    {
                  "macSensor": "Gandia",
                  "tipoMedicion": "O3",
                  "medida": 56,
                  "fecha": 1639513614185,
                  "latitud": 38.99586,
                  "longitud": -0.166152
                  }

                  ]
                console.log(res);

                if(res!= 500){
                    respuesta.send(res)
                }else{
                    respuesta.status(500).send("Ha habido un problema en el servidor");
                }
            }else{
                respuesta.status(400).send("No se puede mostrar el mapa");
            }

        }
    )//() get mapaContaminacionActual


    // .......................................................
    // GET /historicoMapasContaminacion
    // Ruta accesible únicamente para usuarios que han iniciado sesión
    //
    // .......................................................

    /**
     * GET /historicoMapasContaminacion 
     * -> Se manda a través de la URL una query ?ciudad=NombreCiudad&tipoMedicion=Gas&fechaDia=FechaDelDiaQueSeQuiereConsultar 
     *  con la ciudad y del tipo de medicion para llamar primero al método buscarPoblacion para obtener las coordenadas para acotar la busqueda de las mediciones a
     *  una cuadrícula geográfica correspondiente a la ciudad, y después llamar al método getMedicionesPorTiempoZona el cual obtiene una lista 
     *  de mediciones de todos los usuarios registradas entre las 00:00 y las 23:59:59 del dia escogido, filtrando por el tipo de gas y la zona geográfica.
     * 
     */
     servidorExpress.get(
        '/historicoMapasContaminacion', verifyToken,
        async function(peticion, respuesta){
            console.log(' * GET/ historicoMapasContaminacion?ciudad=NombreCiudad&tipoMedicion=Gas&fechaDia=FechaDelDiaQueSeQuiereConsultar')

            var nombreCiudad = peticion.query.ciudad;
            var tipoMedicion = peticion.query.tipoMedicion;
            //Enviar fecha del dia deseado a las 00:00
            var fechaMedianoche = peticion.query.fechaDia
            var milisegundosDia = 86399000 //Contemos hasta las 23h, 59min, 59s 
            console.log(nombreCiudad)
            console.log(tipoMedicion)

            //Obtenemos las coordenadas de la cuadrícula que engloba la ciudad
            var poblacion = await laLogica.buscarPoblacion(nombreCiudad);

            if(poblacion != 404 && poblacion != 500){
                //Obtenemos los datos de el dia desde las 00:00 hasta las 23:59:59
                var res = await laLogica.getMedicionesPorTiempoZona(poblacion.posicionSO, poblacion.posicionNE, fechaMedianoche, fechaMedianoche + milisegundosDia, tipoMedicion);

                console.log(res);

                if(res != 500){
                    respuesta.send(res)
                }else{
                    respuesta.status(500).send("Ha habido un problema en el servidor");
                }
            }else{
                respuesta.status(400).send("No se puede mostrar el mapa de la zona");
            }

        }
    )//() get mapaContaminacionActual


    // ------------------------------------------------------------------------------------------------
    // ------------------------------------------------------------------------------------------------
    // Reglas sensores
    // ------------------------------------------------------------------------------------------------
    // ------------------------------------------------------------------------------------------------

    /**
     * GET /todosLosSensores 
     * -> devuelve un array JSON [{ macSensor: texto, nombreSensor: texto, uuid: texto, tipoMedicion: texto,
     *  fechaRegistro: Date, fechaUltimaMedicion: Date}] con los datos de los sensores almacenados en la tabla Sensores.
     */
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



    /**
     * GET /sensor?mac= -> se envía a través de la URL una query mac con la MAC del dispositivo requerido y devuelve un JSON 
     * { macSensor: texto, nombreSensor: texto, uuid: texto, tipoMedicion: texto, fechaRegistro: Date, fechaUltimaMedicion: Date} 
     * con los datos de ese sensor.
     */
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
            
    })//get sensor


    /**
     * GET /informeSensores -> se envía a través de la URL una query mac con la MAC del dispositivo requerido y devuelve un JSON 
     * { macSensor: texto, nombreSensor: texto, uuid: texto, tipoMedicion: texto, fechaRegistro: Date, fechaUltimaMedicion: Date} 
     * con los datos de ese sensor.
     */
     servidorExpress.get(
        '/informeSensores', verifyToken,
        async function( peticion, respuesta){
            console.log(" * GET/informeSensores?ciudad=NombreCiudad&tipoMedicion=Gas ")
            

            var nombreCiudad = peticion.query.ciudad;
            var tipoMedicion = peticion.query.tipoMedicion;
            
            var fechaActual = Date.now()
            var fechaActualMenosCuatroHoras = 1 //fechaActual-14400000;
            //1636128765478
            //1234500000000

            //Obtenemos las coordenadas de la cuadrícula que engloba la ciudad
            var poblacion = await laLogica.buscarPoblacion(nombreCiudad);

            if(poblacion != 404 && poblacion != 500){
                //Obtenemos los datos de las últimas 4 horas para la ciudad determinada y tipo de gas
                var res = await laLogica.getMedicionesPorTiempoZona(poblacion.posicionSO, poblacion.posicionNE, 1234500000000, fechaActual , tipoMedicion);

                console.log(res);

                if(res != 500){

                var listaSensores = await laLogica.obtenerInformeMedicionesSensores(res);
                console.log(listaSensores)

                respuesta.send(listaSensores);
                }else{
                    respuesta.status(500).send("Ha habido un problema en el servidor");
                }
            }else{
                respuesta.status(400).send("No se puede mostrar el informe");
            }

            
    })//get informeSensores





    /**
     * GET /sensoresInactivos -> se envía a través de la URL una query mac con la MAC del dispositivo requerido y devuelve un JSON 
     * { macSensor: texto, nombreSensor: texto, uuid: texto, tipoMedicion: texto, fechaRegistro: Date, fechaUltimaMedicion: Date} 
     * con los datos de ese sensor.
     */
     servidorExpress.get(
        '/sensoresInactivos', verifyToken,
        async function( peticion, respuesta){
            console.log(" * GET/sensoresInactivos ")

            var res = await laLogica.obtenerSensoresInactivos();
            console.log(res)

            if (res == 500){
                respuesta.status(500).send("Error en el servidor")
            }else{
                //Ok
                respuesta.status(200).send(res)
            }     
            
    })//get sensoresInactivos






    /**
     * POST /eliminarSensor -> se envía en el cuerpo de la petición un JSON con la mac del sensor que se quiere eliminar y
     * devuelve un código 200 si se ha borrado correctamente, o 500 en caso de tener algún error en el servidor
     */
    servidorExpress.post(
        '/eliminarSensor', verifyToken,
        async function(peticion, respuesta){
            console.log(" * POST/eliminarSensor ")

            var datos = peticion.body;
            console.log(datos.macSensor)

            var res = await laLogica.eliminarSensorPorMac(datos.macSensor);

            console.log(res)
            if(res == 200){
                respuesta.status(200).send("Sensor eliminado correctamente");
                
            }else{
                respuesta.status(res);
            }
            
        }
    )//








    // ------------------------------------------------------------------------------------------------
    // ------------------------------------------------------------------------------------------------
    // Reglas usuarios
    // ------------------------------------------------------------------------------------------------
    // ------------------------------------------------------------------------------------------------





    /**
     * POST /registrar
     * -> Se le pasa en el cuerpo de la petición un JSON {usuario{nombreUsuario: Texto, correo: Texto, contrasenya:Texto, telefono: N},
     * sensor{macSensor: Texto, tipoMedicion: Texto}
     * y llama al método registrar de la lógica de negocio para primero guardar el usuario y si se guarda de forma correcta registrar el sensor.
     * 
     */
    servidorExpress.post(
        '/registrar',
        async function(peticion, respuesta){
            console.log(" * POST/registrar ")

            var datos = peticion.body;

            const verificationTokken = jwt.sign({usuario: usuario}, "verificationTokken");
            datos.usuario.signInVerification = verificationTokken;
            var usuario = datos.usuario;
            var sensor = datos.sensor;
            var correo = datos.usuario.correo;
            //var verifiacion = datos.verifiacion;
            console.log("pepinillo", datos)
            
            //Llamamos a registrar en la lógica del negocio
            var res = await laLogica.registrar(usuario, sensor);
            console.log(res)

            if(res == 200){
                respuesta.status(200).send("Se ha dado de alta un nuevo usuario\n");
                verificarCorreo(correo, usuario);
            }else if(res == 400){
                respuesta.status(400).send("Error: faltan parametros\n")
            }else if(res == "Error usuario"){
                respuesta.status(403).send("Operación no autorizada: el usuario ya está registrado\n")
            }else if(res == "Error sensor"){
                respuesta.status(403).send("Operación no autorizada: el sensor ya está registrado\n")
            }else{
                respuesta.status(500).sendStatus(res);
            }
            
        }
    )//() post registrar usuario


    /**
     * POST /registrar
     * -> Se le pasa en el cuerpo de la petición un JSON {usuario{nombreUsuario: Texto, correo: Texto, contrasenya:Texto, telefono: N},
     * sensor{macSensor: Texto, tipoMedicion: Texto}
     * y llama al método registrar de la lógica de negocio para primero guardar el usuario y si se guarda de forma correcta registrar el sensor.
     * 
     */

     servidorExpress.post(
        '/verificar/:tokken',
        async function(peticion, respuesta){
            console.log(" * POST/verificar/:tokken")

            var tokken = peticion.params.tokken;
           
            //Llamamos a registrar en la lógica del negocio
            var res = await laLogica.verificarUsuario(tokken);
            console.log(res)

            if(res == 200){
                respuesta.status(200).sendStatus(res);
            }else if(res == 404){
                respuesta.status(400).sendStatus(res);
            }else{
                respuesta.status(500).sendStatus(res);
            }
            
        }
    )//() post registrar usuario



    /**
     * POST /login
     * -> Se le pasa en el cuerpo de la petición un JSON {correo: Texto, contrasenya:Texto}
     * y llama al método buscarUsuario de la lógica de negocio para comprobar si el correo y la contraseña 
     * corresponden a un usuario, y si és correcto, devuelve los datos del usuario para posteriormente
     * genera un token para iniciar una sesión de ese usuario.
     * 
     */
    servidorExpress.post(
        '/login',
        async function(peticion, respuesta){
            console.log(" * POST/login ")

            var datos;

            console.log("ENTRA EN login usuario")

            if(peticion.headers['correo']){
                datos =  {
                    correo: peticion.headers['correo'],
                    contrasenya: peticion.headers['contrasenya']
                };
                console.log("entra a headers")
            }else{
                
                datos = peticion.body;
                console.log("entra a body")
            }

            console.log(datos.correo)
            console.log(datos.contrasenya)

            //Comprobamos si el usuario ya está registrado y coincide con la contrasenya
            var res = await laLogica.buscarUsuario(datos.correo, datos.contrasenya);
            console.log(res)

            if(res == 404){
                respuesta.status(400).send("Correo o contrasenya erroneos\n")
            }else if (res == 500){
                respuesta.status(500).sendStatus(res);
            }else{
                if(res.status){
                    const token = jwt.sign({
                        id: res._id,
                        rol: res.rol
                    }, process.env.TOKEN_SECRET,
                    { expiresIn: '86400s' })
                    
                    respuesta.header('auth-token', token).json({
                        error: null,
                        data: {token},
                        datosUsuario: res
                    })
                }
                else{
                    respuesta.status(400).send("Usuario no verificado\n")
                }
                
            }
            
        }
    )//() post registrar usuario


    /**
     * POST /actualizarDatosUsuario
     * -> Se le pasa en el cuerpo de la petición un JSON {nombreUsuario: Texto, correo: Texto, contrasenya:Texto, telefono: N}
     * y llama al método registrarUsuario de la lógica de negocio para comprobar primero si el correo ya está registrado, y si 
     * no lo está procede a guardar el usuario.
     * 
     */
     servidorExpress.post(
        '/actualizarDatosUsuario', verifyToken,
        async function(peticion, respuesta){
            console.log(" * POST/actualizarDatosUsuario ")

            var id = peticion.token.id;

            var datos = peticion.body

            console.log(datos)
            var res = await laLogica.actualizarDatosPersonalesUsuario(id, datos);

            console.log(res)
            console.log("return")
            if(res != 400 || res != 500){
                
                respuesta.status(200).send(res);
                console.log(res)
            }else{
                respuesta.status(res);
            }
            
        }
    )//() post eliminar usuario


    /**
     * POST /eliminarUsuario
     * -> Se le pasa en el cuerpo de la petición un JSON {nombreUsuario: Texto, correo: Texto, contrasenya:Texto, telefono: N}
     * y llama al método registrarUsuario de la lógica de negocio para comprobar primero si el correo ya está registrado, y si 
     * no lo está procede a guardar el usuario.
     * 
     */
     servidorExpress.post(
        '/eliminarUsuario', verifyToken,
        async function(peticion, respuesta){
            console.log(" * POST/eliminarUsuario ")

            var correo = peticion.body.correo;

            console.log(correo)
            var res = await laLogica.eliminarUsuario(correo);

            console.log(res)
            if(res == 200){
                respuesta.status(200).sendStatus(res);
                console.log(res)
            }else{
                respuesta.status(res);
            }
            
        }
    )//() post eliminar usuario


    servidorExpress.get(
        '/medidasOficiales', /*verifyToken,*/
        async function( peticion, respuesta){
            console.log(" * GET/medidaOficial ")

            var ciudad = 'Valencia';
            var poblacion = 'Gandia';
    
            const request = require('request');
    
            // Preparo la petición a la web de https://www.iqair.com/es/spain/
            const options = {
                url: 'http://api.airvisual.com/v2/city?city=' + poblacion + '&state=' + ciudad + '&country=spain&key=c51a0e45-8730-42f8-8887-4c27796e1708',
                method: 'GET', // Tiene que ser un post, aunque nosotros lo pongamos como get en la llamada
                headers: {
                    'Content-Type': 'application/json',
                    "User-Agent": 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0'
                }
            };
    
    
            // Envio la petición y espero a que me responda
            request(options, function(err, res, body) {
                let json = JSON.parse(body);
                console.log(json);
                
            
                var poblacion = json['data']['city'];
                var ciudad = json['data']['state'];
                var latitud = json['data']['location']['coordinates'][1];
                var longitud = json['data']['location']['coordinates'][0];
                var fecha = new Date(json['data']['current']['pollution']["ts"]);
                var ica = json['data']['current']['pollution']["aqius"]; // Calidad del aire en unidades EE.UU
                var temp = json['data']['current']['weather']["tp"]; // Temperatura en grados
                var hu = json['data']['current']['weather']["hu"]; // Humedad en %
                var pr = json['data']['current']['weather']["pr"]; // Presión en mb
    
    
                var ciudad = [{"ciudad": ciudad, "poblacion": poblacion, "fecha": fecha.getTime(),"latitud": latitud,"longitud": longitud, "mediciones": [{"tipoMedicion": "ica", "medida": ica},{"tipoMedicion": "temp", "medida": temp},{"tipoMedicion": "hu", "medida": hu},{"tipoMedicion": "pr", "medida": pr}] }]
                console.log(ciudad);
                insertarMedidaOficial(ciudad);
                respuesta.send(ciudad);
                

                // if(res == 200){
                //     respuesta.send(ciudad);
                //     //respuesta.status(200).send("Se ha dado de alta una nueva medida\n")
                // }else{
                    
                //     respuesta.status(400).sendStatus(res)
                // }
            });
    

    })//get todasLasMediciones

    async function insertarMedidaOficial(ciudad) {
        
        var res = await laLogica.guardarMedicionesOficiales(ciudad);
                
        
    }


}
