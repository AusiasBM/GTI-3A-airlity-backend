// ........................................................
const LogicaNegocio = require( "../logicaNegocio.js" )
var assert = require ('assert')


// ........................................................
// main ()
// ........................................................
describe( "Test: insertar una medida, recuperar todas las medidas guardadas, insertar varias medidas y recuperar varias medidas", function() {
    // ....................................................
    //Conectamos con la bbdd
    // ....................................................
    var laLogica = new LogicaNegocio()

    // ....................................................
    // ....................................................
    it( "Puedo insertar una medida",
        async function() {
            try{
            
            medida = {
                macSensor:"00:00:00:00:00:00",
                tipoMedicion: "CO2", 
                medida: 1234,
                temperatura: 20,
                humedad: 50,
                fecha: 123456789012,
                latitud: 123.5,
                longitud: 321.5
            }
            var res = await laLogica.guardarMedicion(medida)
            assert.equal( res, 200 , "¿No se ha insertado?" )
            } catch( err ) {
            // assert.equal( 0, 1, "cerrar conexión a BD fallada: " + err)
                throw new Error( "Error: " + err)
            }
    }) // it

     // ....................................................
    // ....................................................
    it("Comprovar que puedo ver los datos guardados", async function(){
        
        var res = await laLogica.obtenerTodasLasMediciones()

        assert.equal( res.length, res.length , "¿no hay un resulado?" )
        assert.equal( res[res.length-1].medida, 1234, "¿El último valor no es 1234?" )
        
    })//it()

    it( "Con guardarMediciones() se puede enviar para insertar 2 medidas",
        async function() {
            try{

            //Asegurarse de que la fecha sea lo suficientemente grande ya que filtra por la fecha en orden descendiente (la primera medida de las 2 tiene una fecha mayor):
            var medidas = [
                '{ "macSensor": "00:00:00:00:00:00", "tipoMedicion": "CO2", "medida": 1234,"temperatura": 20,"humedad": 50,"fecha": 166632515522845,"latitud": 123.5,"longitud": 321.5}',
                '{ "macSensor": "11:11:11:11:11:11", "tipoMedicion": "CO2", "medida": 1234,"temperatura": 20,"humedad": 50,"fecha": 166632515522845,"latitud": 123.5,"longitud": 321.5}'
            ]
            var res = await laLogica.guardarMediciones(medidas)
            assert.equal( res, 200 , "¿No se ha insertado?" )
            } catch( err ) {
            // assert.equal( 0, 1, "cerrar conexión a BD fallada: " + err)
                throw new Error( "Error: " + err)
            }
    }) // it


    // ....................................................
    // ....................................................
    it("Comprovar que puedo ver los 2 ultimos datos guardados", async function(){
        
        var res = await laLogica.obtenerUltimasMediciones(2)

        console.log(res)
        assert.equal( res.length, 2 , "¿no hay un resulado?" )
        assert.equal( res[0].medida, 1234, "¿La primera medida no es 1234?" )
        assert.equal( res[1].medida, 1234, "¿La segunda medida no es 1234?" )
        
    })//it()


    // ....................................................
    // ....................................................
    it("Comprovar que puedo filtrar las mediciones por tipo", async function(){
        
        var tipo = "CO2"
        var res = await laLogica.buscarMedidasPorTipo(tipo)

        console.log(res)
        assert.equal( res.length > 0, true , "¿no hay un resulado?" )
        assert.equal( res[0].tipoMedicion, "CO2", "¿La primera medida no es de CO2?" )
        assert.equal( res[res.length-1].tipoMedicion, "CO2", "¿La última medida no es de CO2?" )
        
    })//it()


    it("Comprovar que puedo filtrar las mediciones por la MAC del sensor", async function(){
        
        var mac = "11:11:11:11:11:11"
        var res = await laLogica.buscarMedidasPorSensor(mac)

        console.log(res)
        assert.equal( res.length > 0, true , "¿no hay un resulado?" )
        assert.equal( res[0].macSensor, "11:11:11:11:11:11", "¿La primera medida no tiene la MAC 11:11:11:11:11:11?" )
        assert.equal( res[res.length-1].macSensor, "11:11:11:11:11:11", "¿La última medida no tiene la MAC 11:11:11:11:11:11?" )
        
    })//it()


   

}) // describe
