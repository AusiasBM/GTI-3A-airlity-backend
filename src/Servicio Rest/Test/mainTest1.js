// ........................................................
// mainTest1.js
// ........................................................
var request = require ('request')
var assert = require ('assert')
// ........................................................
// ........................................................

const IP_PUERTO="http://localhost:3500"

// ........................................................
// main ()
// ........................................................
describe( "Test 1 : Recuerda arrancar el servidor", function() {
    
    // ....................................................
    // ....................................................
    it( "probar POST /mediciones", function( hecho ) {
        var datos = [
            '{"macSensor":"00:00:00:00:00:00","tipoMedicion":"O3", "medida":123,"temperatura": 10,"humedad": 100, "latitud":38.99586,"longitud":-0.166152,"fecha":1234567890123}',
            '{"macSensor":"00:00:00:00:00:00","tipoMedicion":"O3", "medida":456,"temperatura": 10,"humedad": 100, "latitud":38.99586,"longitud":-0.166152,"fecha":1234567890123}'
        ]

        request.post(
            { url : IP_PUERTO+"/mediciones", headers : { 'User-Agent' : 'airlity', 'Content-Type' : 'application/json' }, body : JSON.stringify( datos )},
            function( err, respuesta ) {
                assert.equal( err, null, "¿ha habido un error?" )
                assert.equal( respuesta.statusCode, 200, "¿El código no es 200 (OK)" )
                hecho()
            } // callback
        ) // .post
    }) // it

    // ....................................................
    // ....................................................
    it("probar GET /todasLasMediciones", function(hecho){
        request.get(
            {url: IP_PUERTO + "/todasLasMediciones", headers : {'User-Agent' : 'airlity'}},
            function(err, res, carga){
                assert.equal( err, null, "¿ha habido un error?" )
                assert.equal( res.statusCode, 200, "¿El código no es 200 (OK)" )
                var solucion = JSON.parse( carga )
                assert.equal( solucion.length > 0, true, "¿No ha recuperado las medidas?")
                hecho()
            }
        )
    })// it

    // ....................................................
    // ....................................................
    it("probar GET /ultimasMediones", function(hecho){
        request.get(
            {url: IP_PUERTO + "/ultimasMediciones/5", headers : {'User-Agent' : 'aitor'}},
            function(err, res, carga){
                assert.equal( err, null, "¿ha habido un error?" )
                assert.equal( res.statusCode, 200, "¿El código no es 200 (OK)" )
                var solucion = JSON.parse( carga )
                assert.equal( solucion.length, "5", "¿No devuelve 5 medidas?")
                hecho()
            }
        )
    })// it


}) // describe