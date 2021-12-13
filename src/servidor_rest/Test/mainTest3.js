const LogicaNegocio = require( "../logicaNegocio.js" )
const Usuario = require("../modelos/Usuario");
var assert = require ('assert')


// ........................................................
// main ()
// ........................................................
describe( "Test: comprobar los métodos relacionados con los usuarios", function() {
    // ....................................................
    // ....................................................
    var laLogica = new LogicaNegocio()

    beforeEach(async function() {
        // runs before each test in this block

        //Añadimos antes de cada prueba este usuario 
        correoUsuario = "testSensor@test.com";
        var usuario = 
            {
                nombreUsuario : "test",
                correo: "test@test.com",
                contrasenya: "1234",
                telefono: 987654321,
                macSensor: "00"
            }
        const nuevoUsuario = new Usuario( {nombreUsuario : String(usuario.nombreUsuario), correo: String(usuario.correo),
            contrasenya: String(usuario.contrasenya), telefono: usuario.telefono, macSensor: String(usuario.macSensor)} );

        await nuevoUsuario.save();

      });
    
    afterEach(async function() {
    // runs after each test in this block

        //Borramos el usuario creado después de cada prueba
        var correo =  "test@test.com"
        await Usuario.deleteOne({correo : correo});
    });

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

            await Usuario.deleteOne({correo : usuario.correo});
            } catch( err ) {
            // assert.equal( 0, 1, "cerrar conexión a BD fallada: " + err)
                throw new Error( "Error: " + err)
            }
    }) // it


    // ....................................................
    // ....................................................
    it("Comprovar que encuentro un usuario ya registrado", async function(){

        var correo = "test@test.com";
        //Comprovar qué asignatura/s está matriculado
        var res = await laLogica.comprobarSiEsteUsuarioEstaRegistrado(correo)

        assert.equal( res, true, "¿No está registrado?" )
        
    })//it()



    // ....................................................
    // ....................................................
    it( "Comprobar que no puedo insertar un usuario con un correo ya registrado",
        async function() {
            try{

            var usuario = 
            {
                nombreUsuario : "UsuariDeProva",
                correo: "test@test.com",
                contrasenya: "1234",
                telefono: 987654321
            }
            
            var res = await laLogica.registrarUsuario(usuario.nombreUsuario, usuario.correo, usuario.contrasenya, usuario.telefono, "22")
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

        var correo = "test@test.com";
        var contrasenya = "1234";
        //Comprovar qué asignatura/s está matriculado
        var res = await laLogica.buscarUsuario(correo, contrasenya)

        idUsuarioPrueba = res.id;

        assert.equal( res.nombreUsuario, "test", "¿no es el usuario llamado test?" )
        assert.equal( res.correo, "test@test.com", "¿no es el usuario test@test.com?" )
        assert.equal( res.telefono, 987654321, "¿El telefono del usuario no es 987654321?" )
        
    })//it()



    // ....................................................
    // ....................................................
    it("Comprovar que puedo actualizar la MAC del sensor que está utilizando el usuario", async function(){

        var mac = "11";
        var correo = "test@test.com";
        var contrasenya = "1234"

        var res = await laLogica.buscarUsuario(correo, contrasenya)

        assert.equal( res.macSensor, "00", "¿La mac del sensor del usuario no es 11?" )

        var res = await laLogica.actualizarMacSensorUsuario(res.id, mac);

        console.log(res)
        assert.equal( res, 200, "¿No se ha actualizado?" )

        var res = await laLogica.buscarUsuario(correo, contrasenya)

        assert.equal( res.macSensor, "11", "¿La mac del sensor del usuario no es 00?" )
    })//it()



    // ....................................................
    // ....................................................
    it("Comprovar que puedo eliminar un usuario por su correo", async function(){

        var res = await laLogica.eliminarUsuario("test@test.com");

        console.log(res)
        assert.equal( res, 200, "¿No se ha eliminado?" )
    })//it()
    
   

}) // describe