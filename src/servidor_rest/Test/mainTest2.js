// ........................................................
const LogicaNegocio = require( "../logicaNegocio.js" )
const Sensor = require("../modelos/Sensor")
var assert = require ('assert')


// ........................................................
// main ()
// ........................................................
describe( "Test: insertar un sensor, recuperar todos los sensores, buscar un sensor por su MAC ", function() {
    // ....................................................
    // ....................................................
    var laLogica = new LogicaNegocio()


    beforeEach(async function() {
        // runs before each test in this block

        //Añadimos antes de cada prueba este sensor 
        correoUsuario = "testSensor@test.com";
        var sensor = 
            {
                macSensor: "00",
                tipoMedicion: "PROVA",
            }
    
        const nuevoSensor = new Sensor( {macSensor : String(sensor.macSensor), tipoMedicion: String(sensor.tipoMedicion), 
            fechaRegistro: Date.now(), correoUsuario: String(correoUsuario)} );

        await nuevoSensor.save();

      });
    
    afterEach(async function() {
    // runs after each test in this block

        //Borramos el sensor creado después de cada prueba
        var macPrueba1 = "00"
        await Sensor.deleteMany({macSensor : String(macPrueba1)});
        

    });

    // ....................................................
    // ....................................................

    it( "Puedo insertar un sensor a partir de una mac, el tipo de medición y un correo de un usuario",
        async function() {
            try{
            
            var sensor = 
            {
                macSensor: "11",
                tipoMedicion: "PROVA",
            }

            correoUsuario = "testSensor@test.com";
            
            var res = await laLogica.guardarSensor(sensor.macSensor, sensor.tipoMedicion, correoUsuario)
            assert.equal( res, 200 , "¿No se ha insertado?" )
            await Sensor.deleteMany({macSensor : String(sensor.macSensor)});

            } catch( err ) {
            // assert.equal( 0, 1, "cerrar conexión a BD fallada: " + err)
                throw new Error( "Error: " + err)
            }
    }) // it

    // ....................................................
    // ....................................................

    it( "No puedo insertar un sensor que ya está registrado",
        async function() {
            try{
            
            var sensor = 
            {
                macSensor: "00",
                tipoMedicion: "PROVA",
            }

            correoUsuario = "testSensor@test.com";
            
            var res = await laLogica.guardarSensor(sensor.macSensor, sensor.tipoMedicion, correoUsuario)

            var res = await laLogica.guardarSensor("00", "PROVA", correoUsuario)
            assert.equal( res, 403 , "¿La respuesta no es 403?" )

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

        assert.equal( res[res.length-1].correoUsuario, "testSensor@test.com", "¿El último sensor registrado no pertenece al usuario con correo testSensor@test.com?" )
        assert.equal( res[res.length-1].macSensor, "00", "¿El nombre del último sensor no es SensorDeProva?" )
        
    })//it()



    // ....................................................
    // ....................................................
    it("Comprovar que puedo buscar un sensor por su MAC", async function(){

        var mac = "00";
        var res = await laLogica.buscarSensor(mac)

        console.log(res)
        assert.equal( res.macSensor, "00", "¿La MAC del sensor encontrado no es 00?" )
        assert.equal( res.correoUsuario, "testSensor@test.com", "¿No pertenece al usuario con correo testSensor@test.com?" )
        
    })//it()


    // ....................................................
    //Eliminamos los sensores de prueba después de pasar el test
    // ....................................................
    it("Comprovar que puedo eliminar un sensor por su MAC", async function(){

        var mac = "00";
        var res = await laLogica.eliminarSensorPorMac(mac);

        console.log(res)
        assert.equal( res, 200, "¿No se ha eliminado?" )
    })//it()

    
    
   

}) // describe
