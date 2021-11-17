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


    // ....................................................
    // ....................................................

    it( "Puedo insertar un sensor",
        async function() {
            try{
            
            var sensor = 
            {
                macSensor: "00:00:00:00:00:00",
                nombreSensor : "SensorDeProva",
                tipoMedicion: "PROVA",
                fecha: 123456789012
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
    it("Comprovar que puedo todos los sensores guardados", async function(){
        
        //Comprovar qué asignatura/s está matriculado
        var res = await laLogica.obtenerTodosLosSensores()

        assert.equal( res.length, res.length , "¿no hay un resulado?" )
        assert.equal( res[res.length-1].nombreSensor, "SensorDeProva", "¿La UUID del último sensor no es SensorDeProva?" )
        
    })//it()



    // ....................................................
    // ....................................................
    it("Comprovar que puedo buscar un sensor por su MAC", async function(){

        var mac = "00:00:00:00:00:00";
        var res = await laLogica.buscarSensor(mac)

        console.log(res)
        assert.equal( res.macSensor, "00:00:00:00:00:00", "¿La MAC del sensor encontrado no es 00:00:00:00:00:00?" )
        
    })//it()

   

}) // describe
