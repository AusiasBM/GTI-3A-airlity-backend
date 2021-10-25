const { Schema, model, Mongoose } = require("mongoose");

// Get del atributo medición, gracias a este get en el json muestra la medición como string,
// y no como Decimal128.
function med (val) {
    if (!val) return val;
    return val.toString();
  }

const MedicionSchema = new Schema ({

    medicion : {
        type: Schema.Types.Decimal128,
        required: true,
        get: med,
    },
    tipoMedicion : {
        type: String,
        default: "Calidad del aire"
    },
    fecha: {
        type: Date,
        default: Date.now() + 2*60*60*1000, // al sumar 2, estamos ajustando la hora de españa
        required: false
    },
    lat : {
        type: Schema.Types.Decimal128,
        required: true,
        get: med,
    },
    lng: {
        type: Schema.Types.Decimal128,
        required: true,
        get: med,
    }

});

MedicionSchema.set('toJSON', { getters: true, virtuals: false });

module.exports = model ( "Medicion", MedicionSchema );