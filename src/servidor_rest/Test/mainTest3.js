const LogicaNegocio = require( "../logicaNegocio.js" )
var assert = require ('assert')


// ........................................................
// main ()
// ........................................................
describe( "Test: comprobar los métodos relacionados con los usuarios", function() {
    // ....................................................
    // ....................................................
    var laLogica = new LogicaNegocio()

    var idUsuarioPrueba;

    // ....................................................
    // ....................................................

    it( "Puedo insertar un usuario",
        async function() {
            try{

            var usuario = 
            {
                nombreUsuario : "UsuariDeProva",
                correo: "prova@prova.com",
                contrasenya: "1234",
                telefono: 987654321
            }
            
            var res = await laLogica.registrarUsuario(usuario.nombreUsuario, usuario.correo, usuario.contrasenya, usuario.telefono, "11:11:11:11:11:11")
            assert.equal( res, 200 , "¿No se ha insertado?" )
            } catch( err ) {
            // assert.equal( 0, 1, "cerrar conexión a BD fallada: " + err)
                throw new Error( "Error: " + err)
            }
    }) // it


    // ....................................................
    // ....................................................
    it("Comprovar que encuentro un usuario ya registrado", async function(){

        var correo = "prova@prova.com";
        //Comprovar qué asignatura/s está matriculado
        var res = await laLogica.comprobarSiEsteUsuarioEstaRegistrado(correo)

        assert.equal( res, true, "¿No está registrado?" )
        
    })//it()



    // ....................................................
    // ....................................................
    it( "Comprobar que no puedo insertar el mismo usuario",
        async function() {
            try{

            var usuario = 
            {
                nombreUsuario : "UsuariDeProva",
                correo: "prova@prova.com",
                contrasenya: "1234",
                telefono: 987654321
            }
            
            var res = await laLogica.registrarUsuario(usuario.nombreUsuario, usuario.correo, usuario.contrasenya, usuario.telefono, "11:11:11:11:11:11")
            assert.equal( res, 403 , "¿Se ha vuelto a insertar?" )
            } catch( err ) {
            // assert.equal( 0, 1, "cerrar conexión a BD fallada: " + err)
                throw new Error( "Error: " + err)
            }
    }) // it



    // ....................................................
    // ....................................................
    it("Comprovar que no encuentro un usuario no registrado", async function(){

        var correo = "NOREGISTRADO@prova.com";
        //Comprovar qué asignatura/s está matriculado
        var res = await laLogica.comprobarSiEsteUsuarioEstaRegistrado(correo)

        assert.equal( res, false, "¿Está registrado?" )
        
    })//it()




    // ....................................................
    // ....................................................
    it("Comprovar que puedo obtener los datos de un usuario registrado", async function(){

        var correo = "prova@prova.com";
        var contrasenya = "1234";
        //Comprovar qué asignatura/s está matriculado
        var res = await laLogica.buscarUsuario(correo, contrasenya)

        idUsuarioPrueba = res.id;

        assert.equal( res.correo, "prova@prova.com", "¿no es el usuario prova@prova.com?" )
        assert.equal( res.telefono, 987654321, "¿El telefono del usuario no es 987654321?" )
        
    })//it()



    // ....................................................
    // ....................................................
    it("Comprovar que puedo actualizar la MAC del sensor que está utilizando el usuario", async function(){

        var mac = "00:00:00:00:00:00";
        var correo = "prova@prova.com";
        var contrasenya = "1234"

        var res = await laLogica.buscarUsuario(correo, contrasenya)

        assert.equal( res.macSensor, "11:11:11:11:11:11", "¿La mac del sensor del usuario no es 11:11:11:11:11:11?" )

        var res = await laLogica.actualizarMacSensorUsuario(res.id, mac);

        console.log(res)
        assert.equal( res, 200, "¿No se ha actualizado?" )

        var res = await laLogica.buscarUsuario(correo, contrasenya)

        assert.equal( res.macSensor, "00:00:00:00:00:00", "¿La mac del sensor del usuario no es 00:00:00:00:00:00?" )
    })//it()



    // ....................................................
    // ....................................................
    it("Comprovar que puedo eliminar un usuario por su correo", async function(){

        var res = await laLogica.eliminarUsuario(idUsuarioPrueba);

        console.log(res)
        assert.equal( res, 200, "¿No se ha eliminado?" )
    })//it()
    
   

}) // describe