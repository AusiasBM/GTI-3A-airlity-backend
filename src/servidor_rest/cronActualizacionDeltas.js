/**
 * cronActualizacionDeltas.js
 * @author Aitor Benítez Estruch
 * @date 03/01/2022
 * @description:
 * Archivo para la ejecución de la tarea programada de recalibracion de los sensores que han estado midiendo
 * cerca de una estacion oficial.
 */

var cron = require('node-cron');
const LogicaNegocio = require('./LogicaNegocio.js')


var laLogica = new LogicaNegocio()
var task = cron.schedule('*/30 * * * * *', () => {
    console.log('running a task every 30 seconds');
    //laLogica.calcularDeltas();


  },{
    scheduled: false
  });


module.exports.iniciarTarea =  function(){
  task.start();
}

module.exports.pararTarea = function(){
  task.stop();
}