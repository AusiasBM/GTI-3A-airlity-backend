/**
 * MedicionOficial.js
 * @author Aitor Benítez Estruch
 * @date: 2021/12/13
 * 
 * @description:
 * Modelo ORM de Mongoose donde se impementa la estructura de los documentos de la colección MedicionOficials 
 * donde se almacenarán las mediciones de las estaciones de contaminación oficiales que hay en determinadas poblaciones
 * Estructura: 
 * MedicionOficial
 * {
 * poblacion: Texto,
 * codigo: Texto
 * tipoMedicion: Texto
 * medida: R
 * fecha: N
 * latitud: R
 * longitud: R
 * }
 * 
 */


 const mongoose =  require('mongoose');

 // Get del atributo medición, gracias a este get en el json muestra la medición como string,
 // y no como Decimal128.
 function med (val) {
     if (!val) return val;
     return parseFloat(val.toString());
   }
 
 const MedicionOficialSchema = new mongoose.Schema ({
 
    poblacion : {
         type: String,
         required: true,
     },
 
     ciudad : {
         type: String,
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
 
 MedicionOficialSchema.set('toJSON', { getters: true, virtuals: false });
 
 module.exports = mongoose.connection.model( "MedicionOficial", MedicionOficialSchema );