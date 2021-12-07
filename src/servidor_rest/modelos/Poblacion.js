/**
 * Poblacion.js
 * @author Aitor Benítez Estruch
 * @date: 2021/11/02
 * 
 * @description:
 * Modelo ORM de Mongoose donde se impementa la estructura de los documentos de la colección Sensors
 * Estructura: 
 * Poblacion
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

const PoblacionSchema = new Schema ({

    nombrePoblacion : {
        type: String,
        required: true
    },

    posicionSO : {
        latitud:{
            type: Schema.Types.Decimal128,
            required: true
        },
        longitud:{
            type: Schema.Types.Decimal128,
            required: true
        }
    },

    posicionNE : {
        latitud:{
            type: Schema.Types.Decimal128,
            required: true
        },
        longitud:{
            type: Schema.Types.Decimal128,
            required: true
        }
    }

});

PoblacionSchema.set('toJSON', { getters: true, virtuals: false });

module.exports = model ( "Poblacion", PoblacionSchema );