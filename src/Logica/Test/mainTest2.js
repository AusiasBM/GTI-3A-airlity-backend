// ........................................................
const LogicaNegocio = require( "../logicaNegocio.js" )
var assert = require ('assert')


// ........................................................
// main ()
// ........................................................
describe( "Test: insertar un sensor, recuperar todos los sensores, buscar un sensor por su MAC ", function() {
    // ....................................................
    // ....................................................
    var laLogica = new LogicaNegocio()

    //Eliminamos los sensores de prueba antes de iniciar el test (por si acaso...)
    var mac = "00:00:00:00:00:00";
    laLogica.eliminarSensorPorMac(mac);

    // ....................................................
    // ....................................................

    it( "Puedo insertar un sensor",
        async function() {
            try{
                const d = new Date();
            var t = d.getTime();
            
            var sensor = 
            {
                macSensor: "00:00:00:00:00:00",
                nombreSensor : "SensorDeProva",
                tipoMedicion: "PROVA",
                fechaRegistro: t
            }
            
            var res = await laLogica.guardarSensor(sensor)
            assert.equal( res, 200 , "¿No se ha insertado?" )
            } catch( err ) {
            // assert.equal( 0, 1, "cerrar conexión a BD fallada: " + err)
                throw new Error( "Error: " + err)
            }
    }) // it

     // ....................................................
    // ....................................................
    it("Comprovar que puedo obtener todos los sensores guardados ordenados por fecha de registro descendente", async function(){
        
        //Comprovar qué asignatura/s está matriculado
        var res = await laLogica.obtenerTodosLosSensores()

        assert.equal( res.length, res.length , "¿no hay un resulado?" )
        assert.equal( res[res.length-1].nombreSensor, "SensorDeProva", "¿El nombre del último sensor no es SensorDeProva?" )
        
    })//it()



    // ....................................................
    // ....................................................
    it("Comprovar que puedo buscar un sensor por su MAC", async function(){

        var mac = "00:00:00:00:00:00";
        var res = await laLogica.buscarSensor(mac)

        console.log(res)
        assert.equal( res.macSensor, "00:00:00:00:00:00", "¿La MAC del sensor encontrado no es 00:00:00:00:00:00?" )
        assert.equal( res.nombreSensor, "SensorDeProva", "¿El nombre del sensor encontrado no es SensorDeProva?" )
        
    })//it()


    // ....................................................
    // ....................................................
    it("Comprovar que puedo eliminar un sensor por su MAC", async function(){

        var mac = "00:00:00:00:00:00";
        var res = await laLogica.eliminarSensorPorMac(mac);

        console.log(res)
        assert.equal( res, 200, "¿No se ha eliminado?" )
    })//it()

    //Eliminamos los sensores de prueba después de pasar el test
    
   

}) // describe
