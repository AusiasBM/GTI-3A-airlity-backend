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

    nombreSensor : {
        type: String,
        required: true,
    },

    uuid : {
        type: String,
        required: true,
    },

    tipoMedicion : {
        type: String,
        required: true,
    },
    
    fechaRegistro:{
        type: Date,
        required: true
    },

    fechaUltimaMedicion: {
        type: Date,
        default: Date.now() + 2*3600*1000, // al sumar 2, estamos ajustando la hora de españa
        required: false
    }

});

SensorSchema.set('toJSON', { getters: true, virtuals: false });

module.exports = model ( "Sensor", SensorSchema );