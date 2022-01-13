/**
 * Usuario.js
 * @author Aitor Benítez Estruch
 * @date: 2021/11/02
 * 
 * @description:
 * Modelo ORM de Mongoose donde se impementa la estructura de los documentos de la colección Usuarios
 * Estructura: 
 * Usuario
 * {
 * _id: Texto
 * nombreUsuario: Texto
 * correo: Texto
 * contraseña: Texto
 * telefono: N
 * macSensor: Texto
 * }
 * 
 */

const { Schema, model, Mongoose } = require("mongoose");

// Get del atributo medición, gracias a este get en el json muestra la medición como string,
// y no como Decimal128.
function med (val) {
    if (!val) return val;
    return val.toString();
  }

const UsuarioSchema = new Schema ({

    nombreUsuario : {
        type: String,
        required: true
    },

    correo : {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                return /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/.test(v)
            }
        }
    },

    contrasenya : {
        type: String,
        required: true,
    },
    
    telefono:{
        type: Number,
        required: true
    },

    macSensor : {
        type: String,
        required: true,
    },

    rol:{
        type: String,
        default: "Usuario",
        required: true
    },

    verificacion:{
        type: String
    },

    status:{
        type: Boolean,
        default: false,
        required: true
    }


});

UsuarioSchema.set('toJSON', { getters: true, virtuals: false });

module.exports = model ( "Usuario", UsuarioSchema );