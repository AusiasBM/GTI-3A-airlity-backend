const mongoose =  require('mongoose');

// Get del atributo medición, gracias a este get en el json muestra la medición como string,
// y no como Decimal128.
function med (val) {
    if (!val) return val;
    return val.toString();
  }

const MedicionSchema = new mongoose.Schema ({

    mac : {
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
        type: Date,
        default: Date.now() + 2*3600*1000, // al sumar 2, estamos ajustando la hora de españa
        required: false
    },
    lat : {
        type: mongoose.Schema.Types.Decimal128,
        required: true,
        get: med,
    },
    lng: {
        type: mongoose.Schema.Types.Decimal128,
        required: true,
        get: med,
    }

});

MedicionSchema.set('toJSON', { getters: true, virtuals: false });

module.exports = mongoose.connection.model( "Medicion", MedicionSchema );