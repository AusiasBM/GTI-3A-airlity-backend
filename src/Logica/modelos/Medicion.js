const mongoose =  require('mongoose');

// Get del atributo medición, gracias a este get en el json muestra la medición como string,
// y no como Decimal128.
function med (val) {
    if (!val) return val;
    return val.toString();
  }

const MedicionSchema = new mongoose.Schema ({

    macSensor : {
        type: String,
        default: "00:00:00:00:00:00",
        required: true,
    },

    tipoMedicion : {
        type: String,
        default: "Calidad del aire",
        required: true,
    },

    medida : {
        type: mongoose.Schema.Types.Decimal128,
        required: true,
        get: med,
    },
    
    temperatura:{
        type: Number,
        required: true,
        get: med,
    },

    humedad:{
        type: Number,
        required: true,
        get: med,
    }, 

    fecha: {
        type: Number,
        required: true
    },
    latitud : {
        type: mongoose.Schema.Types.Decimal128,
        required: true,
        get: med,
    },
    longitud: {
        type: mongoose.Schema.Types.Decimal128,
        required: true,
        get: med,
    }

});

MedicionSchema.set('toJSON', { getters: true, virtuals: false });

module.exports = mongoose.connection.model( "Medicion", MedicionSchema );