// ........................................................
const LogicaNegocio = require( "../logicaNegocio.js" )
var assert = require ('assert')


function borrarMedicionesPrueba( laLogica){
    

}


// ........................................................
// main ()
// ........................................................
describe( "Test: Probar los métodos de la lógica de negocio relacionados con las mediciones", function() {
    // ....................................................
    //Conectamos con la bbdd
    // ....................................................
    var laLogica = new LogicaNegocio()

    //Borramos las medidas de prueba de la bbdd antes de empezar (por si acaso hubiese...)
    var macPrueba1 = "00:00:00:00:00:00"
    var macPrueba2 = "11:11:11:11:11:11"

    laLogica.eliminarMedicionesPorMac(macPrueba1)
    laLogica.eliminarMedicionesPorMac(macPrueba2)

    // ....................................................
    // ....................................................
    it( "Puedo insertar una medida",
        async function() {
            try{
            
            medida = {
                macSensor:"00:00:00:00:00:00",
                tipoMedicion: "CO2", 
                medida: 1232,
                temperatura: 20,
                humedad: 50,
                fecha: 1,
                latitud: 123.5,
                longitud: 321.5
            }

            //Me invento un id de un usuario
            id = 1;
            var res = await laLogica.guardarMedicion(id, medida)
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
        assert.equal( res[res.length-1].fecha, 1 , "¿No está ordenado por fecha de más reciente a más antigua?" )
        assert.equal( res[res.length-1].medida, 1232, "¿El último valor no es 1232?" )
        
    })//it()

    it( "Con guardarMediciones() se puede enviar para insertar 2 medidas",
        async function() {
            try{

            //Asegurarse de que la fecha sea lo suficientemente grande ya que filtra por la fecha en orden descendiente (la primera medida de las 2 tiene una fecha mayor):
            var medidas = [
                '{ "macSensor": "00:00:00:00:00:00",  "tipoMedicion": "CO2", "medida": 1233,"temperatura": 20,"humedad": 50,"fecha": 166632515522844,"latitud": 123.5,"longitud": 121.5}',
                '{ "macSensor": "00:00:00:00:00:00",  "tipoMedicion": "CO2", "medida": 1234,"temperatura": 20,"humedad": 50,"fecha": 166632515522845,"latitud": 223.5,"longitud": 221.5}',
                '{ "macSensor": "11:11:11:11:11:11",  "tipoMedicion": "CO2", "medida": 1235,"temperatura": 20,"humedad": 50,"fecha": 166632515522846,"latitud": 323.5,"longitud": 321.5}'
            ]

            //Me invento un id de un usuario
            id = 1;
            var res = await laLogica.guardarMediciones(id, medidas)
            assert.equal( res, 200 , "¿No se ha insertado?" )
            } catch( err ) {
            // assert.equal( 0, 1, "cerrar conexión a BD fallada: " + err)
                throw new Error( "Error: " + err)
            }
    }) // it


    // ....................................................
    // ....................................................
    it("Comprovar que puedo ver los 2 ultimos datos guardados (con las fechas más altas)", async function(){
        
        var res = await laLogica.obtenerUltimasMediciones(2)

        console.log(res)
        assert.equal( res.length, 2 , "¿no hay un resulado?" )
        assert.equal( res[0].medida, 1235, "¿La primera medida no es 1235?" )
        assert.equal( res[1].medida, 1234, "¿La segunda medida no es 1234?" )
        
    })//it()


    // ....................................................
    // ....................................................
    it("Comprovar que puedo filtrar las mediciones por tiempo y cuadrícula geográfica", async function(){
        
        var posicionSO = {
            latitud : 0,
            longitud : 0
        }
        var posicionNE = {
            latitud : 500,
            longitud : 500
        } 
            
        var res = await laLogica.getMedicionesPorTiempoZona(posicionSO, posicionNE, 166632515522840, 166632515522850);

        //Ordena de fecha más antigua a más reciente
        console.log(res)
        assert.equal( res.length, 3 , "¿No son 3 medidas?" )
        assert.equal( res[0].latitud, 123.5, "¿La latitud de la primera medida no es 123.5?" )
        assert.equal( res[res.length-1].longitud, 321.5, "¿La longitud de la última medida no es de 321.5?" )
        
    })//it()

    // ....................................................
    // ....................................................
    it("Comprovar que puedo cambian las mediciones al reducir la cuadrícula geográfica", async function(){
        
        //Reducimos la cuadrícula para recuperar (en teoria) solo la única medida que lo cumple
        var posicionSO = {
            latitud : 300,
            longitud : 300
        }
        var posicionNE = {
            latitud : 400,
            longitud : 400
        } 
            

        var res = await laLogica.getMedicionesPorTiempoZona(posicionSO, posicionNE, 166632515522840, 166632515522850);

        console.log(res)
        assert.equal( res.length, 1 , "¿No hay solo 1 medida?" )
        assert.equal( res[0].latitud, 323.5, "¿La latitud de la primera medida no es 323.5?" )
        assert.equal( res[0].longitud, 321.5, "¿La longitud de la última medida no es de 321.5?" )
        
    })//it


    // ....................................................
    // ....................................................
    it("Comprovar que cambian las mediciones al cambiar la fecha de inicio y fin pero no la cuadrícula", async function(){
        
        //Reducimos la cuadrícula para recuperar (en teoria) solo la única medida que lo cumple
        var posicionSO = {
            latitud : 0,
            longitud : 0
        }
        var posicionNE = {
            latitud : 500,
            longitud : 500
        }    

        var res = await laLogica.getMedicionesPorTiempoZona(posicionSO, posicionNE, 0, 2);

        console.log(res)
        assert.equal( res.length, 1 , "¿No hay solo 1 medida?" )
        assert.equal( res[0].latitud, 123.5, "¿La latitud de la primera medida no es 123.5?" )
        assert.equal( res[0].longitud, 321.5, "¿La longitud de la última medida no es de 321.5?" )
        assert.equal( res[0].fecha, 1, "¿La fecha de la única medida no es de 1?" )
        
    })//it


    it("Comprovar que puedo filtrar las mediciones por usuario y periodo de tiempo. Primera prueba", async function(){
        
        var idUsuario = "1"
        var res = await laLogica.getMedicionesDeUsuarioPorTiempo(idUsuario, 0, 2 )

        console.log(res)
        assert.equal( res.length, 1 , "¿No hay 1 medidas?" )
        assert.equal( res[0].macSensor, "00:00:00:00:00:00", "¿La primera medida no tiene la MAC 00:00:00:00:00:00?" )
        assert.equal( res[0].medida, 1232, "¿La medida no es 1232?" )
        assert.equal( res[0].fecha, 1, "¿La fecha de la medida no es 1?" )
        
    })//it()

    it("Comprovar que puedo filtrar las mediciones por usuario y periodo de tiempo. Segunda prueba: fechaFin será la actual", async function(){
        
        var idUsuario = "1"
        var res = await laLogica.getMedicionesDeUsuarioPorTiempo(idUsuario, 0)

        console.log(res)
        assert.equal( res.length, 1 , "¿No hay 1 medidas?" )
        assert.equal( res[0].macSensor, "00:00:00:00:00:00", "¿La primera medida no tiene la MAC 00:00:00:00:00:00?" )
        assert.equal( res[0].medida, 1232, "¿La medida no es 1232?" )
        assert.equal( res[0].fecha, 1, "¿La fecha de la medida no es 1?" )
        
    })//it()

    it("Comprovar que puedo filtrar las mediciones por usuario y periodo de tiempo. Tercera prueba: recuperar varias medidas", async function(){
        
        var idUsuario = "1"
        var res = await laLogica.getMedicionesDeUsuarioPorTiempo(idUsuario, 166632515522840, 166632515522850)

        console.log(res)
        assert.equal( res.length, 3 , "¿No hay 3 medidas?" )
        assert.equal( res[0].macSensor, "00:00:00:00:00:00", "¿La primera medida no tiene la MAC 00:00:00:00:00:00?" )
        assert.equal( res[0].fecha, 166632515522844, "¿La medida no es 166632515522844?" )
        
        assert.equal( res[res.length-1].macSensor, "11:11:11:11:11:11", "¿La ultima medida no tiene la MAC 11:11:11:11:11:11?" )
        assert.equal( res[res.length-1].fecha, 166632515522846, "¿La fecha de la medida no es 166632515522846?" )
        
    })//it()


    it("Comprovar que puedo filtrar las últimas 2 mediciones de un sensor por la MAC del sensor", async function(){
        
        var mac = "00:00:00:00:00:00"
        var res = await laLogica.getUltimasMedicionesPorSensor(mac, 2)

        console.log(res)
        assert.equal( res.length, 2 , "¿No hay 2 medidas?" )
        assert.equal( res[0].macSensor, "00:00:00:00:00:00", "¿La primera medida no tiene la MAC 00:00:00:00:00:00?" )
        assert.equal( res[res.length-1].macSensor, "00:00:00:00:00:00", "¿La última medida no tiene la MAC 00:00:00:00:00:00?" )
        assert.equal( res[0].medida, 1234, "¿La primera medida no es 1234?" )
        assert.equal( res[res.length-1].medida, 1233, "¿La segunda medida no es 1233?" )
        
    })//it()


    it("Ahora comprovar que puedo filtrar las últimas 3 mediciones de un sensor por la MAC del sensor", async function(){
        
        var mac = "00:00:00:00:00:00"
        var res = await laLogica.getUltimasMedicionesPorSensor(mac, 3)
        
        console.log(res)
        assert.equal( res.length, 3 , "¿No hay 3 medidas?" )
        assert.equal( res[0].macSensor, "00:00:00:00:00:00", "¿La primera medida no tiene la MAC 00:00:00:00:00:00?" )
        assert.equal( res[res.length-1].macSensor, "00:00:00:00:00:00", "¿La última medida no tiene la MAC 00:00:00:00:00:00?" )
        assert.equal( res[res.length-1].medida, 1232, "¿La segunda medida no es 1232?" )
        
    })//it()



    // ....................................................
    // ....................................................
    it("Comprovar que puedo eliminar las mediciones creadas en el test por su MAC", async function(){

        var mac = "00:00:00:00:00:00";
        var mac2 = "11:11:11:11:11:11";

         //Borramos las medidas de prueba para restaurar la bbdd
        var res = await laLogica.eliminarMedicionesPorMac(mac)
        var res2 = await laLogica.eliminarMedicionesPorMac(mac2)

        console.log(res)
        assert.equal( res, 200, "¿No se ha eliminado?" )
        assert.equal( res2, 200, "¿No se ha eliminado?" )
    })//it()

    
   


    

   

}) // describe
