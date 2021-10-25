// importamos solo las rutas de la librería express
const {Router} = require("express");
const ctrMediciones = require("../controladores/logicaDelNegocio");
const rutasMediciones = Router();

rutasMediciones.get('/todas-las-mediciones', ctrMediciones.obtenerTodasLasMediciones);

rutasMediciones.post('/anyadir-medicion', ctrMediciones.guardarMedicion);


module.exports = rutasMediciones; // Exportamos todas las rutas