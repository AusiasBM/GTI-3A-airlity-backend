/**
 * Sensor.js
 * @author Aitor Benítez Estruch
 * @date: 2021/11/02
 * 
 * @description:
 * Modelo ORM de Mongoose donde se impementa la estructura de los documentos de la colección Sensors
 * Estructura: 
 * Sensor
 * {
 * macSensor: Texto
 * nombreSensor: Texto
 * tipoMedicion: Texto
 * fechaRegistro: N
}
 * 
 */

const { Schema, model, Mongoose } = require("mongoose");

// Get del atributo medición, gracias a este get en el json muestra la medición como string,
// y no como Decimal128.
function med (val) {
    if (!val) return val;
    return val.toString();
  }

const SensorSchema = new Schema ({

    macSensor : {
        type: String,
        required: true,
    },

    correoUsuario : {
        type: String,
        required: true,
    },

    tipoMedicion : {
        type: String,
        required: true,
    },
    
    fechaRegistro:{
        type: Number,
        required: true
    },
    delta:{
        type: Schema.Types.Decimal128,
        required: false,
        default: 0
    }

});

SensorSchema.set('toJSON', { getters: true, virtuals: false });

module.exports = model ( "Sensor", SensorSchema );