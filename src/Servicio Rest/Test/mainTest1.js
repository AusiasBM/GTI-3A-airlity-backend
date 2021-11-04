// ........................................................
// mainTest1.js
// ........................................................
var request = require ('request')
var assert = require ('assert')
// ........................................................
// ........................................................

const IP_PUERTO="http://localhost:8080"

// ........................................................
// main ()
// ........................................................
describe( "Test 1 : Recuerda arrancar el servidor", function() {
    
    // ....................................................
    // ....................................................
    it( "probar POST /mediciones", function( hecho ) {
        var datos = [
            '{"fecha":1234567890,"latitud":38.99586,"longitud":-0.166152,"macSensor":"00:00:00:00:00:00","medida":123,"nombreSensor":"PruebaTest1","tipo":"TEMPERATURA","uuidSensor":"PRUEBA"}',
            '{"fecha":1234567891,"latitud":38.99586,"longitud":-0.166152,"macSensor":"00:00:00:00:00:00","medida":1234,"nombreSensor":"PruebaTest2","tipo":"TEMPERATURA","uuidSensor":"PRUEBA"}'
        ]

        request.post(
            { url : IP_PUERTO+"/mediciones", headers : { 'User-Agent' : 'aitor', 'Content-Type' : 'application/json' }, body : JSON.stringify( datos )},
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
            {url: IP_PUERTO + "/todasLasMediciones", headers : {'User-Agent' : 'aitor'}},
            function(err, res, carga){
                assert.equal( err, null, "¿ha habido un error?" )
                assert.equal( res.statusCode, 200, "¿El código no es 200 (OK)" )
                var solucion = JSON.parse( carga )
                assert.equal( solucion[solucion.length - 1].medida, "1234", "¿El valor no es 1234?")
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
                assert.equal( solucion[0].medida, "1234", "¿El valor no es 1234?")
                hecho()
            }
        )
    })// it


}) // describe