/**
 * LogicaNegocio.js
 * @author Aitor Benítez Estruch
 * @date: 2021/11/02
 * 
 * @description:
 * Clase LogicaNegocio contiene los métodos con las operaciones necesarias para insertar datos (mediciones del sensor)
 * y recuperarlas de la bd.
 * 
 */

 const mongoose = require('mongoose');
 const Medicion = require("./modelos/Medicion");
 const MedicionOficial = require("./modelos/MedicionOficial");
 const Sensor = require("./modelos/Sensor");
 const Usuario = require("./modelos/Usuario");
 const Poblacion = require("./modelos/Poblacion");
 const EstadisticasMediciones = require("./modelos/EstadisticasMediciones")


 /**
  * Función conexionBD
  * Descripción:
  * Esta función servirá para conectar con la bbdd de mongoDB. Si es la primera vez que
  * se conecta, creará la bbdd pero no se visualizará en MongoDBCompass hasta que no se cree
  * la primera colección (tener esto en cuenta!!).
  * 
  * conexionDB () -->
  * 
  */
 const conexionDB = async () => {
    try {
       // Cuando esté en producción hay que cambiar localhost por mongo
        const DB = await mongoose.connect('mongodb://localhost:27017/airlity', { useUnifiedTopology: true, 
        useNewUrlParser: true});
        console.log("Conectado con Mongo, ", DB.connection.name);
       
    } catch (error) {
        console.log(error);
    }
}

// .....................................................................
// .....................................................................
module.exports = class LogicaNegocio {

    /**
     * Constructor de la clase LogicaNegocio.
     * Descripción:
     * El constructor de la classe será el encargado de llamar a la función conexionDB()
     * para abrir la conexión con la bbdd. Se debe poner en esta classe la llamada a la función
     * de conexión o no será posible guardar-cargar información de la bbd. 
     *
     * constructor () -->
     * 
     */
    constructor() {
        conexionDB();
        this.estadisticas = new EstadisticasMediciones();
    } // ()



    //==================================================================================================
    //==================================================================================================
    // Logica de Mediciones
    //==================================================================================================
    //==================================================================================================

    /**
     * guardarMediciones()
     * Descripción:
     * Por cada elemento del array de Texto es convertido a JSON y llama a guardarMedicion() para introducir en la bd
     * 
     * @param idUsuario Texto con el id del usuario que ha medido 
     * @param mediciones Array de Textos JSON.
     * 
     * @return En caso de guardarse correctamente en la bd no devuelve nada. En caso de producirse un error,
     *  devuelve el tipo de error producido.
     * 
     *  * mediciones: lista<Texto>
     * -->
     * guardarMediciones() -->
     * 200 || 400 || 500
     */
    async guardarMediciones(idUsuario, mediciones){
        for(var i = 0; i < mediciones.length; i++){
            var medicion = JSON.parse(mediciones[i])

            //Obtenemos la delta del sensor para una posible correccion de la medicion
            var sensor = await this.buscarSensor(medicion.macSensor);
            var delta = sensor.delta;

            var res = await this.guardarMedicion(idUsuario, medicion, delta)

            //Si da algún error enviar la respuesta inmediatamente
            if(res == 400 || res == 500){
                return res;
            }
                
                
        }

        return 200
    }




    /**
     * guardarMedicion()
     * Descripción:
     * realiza una operación de inserción en la tabla Medicion de la bd.
     * 
     * @param {*} id Texto con el identificador del usuario guardado en la bbdd
     * @param req Objeto JSON con los datos que contiene cada medición.
     * @param {*} delta R con el valor que modifica el valor de la medicion despues un proceso de recalibracion del sensor.
     * 
     * @return En caso de guardarse correctamente en la bd devuelve 200. En caso de producirse un error,
     *  devuelve 400.
     * 
     * JSON{
        macSensor :Texto,
        idUsuario: Texto,
        tipoMedicion:Texto,
        medida: R,
        temperatura: Z,
        humedad: N
        fecha: N,
        latitud: R,
        longitud: R} -> guardarMedicion() ->
        respuesta: 200 || 400 || 500 <-
     * 
     */
    async guardarMedicion( id, req, delta ) {
        console.log(req)
        console.log(id)
        
        try {
            // Si creamos una lista con el mismo nombre que las clables del json, se añaden los valores automáticamente a cada variable            
            if(id && req.macSensor && req.tipoMedicion && req.medida && req.temperatura && req.humedad && req.fecha && req.latitud && req.longitud && delta){

                const nuevaMedicion = new Medicion( {idUsuario: id, macSensor : String(req.macSensor), tipoMedicion: String(req.tipoMedicion), medida : (req.medida+delta), temperatura:req.temperatura,
                     humedad:req.humedad, fecha:req.fecha, latitud:req.latitud, longitud: req.longitud } );
                console.log(nuevaMedicion)
                
                //Guardamos la nueva medición
                await nuevaMedicion.save();

                return 200

            }else{
                console.log("Error");
                return 400     
            }
    
        } catch (error) {
            console.log("Error: " + error);
            return 500
        }
    } // ()



    /**
     * guardarMedicionesOficiales()
     * Descripción:
     * Guarda las mediciones de las estaciones oficiales conseguidas mediante scraping
     * 
     * @param mediciones Array de JSON .
     * 
     * @return En caso de guardarse correctamente en la bd no devuelve nada. En caso de producirse un error,
     *  devuelve el tipo de error producido.
     * 
     * mediciones: lista<JSON>
     * [{
        poblacion: string;
        codigo: number;
        fecha: number;
        lat: number;
        lng: number;
        mediciones: [{
                tipoMedicion: string;
                medida: number;
            }];
        }]--> guardarMedicionesOficiales() -->
     * 200 || 400 || 500
     */
     async guardarMedicionesOficiales( mediciones ){

        
        for(var i = 0; i < mediciones.length; i++){
            
            var ciudad = mediciones[i].ciudad;
            var poblacion = mediciones[i].poblacion;
            var fecha = mediciones[i].fecha;
            var latitud = mediciones[i].latitud;
            var longitud = mediciones[i].longitud;

            for (var j = 0; j < mediciones[i].mediciones.length; j++){
               
                var tipoMedicion = mediciones[i].mediciones[j].tipoMedicion;
                var medida = mediciones[i].mediciones[j].medida;
                var res = await this.guardarMedicionOficial(ciudad, poblacion, fecha, latitud, longitud, tipoMedicion, medida);

                //Si da algún error enviar la respuesta inmediatamente
                if(res == 400 || res == 500){
                    return res;
                }
            }              
        }

        return 200
    }



    /**
     * guardarMedicionOficial()
     * Descripción:
     * realiza una operación de inserción en la tabla MedicionOficials de la bd.
     * 
     * @param poblacion Texto con el nombre de la poblacion donde se encuentra la estacion
     * @param codigo N con el código perteneciente a esa estación
     * @param tipoMedicion Texto con el gas que mide
     * @param medida Real con el valor de la medición
     * @param fecha N con la fecha en milisegundos de cuando se ha realizado
     * @param latitud R con latitud
     * @param longitud R con la longitud 
     * 
     * 
     * @return En caso de guardarse correctamente en la bd devuelve 200. En caso de producirse un error,
     *  devuelve 400.
     * 
        poblacion :Texto,
        codigo: N,
        tipoMedicion:Texto,
        medida: R,
        fecha: N,
        latitud: R,
        longitud: R -> guardarMedicionOficial() ->
        respuesta: 200 || 400 || 500 <-
     * 
     */
    async guardarMedicionOficial( ciudad, poblacion, fecha, latitud, longitud, tipoMedicion, medida ) {
        
        try {
            
            // Si creamos una lista con el mismo nombre que las clables del json, se añaden los valores automáticamente a cada variable            
            if(ciudad && poblacion && fecha && latitud && longitud && tipoMedicion && medida ){

                const nuevaMedicion = new MedicionOficial( {ciudad: String(ciudad), poblacion : String(poblacion), tipoMedicion: String(tipoMedicion), medida : medida,
                    fecha: fecha, latitud: latitud, longitud: longitud } );
                console.log(nuevaMedicion)
                
                //Guardamos la nueva medición
                await nuevaMedicion.save();

                return 200

            }else{
                console.log("Error");
                return 400     
            }
    
        } catch (error) {
            console.log("Error: " + error);
            return 500
        }
    } // ()
    


    /**
     * obtenerTodasLasMediciones()
     * Descripción:
     * realiza una operación de consulta a la tabla Medicion de la bd y recupera todos los valores guardados.
     * 
     * @return Devuelve una lista de JSON. En caso de producirse un error durante la consulta,
     *  devuelve el tipo de error producido.
     * 
     * obtenerTodasLasMediciones() -->
     *  lista [{
        macSensor :Texto,
        idUsuario: Texto,
        tipoMedicion:Texto,
        medida: R,
        temperatura: Z,
        humedad: N
        fecha: N,
        latitud: R,
        longitud: R }] || respuesta: 500
     */
    async obtenerTodasLasMediciones( ) {
        try {
            //invocamos el metodo find() excluiendo los campos que pone mongodb por defecto _id y __v: .select(['-_id', '-__v')
            const mediciones = await Medicion.find().sort({'fecha': -1}).select(['-_id', '-__v']);
            console.log("hecho");

            if(mediciones){
                return mediciones
            }

            return 404
            
          } catch (error) {
            console.log("Error: " + error);
            return 500
          }
       
    } // ()

    
    /**
     * obtenerUltimasMediciones()
     * Descripción:
     * realiza una operación de consulta a la tabla Medicion de la bd y recupera los últimos n valores guardados, siendo
     * n = cuantas
     * 
     * @param cuantas Número de mediciones que se quiere obtener
     * 
     * @return Devuelve una lista de JSON. En caso de producirse un error durante la consulta,
     *  devuelve el tipo de error producido.
     * 
     * 
     * cuantas: N -> obtenerUltimasMediciones() -->
     *  lista[{
        macSensor :Texto,
        idUsuario: Texto,
        tipoMedicion:Texto,
        medida: R,
        temperatura: Z,
        humedad: N
        fecha: N,
        latitud: R,
        longitud: R}] || 500
     */
    async obtenerUltimasMediciones( cuantas ) {

        try {
            //Obtenemos las medidas en orden descendente por fecha (sort -> -1) y con un límite:
            console.log(cuantas);
            const mediciones = await Medicion.find().sort({'fecha': -1}).limit(parseInt(cuantas)).select(['-_id', '-__v']);
            console.log("hecho");
            return mediciones
        } catch (error) {
        console.log("Error: " + error);
        return 500
        }

    } // ()


    /**
     * getMedicionesDeUsuarioPorTiempo()
     * Descripción:
     * realiza una operación de consulta a la tabla Medicion de la bd y recupera las mediciones hechas por un 
     * usuario en un periodo de tiempo determinado (POR ORDEN DE MAS ANTIGUO A MAS RECIENTE!!)
     * 
     * 
     * @param idUsuario Texto con el id del usuario
     * @param fechaIni N con la fecha en milisegundos desde cuando se quiere obtener los datos
     * @param fechaFin  N con la fecha en milisegundos hasta cuando se quiere obtener los datos. 
     * 
     * @return Devuelve una lista de JSON. En caso de producirse un error durante la consulta,
     *  devuelve el tipo de error producido.
     * 
     * 
     *  idUsuario: Texto,
     *  fechaIni: N,
     *  fechaFin: N -> getMedicionesDeUsuarioPorTiempo() -->
     *  lista[{
        macSensor :Texto,
        idUsuario: Texto,
        tipoMedicion:Texto,
        medida: R,
        temperatura: Z,
        humedad: N
        fecha: N,
        latitud: R,
        longitud: R}] || 500
     */
        async getMedicionesDeUsuarioPorTiempo( idUsuario, fechaIni, fechaFin = 0) {

            try {

                //Por si la fecha de fin es menor que la inicial, o no ponemos el parámetro fechaFin...
                if(fechaIni >= fechaFin){
                    const d = new Date();
                    fechaFin = d.getTime();
                    console.log("Fecha final menor que inicial!!")
                }

                //Obtenemos las medidas en orden ascendente de fecha (sort -> 1): de más antiguas a mas recientes
                const mediciones = await Medicion.find({idUsuario : String(idUsuario), fecha : { $gte: fechaIni, $lte: fechaFin}}).sort({'fecha': 1}).select(['-_id', '-__v']);
                console.log("hecho");
                
                return mediciones
            } catch (error) {
            console.log("Error: " + error);
            return 500
            }
    
        } // ()
    



    /**
     * getMedicionesPorTiempoZona()
     * Descripción:
     * realiza una operación de consulta a la tabla Medicion de la bd y filtra para buscar las mediciones
     * en una cuadrícula geográfica determinada por las coordenadas SO y NE de esta, y por un periodo de tiempo
     * determinado (POR ORDEN DE MAS ANTIGUO A MAS RECIENTE!!)
     * 
     * @param posicionSO Objeto con la latitud Sur (tipo R) y longitud Oeste (tipo R) de la cuadrícula
     * @param posicionNE Objeto con la latitud Norte (tipo R) y longitud Este (tipo R) de la cuadrícula
     * @param fechaIni Numero con la fecha de inicio de búsqueda 
     * @param fechaFin Numero con la fecha fin de búsqueda 
     * @param tipoMedicion Texto con el tipo de medicion 
     * 
     * @return Devuelve una lista de JSON. En caso de producirse un error durante la consulta,
     *  devuelve 400.
     * 
     * 
     * posicionSO: JSON{latitud: R, longitud:R},
     * posicionNE: JSON{latitud: R, longitud:R},
     * fechaIni: N,
     * fechaFin: N,
     * tipoMedicion: Texto -> getMedicionesPorTiempoZona() <--
     *  lista[
     * usuarios: [{
            macSensor :Texto,
            tipoMedicion:Texto,
            medida: R,
            temperatura: Z,
            humedad: N
            fecha: N,
            latitud: R,
            longitud: R}]
       oficiales: [{
            poblacion:Texto,
            codigo: N,
            tipoMedicion: Texto,
            medida: R,
            fecha: N,
            latitud: R,
            longitud: R
       }] 
          || 500
     */
    async getMedicionesPorTiempoZona( posicionSO, posicionNE, fechaIni, fechaFin = 0, tipoMedicion ) {

        try {
            if(fechaIni >= fechaFin){
                const d = new Date();
                fechaFin = d.getTime();
                console.log("Fecha final menor que inicial!!")
            }
            //Obtenemos las medidas en orden ascendente de fecha (sort -> 1): de más antiguas a mas recientes
            const medicionesUsuarios = await Medicion.find({latitud : { $gte: posicionSO.latitud, $lte: posicionNE.latitud}, longitud : { $gte: posicionSO.longitud, $lte: posicionNE.longitud},
                 fecha: { $gte: fechaIni, $lte: fechaFin}, tipoMedicion: String(tipoMedicion)}).sort({'fecha': 1}).select(['-_id', '-__v']);
            

            const medicionesOficiales = await MedicionOficial.find({latitud : { $gte: posicionSO.latitud, $lte: posicionNE.latitud}, longitud : { $gte: posicionSO.longitud, $lte: posicionNE.longitud},
                fecha: { $gte: fechaIni, $lte: fechaFin}, tipoMedicion: String(tipoMedicion)}).sort({'fecha': 1}).select(['-_id', '-__v']);

            console.log("hecho");

            console.log(medicionesUsuarios);
                

            var mediciones = [];


            for (var i = 0; i < medicionesUsuarios.length; i++){
                
                    mediciones.push({macSensor: medicionesUsuarios[i].macSensor, tipoMedicion: medicionesUsuarios[i].tipoMedicion, 
                    medida: medicionesUsuarios[i].medida, fecha: medicionesUsuarios[i].fecha, latitud: medicionesUsuarios[i].latitud,
                    longitud: medicionesUsuarios[i].longitud })
                
               
            }

            for (var i = 0; i < medicionesOficiales.length; i++){
                
                    mediciones.push({macSensor: "EstOficial_" + medicionesOficiales[i].poblacion, tipoMedicion: medicionesOficiales[i].tipoMedicion, 
                    medida: medicionesOficiales[i].medida, fecha: medicionesOficiales[i].fecha, latitud: medicionesOficiales[i].latitud,
                    longitud: medicionesOficiales[i].longitud })
                
            }

            return mediciones
        } catch (error) {
            console.log("Error: " + error);
            return 500
        }

    } // ()


    /**
     * getUltimasMedicionesPorSensor()
     * Descripción:
     * realiza una operación de consulta a la tabla Medicion de la bd y filtrar por la MAC del sensor para obtener
     * las N últimas mediciones de un sensor (POR ORDEN DE MAS RECIENTE A MAS ANTIGUO!!)
     * 
     * @param cuantas Número para obtener las N últimas mediciones
     * @param mac Texto con la MAC del sensor
     * 
     * @return Devuelve una lista de JSON. En caso de producirse un error durante la consulta,
     *  devuelve 400.
     * 
     *  cuantas: N,
        mac: Texto -> getUltimasMedicionesPorSensor() -->
        lista[{         <---
        idUsuario: Texto
        macSensor :Texto,
        tipoMedicion:Texto,
        medida: R,
        temperatura: Z,
        humedad: N
        fecha: N,
        latitud: R,
        longitud: R}]  || 500
     */
        async getUltimasMedicionesPorSensor( mac, cuantas) {

            try {
                //Obtenemos las medidas en orden descendente de fecha (sort -> -1) y con un límite:
                console.log(mac);
                const mediciones = await Medicion.find({macSensor : String(mac)}).sort({'fecha': -1}).limit(parseInt(cuantas)).select(['-_id', '-__v']);
                console.log("hecho");
                return mediciones
            } catch (error) {
            console.log("Error: " + error);
            return 500
            }
    
        } // ()




    /**
     * eliminarMedicionesPorMac()
     * Descripción:
     * realiza una operación borrado de medidas por la mac del sensor
     * 
     * @param mac Texto con la MAC del sensor
     * 
     * 
     * 
     *  mac: Texto -> eliminarMedicionesPorMac() -->
     */
    async eliminarMedicionesPorMac(mac){
        try {
            
            await Medicion.deleteMany({macSensor : String(mac)});
            console.log("hecho");
            return 200
        } catch (error) {
        console.log("Error: " + error);
            return 500
        }
    }

    /**
     * eliminarMedicionesOficialesPorMac()
     * Descripción:
     * realiza una operación borrado de medidas hechas por una estación
     * 
     * @param codigo N con el codigo de la estacion
     * 
     * 
     * 
     *  mac: Texto -> eliminarMedicionesPorMac() -->
     */
     async eliminarMedicionesOficialesPorCodigo(codigo){
        try {
            
            await MedicionOficial.deleteMany({codigo : codigo});
            console.log("hecho");
            return 200
        } catch (error) {
        console.log("Error: " + error);
            return 500
        }
    }



    /**
     * obtenerEstadisticas();
     * Descripción:
     * método que llama al método obtenerValoresEstadisticos de la clase EstadisticasMedicones
     * y devuelve una serie de datos estadísticos de una lista de mediciones.
     * 
     * @param {*} mediciones Lista JSON de mediciones
     * @returns Objeto {media: R, tiempo: N, valorMaximo: R, valoracionCalidadAire: Texto
     *                      advertencias: [JSON{fechaIni: N, fechaFin: N, periodoTiempoTranscurrido: N, mediaPeriodo: R, valorMaximoPeriodo: R}]}
     */
    obtenerEstadisticas(mediciones, tipoMedicion){
        
        try{
            return this.estadisticas.obtenerValoresEstadisticos(mediciones, tipoMedicion);
        }catch(error){
            return null;
        }
        
    }

    /**
     * obtenerDatosParaGrafico()
     * Descripción:
     * método que llama al método sacarMediaMedicionesPorPeriodo de la clase EstadisticasMedicones
     * y devuelve una lista de medias de mediciones por periodos de cada x minutos, así como la lista
     * de fechas asociadas al periodo del que se ha extraído esas medias.
     * 
     * @param {*} fechaIni 
     * @param {*} fechaFin 
     * @param {*} mediciones 
     * @returns Objeto {fechas: [lista N], medias: [lista R]}
     */
    obtenerDatosParaGrafico(fechaIni, fechaFin, mediciones){
        
        try{
            console.log("Entro a obtenerDatosParaGrafico")
            console.log(fechaIni)
            console.log(fechaFin)
            console.log(mediciones)
            var res = this.estadisticas.sacarMediaMedicionesPorPeriodo(fechaIni, fechaFin, mediciones);
            console.log("Resultado ")
            console.log(res)
            return res
        }catch(error){
            return null;
        }
    }

    //==================================================================================================
    //==================================================================================================
    // Logica de Corrección de mediciones de sensores (deltas)
    //==================================================================================================
    //==================================================================================================



    /**
     * getMedicionesOficialesUltimas24Horas():
     * Descripcion:
     * metodo para obtener una lista con todas las mediciones realizadas por las estaciones oficiales en las últimas 24 horas.
     * 
     * @returns medicionesOficiales Lista de JSON{poblacion: Texto, codigo: Texto, tipoMedicion: Texto, medida: R, fecha: N, latitud: R, longitud: R} 
     *          con las mediciones hechas por estaciones oficiales || 500 (error del servidor)
     */
     async getMedicionesOficialesUltimas24Horas (){
        console.log("Entra en getMedicionesOficialesUltimas24Horas");
        try{
            const medicionesOficiales = await MedicionOficial.find({fecha: { $gte: Date.now()-86400000, $lte: Date.now()}}).sort({'fecha': 1}).select(['-_id', '-__v']);

            console.log(medicionesOficiales);

            return medicionesOficiales;
        }catch(error){
            console.log("Error: " + error);
            return 500;
        }
        
    }


    /**
     * getMedicionesSensoresCercaEstacionOficial()
     * Descripcion: 
     * Metodo para obtener una lista de las mediciones del mismo tipo de gas que se han hecho cerca de una estacion oficial en un rango de 
     * tiempo determinado. La cercania a la estación se define por una cuadricula donde la posicion Suroeste y Nordeste
     * se separa 0.0005 grados respecto la coordenada de la estacion oficial, y el periodo comprende un rango temporal de 
     * +- 30 minutos respecto la fecha de toma de la medicion oficial que se le pasa de parametro.
     * 
     * @param {*} medicionOficial Objeto con los datos de una medicion oficial {poblacion: Texto, codigo: Texto,
     * tipoMedicion: Texto, medida: R, fecha: N, latitud: R, longitud: R}
     * @returns Lista JSON{} {macSensor: Texto; tipoMedicion: Texto; medida: R; fecha: N; latitud: R; longitud: R}
     * con las medidas del mismo tipo de gas que se encuentran dentro de la cuadricula tomadas con un periodo de +-30 minutos respecto de la fecha
     * de la medicion oficial
     */
    async getMedicionesSensoresCercaEstacionOficial(medicionOficial){
        console.log("Entra en getMedicionesSensoresCercaEstacionOficial");
        try{
            //Preparamos una cuadricula alrededor de la estacion oficial de distancia máxima de 70 metros desde el centro a los vertices de 
            // la cuadricula (para estas latitudes...)
            var posicionSO = {
                latitud: medicionOficial.latitud - 0.0005,
                longitud: medicionOficial + 0.0005
            }
    
            var posicionNE = {
                latitud: medicionOficial.latitud + 0.0005,
                longitud: medicionOficial - 0.0005
            }
    
            //Buscamos las mediciones hechas dentro de esa cuadricula con una diferencia de +-30 minutos
            // respecto de la fecha de la medicion oficial que sean del mismo tipo de gas 
            var medicionesCerca = await this.getMedicionesPorTiempoZona(posicionSO, posicionNE, medicionOficial.fecha - 1800000, medicionOficial.fecha + 1800000, 
                medicionOficial.tipoMedicion);

            return medicionesCerca;

        }catch(error){

            console.log("Error: " + error);
            return 500;
        }
    }



    /**
     * obtenerDiferenciasEntreMedicionesOficialesSensores()
     * Descripcion: 
     * metodo que a partir de una lista de mediciones oficiales se obtiene un lista de los sensores que han pasado cerca en un periodo
     * determinado de +-30 respecto a cada una de ellas y se calcula la diferencia entre la medicion del sensor y la medicion oficial,
     * almacenandolas en un Map, cuya clave es la mac del sensor y el valor una lista con el sumatorio de las diferencias en la posicion 0 
     * y el numero de veces que ese sensor ha medido cerca de una estacion en la posicion 1.
     * 
     * @param medicionesOficiales Lista de JSON con mediciones oficiales [{poblacion: Texto, codigo: Texto, tipoMedicion: Texto, medida: R, fecha: N, latitud: R, longitud: R}]
     * @returns Map( Key: macSensor, Value : [sumatorioDiferencias, vecesQueHaMedidoCerca]
     */
    async obtenerDiferenciasEntreMedicionesOficialesSensores(medicionesOficiales){
        console.log("Entra en obtenerDiferenciasEntreMedicionesOficialesSensores");

        //Declaramos un Map con clave MAC del sensor y valor un array con la suma de las diferencias entre las medidas del sensor y 
        // las oficiales, y el número de medidas hechas cerca de una estación oficial durante ese dia. Servira para sacar la media
        // de esas diferencias que será el valor de la delta.
        var diferenciaSensorMedidaOficial = new Map();

        //Para cada medicion oficial obtenida queremos obtener las mediciones de los sensores que han pasado cerca en un periodo 
        // de +- 30 minutos respecto a la fecha de obtención de la medida oficial.
        medicionesOficiales.forEach(medicionOficial => {

            //Guardamos el valor de la medida oficial
            var valorMedidaOficial = medicionOficial.medida;

            //Obtenemos todas las mediciones cercanas en ese periodo de tiempo (y para el tipo de gas que mide esa medicion)
            var medicionesSensoresCerca =  this.getMedicionesSensoresCercaEstacionOficial(medicionOficial);

            //Si hay alguna medicion, recorremos la lista de mediciones
            medicionesSensoresCerca.forEach(medicionSensor => {

                var diferencia = valorMedidaOficial - medicionSensor.medida

                //Si aun no existe ese sensor en el Map(), lo creamos:
                if(!diferenciaSensorMedidaOficial.has(medicionSensor.macSensor)){
                    //El valor se compone de un array con el primer elemento el sumatorio de las diferencias, y el segundo el nº de veces que 
                    // ha encontrado mediciones cerca de una estacion. Por defecto es 1, y si aparecen más se van sumando.
                    var valor = [diferencia, 1];
                    diferenciaSensorMedidaOficial.set(medicionSensor.macSensor, valor);
                }else{
                    var valor = diferenciaSensorMedidaOficial.get(medicionSensor.macSensor);
                    valor[0] += diferencia;
                    valor[1] ++;
                    diferenciaSensorMedidaOficial.set(medicionSensor.macSensor, valor);
                }
               
            });
        });

        return diferenciaSensorMedidaOficial;

    }


    /**
     * calcularDeltas()
     * Descripcion:
     * Metodo en el que se obtiene primero una lista de mediciones oficiales de las utlimas 24h llamando al metodo
     * getMedicionesOficialesUltimas24Horas(), y a continuacion se llama al metodo obtenerDiferenciasEntreMedicionesOficialesSensores()
     * para sacar cada sensor que ha estado cerca de una estacion en las ultimas 24h junto con las veces que ha medido cerca de estas y el
     * sumatorio de las diferencias entre las mediciones de las estaciones oficiales y las de los sensores, para calcular la media de 
     * las diferencias y actualizar el valor de la delta del sensor.
     * 
     * 
     */
    async calcularDeltas(){
        console.log("Entra en calcularDeltas");
        //Obtenemos la lista de todas las mediciones oficiales realizadas en la últimas 24h (de todo tipo los gases)
        var medicionesOficiales = await this.getMedicionesOficialesUltimas24Horas();


        var mapaMacsValores = await this.obtenerDiferenciasEntreMedicionesOficialesSensores(medicionesOficiales);

        for (let [key, value] of mapaMacsValores) {

            //Dado que obtenerDiferenciasEntreMedicionesOficialesSensores() utiliza el metodo getMedicionesPorTiempoZona() de forma indirecta 
            // para obtener todas las mediciones, y este incluye las mediciones oficiales, filtraremos la clave para que no busque las estaciones oficiales
            // en la coleccion Sensor (no la encontraria) y descartamos posibles fallos en la busqueda en la bbdd. 
            // Para comprender la expresion regular, ver getMedicionesPorTiempoZona()
            if(!/^EstOficial_/.test(key)){
                //El valor delta será la media de las diferencias 
                var delta = value[0]/value[1];
                await this.actualizarValorDeltaSensor(key, delta);
            }
            
        }
    }



    /**
     * actualizarValorDeltaSensor()
     * Descripcion:
     * Metodo que busca en la bbdd un sensor con la mac y actualiza el campo de la delta.
     * 
     * @param {*} macSensor texto con la mac del sensor
     * @param {*} valorDelta R con el valor medio calculado de la delta
     * @returns N con el codigo de si ha ido bien o no
     */
    async actualizarValorDeltaSensor( macSensor, valorDelta ){
        console.log("Entra en actualizarValorDeltaSensor");
        try { 
            //sensor es el documento antes de actualizar la delta
            var sensor = await Sensor.findOneAndUpdate({ macSensor: String(macSensor) }, { delta: valorDelta });

            if(sensor.macSensor == macSensor){
                console.log("hecho");
                return 200
            }

            return 400
           
        } catch (error) {
            console.log("Error: " + error);
            return 500
        }
    }

    
    

    //==================================================================================================
    //==================================================================================================
    // Logica de Sensores
    //==================================================================================================
    //==================================================================================================

    /**
     * guardarSensor()
     * Descripción:
     * realiza una operación de inserción en la tabla Sensores de la bd.
     * 
     * @param macSensor Texto con la MAC del sensor.
     * @param tipoMedicion Texto con el tipo de gas que mide el sensor
     * @param correo Texto con el correo del usuario que registra ese sensor
     * 
     * @return En caso de guardarse correctamente en la bd devuelve 200. En caso de producirse un error,
     *  devuelve 400.
     * 
        macSensor:Texto,
        tipoMedicion:Texto,
        correo: Texto -> guardarSensor() ->
        respuesta: 200 || 400 <-
     * 
     */
    async guardarSensor(macSensor, tipoMedicion, correo){
        try {

            //Comprobamos si el sensor ya está registrado
            var sensorBuscado = await this.buscarSensor(macSensor);
            
            console.log("Resultado de busqueda se sensor:")
            console.log(sensorBuscado)
            console.log(correo)

            if(sensorBuscado == 404){

                if( macSensor && tipoMedicion && correo){
                    const nuevoSensor = new Sensor( {macSensor : String(macSensor), tipoMedicion: String(tipoMedicion), 
                        fechaRegistro: Date.now(), correoUsuario: String(correo)} );
    
                    console.log(nuevoSensor)
    
                    await nuevoSensor.save();
    
                    return 200
    
                }else{
                    console.log("Error: faltan parametros");
                    return 400
                    
                }
            }else{
                console.log("Sensor ya registrado");
                return 403
            }
                  
            
    
        } catch (error) {
            console.log("Error: " + error);
            return 500
        }
    }

/**
     * buscarSensor()
     * Descripción:
     * realiza una operación de búsqueda en la tabla Sensores de la bd para encontrar un sensor con la misma mac
     * que la que se pasa por parametro.
     * 
     * @param mac Texto con la MAC del sensor a buscar
     * 
     * @return En caso de encontrar un sensor que coincide con la MAC en la bd devuelve JSON con los datos del sensor.
     *  En caso contrario, devuelve 404. En caso de producirse un error, devuelve 400.
     * 
     *  mac:Texto -> buscarSensor() ->
        JSON  <-
        {
        macSensor:Texto,
        nombreSensor: Texto,
        uuid: Texto,
        tipoMedicion:Texto,
        fechaRegistro: N,
        fechaUltimaMedicion: N
        } 
        || respuesta: 404 || 500
     * 
     */
    async buscarSensor(mac){

        try {
            // Invocamos el metodo findOne() porque sólo deberia haber un registro si lo hay,
            // excluiendo los campos que pone mongodb por defecto _id y __v: .select(['-_id', '-__v')
            // Devuelve un JSON:
            const sensor = await Sensor.findOne({macSensor: String(mac)}).select(['-_id', '-__v']);
            console.log("hecho");

            console.log(sensor);

            if(sensor){
                return sensor
            }

            //No se ha encontrado nada
            return 404
            
          } catch (error) {
            console.log("Error: " + error);
            return 500
          }
    }


    /**
     * obtenerTodosLosSensores()
     * Descripción:
     * realiza una operación de consulta a la tabla Sensores de la bd y recupera todos los valores guardados.
     * 
     * @return Devuelve una lista de JSON. En caso de producirse un error durante la consulta,
     *  devuelve 400.
     * 
     * obtenerTodosLosSensores() <--
     * lista [JSON  <-
        {
        macSensor:Texto,
        correoUsuario, Texto,
        tipoMedicion:Texto,
        fechaRegistro: N
        } ] || respuesta: 500
     */
     async obtenerTodosLosSensores( ) {
        try {
            //invocamos el metodo find() excluiendo los campos que pone mongodb por defecto _id y __v: .select(['-_id', '-__v')
            const sensores = await Sensor.find().sort({'fechaRegistro': 1}).select(['-_id', '-__v']);
            console.log("hecho");
            return sensores
          } catch (error) {
            console.log("Error: " + error);
            return 500
          }
       
    } // ()


    /**
     * obtenerSensoresInactivos()
     * Descripción:
     * Método para obtener una lista de los sensores que no han enviado ninguna medición en al menos las últimas 24 h.
     * 
     * 
     * @return res Lista de JSON con la información de los sensores que no han estado activos en al menos las 
     * últimas 24 h.
     * @return 500 Codigo de error de que ha habido un fallo interno
     * 
     * obtenerSensoresInactivos() <-
     * lista [JSON  <-
        {
        macSensor:Texto,
        correoUsuario, Texto,
        tipoMedicion:Texto,
        fechaRegistro: N
        } ] || respuesta: 500
     * 
     */
    async obtenerSensoresInactivos(){
        try{

            var fechaActual = Date.now();

            var sensores = await this.obtenerTodosLosSensores();
            var res = [];

            for(var i = 0; i < sensores.length; i++){
                //Bucamos la última medición de cada sensor con getUltimasMedicionesPorSensor(mac, cuantas = 1);
                var ultimaMedicion = await this.getUltimasMedicionesPorSensor(sensores[i].macSensor, 1);

                //Comprobamos si la fecha de la última medición de cada sensor es menor que la fecha actual - 24 horas (86400000 ms)...
                // Si se cumple, añadimos el sensor a la lista res
                if(ultimaMedicion.fecha < (fechaActual - 86400000) || ultimaMedicion.length == 0){
                    res.push(sensores[i]);
                }

            }

            return res;

        }catch(error){
            return 500;
        }
    }


    /**
     * obtenerInformeMedicionesSensores()
     * Descripción:
     * Método para valorar si durante un periodo determinado los sensores que han estado emitiendo datos han registrado datos negativos,
     * 0, y si la media de las mediciones de cada sensor ha estado muy por encima o por debajo de la media global para una zona geográfica 
     * determinada.
     * 
     * @param {*} medicionesPorCiudadGasYPeriodo Lista de mediciones filtrada por una ciudad, tipo de gas y en un periodo de tiempo determiando
     * 
     * @returns Lista con la valoración de cada sensor
     */
    async obtenerInformeMedicionesSensores(medicionesPorCiudadGasYPeriodo){
        try{
            var res = this.estadisticas.advertenciasMedicionesSensores(medicionesPorCiudadGasYPeriodo);
            return res;
        }catch(error){
            console.log(error)
            return 500;
        }
    }


    
    /**
     * eliminarSensorPorMac()
     * Descripción:
     * realiza una operación borrado de un sensor por su mac 
     * 
     * @param mac Texto con la MAC del sensor
     * 
     * 
     *  mac: Texto -> eliminarSensorPorMac() -->
     */
     async eliminarSensorPorMac(mac){
        try {
            
            await Sensor.deleteMany({macSensor : String(mac)});
            console.log("hecho");
            return 200
        } catch (error) {
            console.log("Error: " + error);
            return 500
        }
    }



    /**
     * registrar()
     * Descripción:
     * Método para registrar el usuario y su sensor en la bbdd (en las colecciones Usuarios y Sensores)
     * 
     * @param {*} datosUsuario JSON con los datos del usuario: nombreUsuario: Texto, correo: Texto, contrasenya: Texto, telefono: N.
     * @param {*} datosSensor JSON con los datos del sensor: macSensor: Texto, tipoMedicion: Texto
     * @returns 
     */
    async registrar(datosUsuario, datosSensor){
        try{

            var usuarioRegistrado = await this.registrarUsuario(datosUsuario.nombreUsuario, datosUsuario.correo, 
                datosUsuario.contrasenya, datosUsuario.telefono, datosSensor.macSensor);
            console.log("Resultado1");
            console.log(usuarioRegistrado);
            console.log(datosUsuario.correo)

            if(usuarioRegistrado == 200){
                var sensorRegistrado = await this.guardarSensor(datosSensor.macSensor, datosSensor.tipoMedicion, datosUsuario.correo);
                console.log("Resultado2");
                console.log(sensorRegistrado);

                if(sensorRegistrado == 200){
                    return 200;

                }else if(sensorRegistrado == 400){
                    await this.eliminarUsuario(datosUsuario.correo);
                    return 400;
                }else{
                    await this.eliminarUsuario(datosUsuario.correo);
                    return "Error sensor";
                }
            }else if(usuarioRegistrado == 400){
                return 400;
            }else{
                return "Error usuario";
            }


        }catch(error){
            return 500;
        }
    }





    //==================================================================================================
    //==================================================================================================
    // Metodos de la logica de Usuarios
    //==================================================================================================
    //==================================================================================================

    /**
     * registrarUsuario()
     * Descripción:
     * realiza una operación de inserción en la colección Usuarios
     * 
     * @param nombreUsuario Texto con el nombre del usuario
     * @param correo Texto con el email del usuario
     * @param contrasenya Texto 
     * @param telefono Número de contacto con el usuario
     * 
     * @return En caso de guardarse correctamente en la bd devuelve 200. En caso de producirse un error,
     *  devuelve 400.
     * 
     *  nombreUsuario: Texto,
     *  correo: Texto,
     *  contrasenya: Texto,
     *  telefono: N --> registrarUsuario() -->
     *  respuesta: 200 || 400 || 403 || 500  <--
     */
    async registrarUsuario(nombreUsuario, correo, contrasenya, telefono, macSensor){
        try {
            
            //Comprobamos si este correo ya está registrado
            var usuarioYaRegistrado = await this.comprobarSiEsteUsuarioEstaRegistrado(correo);

            //Si no lo está...
            if(!usuarioYaRegistrado){
                if( nombreUsuario && correo && contrasenya && telefono && macSensor){
                    const nuevoUsuario = new Usuario( {nombreUsuario : String(nombreUsuario), correo: String(correo),
                         contrasenya: String(contrasenya), telefono: telefono, macSensor: String(macSensor)} );
    
                    console.log(nuevoUsuario)
    
                    await nuevoUsuario.save();
                    return 200
    
                }else{
                    console.log("Error: faltan parametros");
                    return 400   
                }
            }else{
                console.log("Operación no autorizada: el usuario ya está registrado");
                return 403
            }
    
        } catch (error) {
            console.log("Error: " + error);
            return 500
        }
    }


    /**
     * buscarUsuario()
     * Descripción:
     * realiza una operación de búsqueda de un usuario por su correo y contraseña en la colección Usuarios (solo
     * deberia haber un usuario con ese correo)
     * 
     * @param correo Texto con el email del usuario
     * @param contrasenya Texto
     * 
     * @return En caso de encontrar un usuario que coincide con el correo y la contraseña en la bd devuelve JSON con los datos del usuario.
     *  En caso contrario, devuelve 404. En caso de producirse un error, devuelve 400.
     * 
     *  correo: Texto --> buscarUsuario() <--
     *  JSON <--
     *  {       
     *  nombreUsuario: Texto,
     *  correo: Texto,
     *  contrasenya: Texto,
     *  telefono: N,
     *  macSensor: Texto 
     *  }  || 404 (no encontrado) || 500   <--
     **/
    async buscarUsuario(correo , contrasenya){
        try {
            // Invocamos el metodo findOne() porque sólo deberia haber un registro si lo hay,
            // excluiendo los campos que pone mongodb por defecto  __v: .select(['-__v']) 
            // Devuelve un JSON:
            const usuario = await Usuario.findOne({correo: String(correo), contrasenya: String(contrasenya)}).select(['-__v']);
            console.log("hecho");

            console.log(usuario);

            //Para recuperar el id que pone mongoose por defecto
           // console.log(usuario.id)

            if(usuario){
                return usuario
            }

            //No se ha encontrado nada
            return 404
            
          } catch (error) {
            console.log("Error: " + error);
            return 500
          }
    }



    /**
     * comprobarSiEsteUsuarioEstaRegistrado()
     * Descripción:
     * realiza una operación de búsqueda de un usuario por su correo en la colección Usuarios (solo
     * deberia haber un usuario con ese correo) y si lo encuentra devuelve Verdadero
     * 
     * @param correo Texto con el email del usuario
     * 
     * @return En caso de encontrar un usuario que coincide con el correo en la bd devuelve True.
     *  En caso contrario, devuelve False. En caso de producirse un error, devuelve 400.
     * 
     *  correo: Texto --> comprobarSiEsteUsuarioEstaRegistrado() <--
     *  V/F || 500  <--
     **/
    async comprobarSiEsteUsuarioEstaRegistrado(correo){
        try {
            // Invocamos el metodo findOne() porque sólo deberia haber un registro si lo hay,
            // excluiendo los campos que pone mongodb por defecto  __v: .select(['-__v']) 
            // Devuelve un JSON:
            const usuario = await Usuario.findOne({correo: String(correo)}).select(['-__v']);
            console.log("hecho");

            console.log(usuario);

            if(usuario){
                return true
            }

            //No se ha encontrado nada
            return false
            
          } catch (error) {
            console.log("Error: " + error);
            return 500
          }
    }





    /**
     * actualizarMacSensorUsuario()
     * Descripción:
     * actualiza el campo de macSensor de un usuario por si cambiase de sensor
     * 
     * @param correo Texto con el correo del usuario
     * @param macSensor Texto con la mac del nuevo sensor
     * 
     *  correo: Texto,
     *  macSensor: Texto -> eliminarUsuario() -->
     */
    async actualizarMacSensorUsuario(idUsuario, macSensor){
        
        try { 
            await Usuario.findOneAndUpdate({ _id: idUsuario }, { macSensor: String(macSensor) });
            console.log("hecho");
            return 200
        } catch (error) {
            console.log("Error: " + error);
            return 500
        }
    }


    /**
     * actualizarDatosUsuario()
     * Descripción:
     * actualiza el campo de macSensor de un usuario por si cambiase de sensor
     * 
     * @param correo Texto con el correo del usuario
     * @param macSensor Texto con la mac del nuevo sensor
     * 
     *  correo: Texto,
     *  macSensor: Texto -> eliminarUsuario() -->
     */
     async actualizarDatosPersonalesUsuario(idUsuario, usuario){
        
        try { 
            var usuario = await Usuario.findOneAndUpdate({ _id: String(idUsuario) }, { nombreUsuario: String(usuario.nombreUsuario), telefono: String(usuario.telefono) }, {
                new: true
              });
            console.log("hecho");
            if (usuario != null){
                return usuario
            }
            return 400
            
        } catch (error) {
            console.log("Error: " + error);
            return 500
        }
    }//*/


    
    /**
     * cambiarContrasenyaUsuario()
     * Descripción:
     * actualiza el campo de macSensor de un usuario por si cambiase de sensor
     * 
     * @param correo Texto con el correo del usuario
     * @param macSensor Texto con la mac del nuevo sensor
     * 
     *  correo: Texto,
     *  macSensor: Texto -> eliminarUsuario() -->
     *
     async cambiarContrasenyaUsuario(usuario){
        
        try { 
            await Usuario.findOneAndUpdate({ correo: String(usuario.correo) }, { contrasenya: String(usuario.contrasenya) });
            console.log("hecho");
            return 200
        } catch (error) {
            console.log("Error: " + error);
            return 500
        }
    }*/





    /**
     * eliminarUsuario()
     * Descripción:
     * realiza una operación borrado de un usuario 
     * 
     * @param correo Texto con el correo del usuario
     * 
     * 
     *  correo: Texto -> eliminarUsuario() -->
     */
     async eliminarUsuario(correo){
        try {

            //Como solo 
            await Usuario.deleteOne({correo : correo});
            console.log("hecho");
            return 200
        } catch (error) {
            console.log("Error: " + error);
            return 500
        }
    }




    //==================================================================================================
    //==================================================================================================
    // Metodos de la logica de Ciudad
    //==================================================================================================
    //==================================================================================================

    async buscarPoblacion(nombrePoblacion){
        try {
            const poblacion = await Poblacion.findOne({nombrePoblacion: String(nombrePoblacion)}).select(['-__v']);
            console.log("hecho");
            console.log(poblacion);

            if(poblacion){
                return poblacion;
            }

            return 404
        } catch (error) {
            console.log("Error: " + error);
            return 500
        }
    }


    async guardarPoblacion(poblacion){

        try {
            // Si creamos una lista con el mismo nombre que las clables del json, se añaden los valores automáticamente a cada variable            
            if(poblacion.nombrePoblacion && poblacion.posicionSO && poblacion.posicionNE ){

                const nuevaPoblacion = new Poblacion( {nombrePoblacion: poblacion.nombrePoblacion, posicionSO : {latitud: poblacion.posicionSO.latitud, longitud: poblacion.posicionSO.longitud},
                    posicionNE : {latitud: poblacion.posicionNE.latitud, longitud: poblacion.posicionNE.longitud}});
                console.log(nuevaPoblacion)
                
                //Guardamos la nueva medición
                await nuevaPoblacion.save();

                return 200

            }else{
                console.log("Error");
                return 400     
            }
    
        } catch (error) {
            console.log("Error: " + error);
            return 500
        }
    }


}// class()