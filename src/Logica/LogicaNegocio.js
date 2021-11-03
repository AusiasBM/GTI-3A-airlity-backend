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
 const Sensor = require("./modelos/Sensor");


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
     * @param medida Array de Textos JSON.
     * 
     * @return En caso de guardarse correctamente en la bd no devuelve nada. En caso de producirse un error,
     *  devuelve el tipo de error producido.
     * 
     *  * mediciones: lista<Texto>
     * -->
     * guardarMediciones() -->
     * 0 || err
     */
    async guardarMediciones(mediciones){
        console.log(mediciones)
        for(var i = 0; i < mediciones.length; i++){
            var medicion = JSON.parse(mediciones[i])
            console.log(medicion)
            console.log(medicion.medida)

                var res = await this.guardarMedicion(medicion)

                console.log(i)
                if(res == 400){
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
     * @param req Objeto JSON con los datos que contiene cada medición.
     * 
     * @return En caso de guardarse correctamente en la bd devuelve 200. En caso de producirse un error,
     *  devuelve 400.
     * 
     * JSON{
        macSensor :Texto,
        tipoMedicion:Texto,
        medida: R,
        temperatura: Z,
        humedad: N
        fecha: N,
        latitud: R,
        longitud: R} -> guardarMedicion() ->
        respuesta: 200 || 400 <-
     * 
     */
    async guardarMedicion( req ) {
        console.log(req)
        
        try {
            // Si creamos una lista con el mismo nombre que las clables del json, se añaden los valores automáticamente a cada variable            
            if( req.macSensor && req.tipoMedicion && req.medida && req.temperatura && req.humedad && req.fecha && req.latitud && req.longitud ){

                const nuevaMedicion = new Medicion( {macSensor : String(req.macSensor), tipoMedicion: String(req.tipoMedicion), medida : req.medida, temperatura:req.temperatura,
                     humedad:req.humedad, fecha:req.fecha, lat:req.latitud, lng: req.longitud } );
                console.log(nuevaMedicion)
                
                await nuevaMedicion.save();

                var res = await this.actualizarFechaUltimaMedicionSensor(req.macSensor, req.fecha);

                if(res == 400){
                    console.log("Error actualizando la ultima fecha del sensor");
                }

                return 200

            }else{
                console.log("Error");
                return 400     
            }
    
        } catch (error) {
            console.log("Error: " + error);
            return 400
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
        tipoMedicion:Texto,
        medida: R,
        temperatura: Z,
        humedad: N
        fecha: N,
        latitud: R,
        longitud: R }] || respuesta: 400
     */
    async obtenerTodasLasMediciones( ) {
        try {
            //invocamos el metodo find() excluiendo los campos que pone mongodb por defecto _id y __v: .select(['-_id', '-__v')
            const mediciones = await Medicion.find().select(['-_id', '-__v']);
            console.log("hecho");
            return mediciones
          } catch (error) {
            console.log("Error: " + error);
            return 400
          }
       
    } // ()

    
    /**
     * obtenerTodasLasMediciones()
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
        tipoMedicion:Texto,
        medida: R,
        temperatura: Z,
        humedad: N
        fecha: N,
        latitud: R,
        longitud: R}] || 400
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
        return 400
        }

    } // ()



    /**
     * buscarMedidasPorTipo()
     * Descripción:
     * realiza una operación de consulta a la tabla Medicion de la bd y filtrar por el tipo de medida para obtener
     * las mediciones de un tipo de gas
     * 
     * @param tipo Texto con el tipo de gas que se quiere obtener 
     * 
     * @return Devuelve una lista de JSON. En caso de producirse un error durante la consulta,
     *  devuelve 400.
     * 
     * 
     * tipo: Texto -> buscarMedidasPorTipo() -->
     *  lista[{
        macSensor :Texto,
        tipoMedicion:Texto,
        medida: R,
        temperatura: Z,
        humedad: N
        fecha: N,
        latitud: R,
        longitud: R}]  || 400
     */
    async buscarMedidasPorTipo( tipo ) {

        try {
            //Obtenemos las medidas en orden descendente por fecha (sort -> -1) y con un límite:
            console.log(tipo);
            const mediciones = await Medicion.find({tipoMedicion : String(tipo)}).sort({'fecha': -1}).select(['-_id', '-__v']);
            console.log("hecho");
            return mediciones
        } catch (error) {
        console.log("Error: " + error);
        return 400
        }

    } // ()


    /**
     * buscarMedidasPorSensor()
     * Descripción:
     * realiza una operación de consulta a la tabla Medicion de la bd y filtrar por la MAC del sensor para obtener
     * las mediciones de un sensor
     * 
     * @param mac Texto con la MAC del sensor
     * 
     * @return Devuelve una lista de JSON. En caso de producirse un error durante la consulta,
     *  devuelve 400.
     * 
     * 
     * mac: Texto -> buscarMedidasPorSensor() -->
     *  lista[{
        macSensor :Texto,
        tipoMedicion:Texto,
        medida: R,
        temperatura: Z,
        humedad: N
        fecha: N,
        latitud: R,
        longitud: R}]  || 400
     */
        async buscarMedidasPorSensor( mac ) {

            try {
                //Obtenemos las medidas en orden descendente por fecha (sort -> -1) y con un límite:
                console.log(mac);
                const mediciones = await Medicion.find({macSensor : String(mac)}).sort({'fecha': -1}).select(['-_id', '-__v']);
                console.log("hecho");
                return mediciones
            } catch (error) {
            console.log("Error: " + error);
            return 400
            }
    
        } // ()











    

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
     * @param sensor Objeto JSON con los datos que contiene un sensor.
     * 
     * @return En caso de guardarse correctamente en la bd devuelve 200. En caso de producirse un error,
     *  devuelve 400.
     * 
     * JSON{
        macSensor
        :Texto,
        nombreSensor: Texto,
        uuid: Texto,
        tipoMedicion:Texto,
        fechaRegistro: N,
        fechaUltimaMedicion: N } -> guardarSensor() ->
        respuesta: 200 || 400 <-
     * 
     */
    async guardarSensor(sensor){
        try {
                  
            if( sensor.macSensor && sensor.nombreSensor && sensor.uuid && sensor.tipoMedicion && sensor.fecha){
                const nuevoSensor = new Sensor( {macSensor : sensor.macSensor, nombreSensor: String(sensor.nombreSensor), uuid : String(sensor.uuid),
                    tipoMedicion: String(sensor.tipoMedicion), fechaRegistro: sensor.fecha, fechaUltimaMedicion: sensor.fecha} );

                console.log(nuevoSensor)

                await nuevoSensor.save();

                return 200

            }else{
                console.log("Error: faltan parametros");
                return 400
                
            }
    
        } catch (error) {
            console.log("Error: " + error);
            return 400
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
        || respuesta: 404 || 400
     * 
     */
    async buscarSensor(mac){
        console.log(mac);

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
            return 400
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
     * obtenerTodosLosSensores() -->
     * lista [JSON  <-
        {
        macSensor:Texto,
        nombreSensor: Texto,
        uuid: Texto,
        tipoMedicion:Texto,
        fechaRegistro: N,
        fechaUltimaMedicion: N
        } ] || respuesta: 400
     */
     async obtenerTodosLosSensores( ) {
        try {
            //invocamos el metodo find() excluiendo los campos que pone mongodb por defecto _id y __v: .select(['-_id', '-__v')
            const sensores = await Sensor.find().select(['-_id', '-__v']);
            console.log("hecho");
            return sensores
          } catch (error) {
            console.log("Error: " + error);
            return 400
          }
       
    } // ()



    /**
     * obtenerTodosLosSensores()
     * Descripción:
     * realiza una actualización de la fecha de registro de la última medida hecha por el sensor, filtrando por su MAC.
     * 
     * 
     * @param mac Texto con la MAC del sensor a buscar
     * @param fecha N de la fecha en milisegundos en la que registró la medición
     * 
     * @return Devuelve un JSON. En caso de producirse un error durante la consulta,
     *  devuelve 400.
     * 
     * mac:Texto,
       fechaMedicion:N -> actualizarFechaUltimaMedicionSensor() ->
       respuesta: 200 || 400
     */
    async actualizarFechaUltimaMedicionSensor(mac, fecha){
        try {

            console.log("Entra en actualizarFechaUltimaMedicionSensor");
            //invocamos el metodo find() excluiendo los campos que pone mongodb por defecto _id y __v: .select(['-_id', '-__v')
            const sensor = await Sensor.findOneAndUpdate({macSensor: String(mac)}, {fechaUltimaMedicion: fecha}, {
                new: false, //no quiero que devuelva el valor actualizado
                upsert: false //no quiero insertar solo la mac y la fecha si no lo encuentra
              });
            console.log("hecho");
            return 200
          } catch (error) {
            console.log("Error: " + error);
            return 400
          }
    }


}// class()