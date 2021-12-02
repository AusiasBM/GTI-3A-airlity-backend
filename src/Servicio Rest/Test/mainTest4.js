// ........................................................
// mainTest1.js
// ........................................................
var request = require ('request')
var assert = require ('assert')
// ........................................................
// ........................................................

const IP_PUERTO="http://localhost:3500"


const jwt = require('jsonwebtoken')
const { verify } = require('crypto')

 // middleware to validate token (rutas protegidas)
 const verifyToken = (token) => {
    
     if (!token) return false
     try {
        
        jwt.verify(token, process.env.TOKEN_SECRET, function(err, token) {
            if (err) {
              return false
            } else {
              return token
             
            }
          });
        
     } catch (error) {
         res.status(400).json({error: 'token no es válido'})
     }
 }


// ........................................................
// main ()
// ........................................................
describe( "Test 1 : Recuerda arrancar el servidor", function() {
    

    var token;

    // ....................................................
    // ....................................................
    it( "probar POST /registrarUsuario", function( hecho ) {
       
        var datos = {"nombreUsuario":"testRegistro","correo":"testNode@node.com", "contrasenya":"123","telefono": "987654321"}

        request.post(
            { url : IP_PUERTO+"/registrarUsuario", headers : { 'User-Agent' : 'airlity', 'Content-Type' : 'application/json' }, body : JSON.stringify( datos )},
            function( err, respuesta ) {

                
                assert.equal( err, null, "¿ha habido un error?" )
                assert.equal( respuesta.statusCode, 200, "¿El código no es 200 (OK)" )
                hecho()
            } // callback
        ) // .post
    }) // it


    // ....................................................
    // ....................................................
    it( "probar POST /login", function( hecho ) {
       
        var datos = {"correo":"testNode@node.com", "contrasenya":"123"}

        request.post(
            { url : IP_PUERTO+"/login", headers : { 'User-Agent' : 'airlity', 'Content-Type' : 'application/json' }, body : JSON.stringify( datos )},
            function( err, respuesta ) {

                console.log("Prova")
                var j = JSON.parse(respuesta.body)
                token = j.data.token;
                console.log(token)
 
                assert.equal( err, null, "¿ha habido un error?" )
                assert.equal( respuesta.statusCode, 200, "¿El código no es 200 (OK)" )
                hecho()
            } // callback
        ) // .post
    }) // it



    // ....................................................
    // ....................................................
    it( "probar POST /mediciones", function( hecho ) {
        var datos = [
            '{"macSensor":"00:00:00:00:00:00","tipoMedicion":"O3", "medida":123,"temperatura": 10,"humedad": 100, "latitud":38.99586,"longitud":-0.166152,"fecha":1234567890123}',
            '{"macSensor":"00:00:00:00:00:00","tipoMedicion":"O3", "medida":456,"temperatura": 10,"humedad": 100, "latitud":38.99586,"longitud":-0.166152,"fecha":1234567890123}'
        ]

        request.post(
            { url : IP_PUERTO+"/mediciones", headers : {'Authorization': token, 'User-Agent' : 'airlity', 'Content-Type' : 'application/json' }, body : JSON.stringify( datos )},
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
            {url: IP_PUERTO + "/todasLasMediciones", headers : {'Authorization': token, 'User-Agent' : 'airlity'}},
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
            {url: IP_PUERTO + "/ultimasMediciones/5", headers : {'Authorization': token, 'User-Agent' : 'airlity'}},
            function(err, res, carga){
                assert.equal( err, null, "¿ha habido un error?" )
                assert.equal( res.statusCode, 200, "¿El código no es 200 (OK)" )
                var solucion = JSON.parse( carga )
                assert.equal( solucion.length, "5", "¿No devuelve 5 medidas?")
                hecho()
            }
        )
    })// it


    // ....................................................
    // ....................................................
    it("probar POST /eliminarUsuario", function(hecho){
        request.post(
            {url: IP_PUERTO + "/eliminarUsuario", headers : {'Authorization': token, 'User-Agent' : 'airlity'}},
            function(err, res){
                assert.equal( err, null, "¿ha habido un error?" )
                assert.equal( res.statusCode, 200, "¿El código no es 200 (OK)" )
                hecho()
            }
        )
    })// it





}) // describe