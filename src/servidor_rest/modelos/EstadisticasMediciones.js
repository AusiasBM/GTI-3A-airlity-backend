/**
 * EstadisticasMediciones.js
 * @author Aitor Benítez Estruch
 * @date: 2021/11/02
 * 
 * @description:
 * Clase EstadisticasMediciones contiene los métodos para extraer una serie de estadísticas a partir de una lista de
 * mediciones para estimar la calidad del aire respirado por un usuario. También contiene métodos para extraer
 * datos para ser representados correctamente en un gráfico.
 * 
 */


 module.exports = class EstadisticasMediciones{

    constructor(){} // ()


    /**
     * obtenerValoresEstadisticos
     * Descripción:
     * Método que recoge los datos generados en otros métodos para enviar los datos estadísticos generados en cada uno de los métodos
     * que llama.
     * 
     * medicionesFiltradasPorPeriodo: lista[JSON],
     * tipoMedicion: Texto -> obtenerValoresEstadisticos() <-
     * JSON<-
     * {media: R, 
     * tiempo: N, 
     * valorMaximo: R, 
     * valoracionCalidadAire: Texto        
     * advertencias: [JSON{fechaIni: N, fechaFin: N, periodoTiempoTranscurrido: N, mediaPeriodo: R, valorMaximoPeriodo: R}]
     * }
     * 
     * @param medicionesFiltradasPorPeriodo Lista de mediciones de un periodo concreto
     * @param tipoMedicion Lista de mediciones de un periodo concreto
     * 
     * @returns objeto JSON {media: R, tiempo: N, valorMaximo: R, valoracionCalidadAire: Texto
     *                      advertencias: [JSON{fechaIni: N, fechaFin: N, periodoTiempoTranscurrido: N, mediaPeriodo: R, valorMaximoPeriodo: R}]}
     */
    obtenerValoresEstadisticos( medicionesFiltradasPorPeriodo, tipoMedicion){
        
        var umbralMaximo = this.establecerUmbralMaximo(tipoMedicion)
        var mediaYTiempo = this.mediaPonderada( medicionesFiltradasPorPeriodo);
        var valorMax = this.valorMaximoPeriodo(medicionesFiltradasPorPeriodo);
        var adv = this.advertenciasUmbrales(medicionesFiltradasPorPeriodo, umbralMaximo);

        var tiempoSobreexpuesto = this.calculoTiempoSobrexpuesto(adv);
        var valoracion = this.valoracionCalidadAireRespirado(mediaYTiempo.tiempoMedido, tiempoSobreexpuesto, mediaYTiempo.mediaPonderada, valorMax, umbralMaximo);

        var objeto = {
            tipoGas: tipoMedicion,
            media: mediaYTiempo.mediaPonderada,
            tiempo: mediaYTiempo.tiempoMedido,
            valorMaximo: valorMax,
            advertencias: adv,
            valoracionCalidadAire: valoracion
        }

        return objeto;

    }

    /**
     * establecerUmbralMaximo()
     * Descripción:
     * método para establecer el umbral máximo de ppm diario según el tipo de gas
     * @param {*} tipoMedicion 
     * @returns N valor del umbral máximo diario según el gas (en ppm)
     */
    establecerUmbralMaximo(tipoMedicion){
        if(tipoMedicion == "IAQ"){
            return 20;
        }else if(tipoMedicion == "NO2"){
            return 0.5
        }else if(tipoMedicion == "SO2"){
            return 0.5
        }else if(tipoMedicion == "O3"){
            return 0.2
        }else if(tipoMedicion == "CO"){
            return 20
        }
    }


    /**
     * mediaPonderada()
     * Descripcion:
     * método que a partir de una lista de mediciones, saca la media ponderada de los valores de las mediciones según el 
     * intervalo de tiempo entre ellas, así como estima el tiempo que el usuario ha estado midiendo
     * 
     * medicionesFiltradasPorPeriodo: lista[JSON]
     * -> mediaPonderada() 
     * JSON
     * {
     * mediaPonderada: R,
     * tiempoMedido: N
     * }
     * 
     * @param {*} medicionesFiltradasPorPeriodo 
     * @returns objeto JSON {mediaPonderada: R, tiempoMedido: N}
     */
    mediaPonderada(medicionesFiltradasPorPeriodo){
        var n = 1;
        var sum = 0;
        var tiempoMidiendo = 0;
        var fechaTopeIntervalo = Date.now();
        var length = medicionesFiltradasPorPeriodo.length;

        //Consideremos que si pasan mas de 1 minuto (60000 milisegundos) sin medir es un nuevo periodo de mediciones
        if( fechaTopeIntervalo - medicionesFiltradasPorPeriodo[length-1].fecha > (60000)){
            fechaTopeIntervalo = medicionesFiltradasPorPeriodo[length-1].fecha;
            n = 2;
        }
        
    
        //Se deberá tener en cuenta que dentro de un mismo dia puede estar haciendo varios periodos de 
        //mediciones. Por tanto, si una medición dista de otra en, por ejemplo, mas de 5 minutos (5*60*1000 milis)
        // se considerará un nuevo periodo de medición y se ponderará a partir de la siguiente (de nuevo se salta
        // una medición).
        // Esto se hace para evitar que si el usuario para de medir, la última medición tenga un peso ponderado grande.
        for(var i = medicionesFiltradasPorPeriodo.length - n ; i >= 0; i--){
    
            var intervaloTiempo = fechaTopeIntervalo - medicionesFiltradasPorPeriodo[i].fecha
    
            if(intervaloTiempo < (60000)){
                sum += (medicionesFiltradasPorPeriodo[i].medida * intervaloTiempo)
                tiempoMidiendo += intervaloTiempo
            }
    
            fechaTopeIntervalo = medicionesFiltradasPorPeriodo[i].fecha
        }

        var media = sum/tiempoMidiendo;
        var objeto = {
            mediaPonderada: media,
            tiempoMedido: tiempoMidiendo
        }

        return objeto;
        
    
    }


    /**
     * valorMaximoPeriodo()
     * Descripción:
     * método para extraer el valor máximo que ha medido el usuario durante el periodo de tiempo
     * 
     * mediciones: lista[JSON] -> valorMaximoPeriodo()
     * varlorMaximoMedido: R <-
     * 
     * @param {*} mediciones 
     * @returns valorMaximoMedido Tipo R con el valor maximo de todas las mediciones
     */
    valorMaximoPeriodo(mediciones){

        let varlorMaximoMedido = 0
    
        for(var i = 0; i < mediciones.length; i++){
            if(mediciones[i].medida > varlorMaximoMedido){
                varlorMaximoMedido = mediciones[i].medida
            }
        }
    
        return varlorMaximoMedido
    }


    /**
     * advertenciasUmbrales()
     * Descripción:
     * método para recopilar la información sobre los periodos donde el usuario ha registrado por encima del umbral
     * máximo diario. Cada advertencia tiene la fecha inicial de cuando sobrepasa, la fecha final de cuando baja del umbral,
     * el tiempo de exposición, la media ponderada de ese periodo, y el valor máximo registrado durante el periodo por encima
     * del umbral.
     * 
     * mediciones: lista[JSON],
     * umbralMaximoDiario: R ->advertenciasUmbrales
     * JSON  <-
     * {
     * fechaIni: N,
     * fechaFin: N,
     * periodoTiempoTranscurrido:N,
     * mediaPeriodo: R,
     * valorMaximoPeriodo: R
     * }
     * 
     * @param {*} mediciones lista[JSON]
     * @param {*} umbralMaximoDiario Tipo R con el umbral máximo diario de ppm de un determinado gas
     * @returns Lista [JSON{fechaIni: N, fechaFin: N, periodoTiempoTranscurrido: N, mediaPeriodo: R, valorMaximoPeriodo: R}]
     */
    advertenciasUmbrales(mediciones, umbralMaximoDiario){
        var i = 0;
        var advertencias = [];

        while(i < mediciones.length){
            var medicionesPorEncimaDelUmbralMax = [];
            if(mediciones[i].medida >= umbralMaximoDiario){
                while(i < mediciones.length && mediciones[i].medida >= umbralMaximoDiario){
                    medicionesPorEncimaDelUmbralMax.push(mediciones[i]);
                    i++;
                }

                var media = this.mediaPonderada(medicionesPorEncimaDelUmbralMax);
                var max = this.valorMaximoPeriodo(medicionesPorEncimaDelUmbralMax);

                var objeto = {
                    fechaIni: medicionesPorEncimaDelUmbralMax[0].fecha,
                    fechaFin: medicionesPorEncimaDelUmbralMax[medicionesPorEncimaDelUmbralMax.length-1].fecha,
                    periodoTiempoTranscurrido: media.tiempoMedido,
                    mediaPeriodo: media.mediaPonderada,
                    valorMaximoPeriodo: max
                }

                advertencias.push(objeto);
            }
            
            i++;
        }

        return advertencias;
    }


    /**
     * calculoTiempoSobrexpuesto()
     * Descripción:
     * método para estimar el tiempo total que el usuario ha estado expuesto por encima del umbral máximo diario
     * 
     * advertencias [JSON] -> calculoTiempoSobrexpuesto()
     * tiempoSobrexpuesto: N <-
     * 
     * @param {*} advertencias 
     * @returns tiempoSobrexpuesto Tipo N con el tiempo que ha estado por encima del umbral
     */
    calculoTiempoSobrexpuesto(advertencias){

        var tiempoSobrexpuesto = 0;
        for(var i = 0; i < advertencias.length; i ++){
            tiempoSobrexpuesto += advertencias[i].periodoTiempoTranscurrido;
        }

        return tiempoSobrexpuesto;
    }



    /**
     * valoracionCalidadAireRespirado()
     * Descripción:
     * método para estimar la calidad del aire respirado a partir de la media ponderada, el valor máximo medido
     * y el tiempo que el usuario ha estado sobreexpuesto a concentraciones por encima del umbral máximo diario.
     * 
     * tiempoTotalMedido: N
     * tiempoSobreexpuesto: N
     * media: R
     * valorMaxMedido: R
     * umbralMaximoDiario: R ->valoracionCalidadAireRespirado() <-
     * Texto <-
     * 
     * @param {*} tiempoTotalMedido Tipo N con el tiempo que ha estado midiendo el usuario
     * @param {*} tiempoSobreexpuesto Tipo N con el tiempo que el usuario ha estado por encima del umbral
     * @param {*} media Tipo R con la media ponderada de las mediciones durante el periodo
     * @param {*} valorMaxMedido Tipo R con el valor máximo medido
     * @param {*} umbralMaximoDiario Tipo R con el umbral máximo diario de ppm de un determinado gas
     * @returns Texto con la valoración de la calidad del aire
     */
    valoracionCalidadAireRespirado(tiempoTotalMedido, tiempoSobreexpuesto, media, valorMaxMedido, umbralMaximoDiario){
        var proporcionSobreexposicion = tiempoSobreexpuesto/tiempoTotalMedido;

        var valoracionMediaMediciones = this.valoracionMediaMediciones(media, umbralMaximoDiario);
        var valoracionProporcionTiempoSobrexpuesto = this.valoracionProporcionTiempoSobrexpuesto(proporcionSobreexposicion);
        var valoracionValorMaximo =  this.valoracionValorMaximo(valorMaxMedido, umbralMaximoDiario);
        var valoracionTotal = (valoracionMediaMediciones + valoracionValorMaximo + valoracionProporcionTiempoSobrexpuesto)/ 3;

        if(valoracionTotal < 3 ){
            return "Muy mala";
        }else if(valoracionTotal >= 3 && valoracionTotal < 5){
            return "Mala";
        }else if(valoracionTotal >= 5 && valoracionTotal < 7){
            return "Regular";
        }else if(valoracionTotal >= 7 && valoracionTotal < 9){
            return "Buena";
        }else{
            return "Excelente";
        }

    }

    valoracionMediaMediciones(media, umbralMaximoDiario){
        if(media < (0.5*umbralMaximoDiario)){
            return 10;
        }else if((media >= (0.5*umbralMaximoDiario) && media < (0.75*umbralMaximoDiario))){
            return  7.5;
        }else if((media >= (0.75*umbralMaximoDiario) && media < (umbralMaximoDiario))){
            return 5;
        }else if((media >= (umbralMaximoDiario) && media < (1.25 * umbralMaximoDiario))){
            return 2.5;
        }else{
            return 0;
        }
    }

    valoracionValorMaximo(valorMaxMedido, umbralMaximoDiario){
        if(valorMaxMedido < (0.5*umbralMaximoDiario)){
            return  10;
        }else if(valorMaxMedido >= (0.5*umbralMaximoDiario) && valorMaxMedido < (0.75*umbralMaximoDiario)){
            return  7.5;
        }else if(valorMaxMedido >= (0.75*umbralMaximoDiario) && valorMaxMedido < (umbralMaximoDiario)){
            return 5;
        }else if(valorMaxMedido >= (umbralMaximoDiario) && valorMaxMedido < (1.25 * umbralMaximoDiario)){
            return 2.5;
        }else{
            return 0;
        }
    }

    valoracionProporcionTiempoSobrexpuesto(proporcionSobreexposicion){
        if(proporcionSobreexposicion == 0){
            return 10;
        }else if(proporcionSobreexposicion > 0 && proporcionSobreexposicion <= 0.2){
            return 7.5;
        }else if(proporcionSobreexposicion > 0.2 && proporcionSobreexposicion <= 0.4){
            return 5;
        }else if(proporcionSobreexposicion > 0.4 && proporcionSobreexposicion <= 0.6){
            return 2.5;
        }else{
            return 0;
        }
    }


    


    //---------------------------------------------------------------------------------
    //---------------------------------------------------------------------------------
    // LÓGICA DE LOS DATOS DE LA GRÁFICA: solo queremos sacar las medias por cada cierto periodo
    // de tiempo, y las horas de cada periodo (información de los ejes Y y X)
    //---------------------------------------------------------------------------------
    //---------------------------------------------------------------------------------


    /**
     * escogerPeriodoEntreMuestras()
     * Descripción:
     * método para escoger la separacion temporal entre muestras para mostrar en el gráfico. Servirá para hacer la media de las mediciones
     * durante x minutos, según la longitud temporal del periodo que se va a mostrar.
     * 
     * fechaIni: N,
     * fechaFin: N -> escogerPeriodoEntreMuestras()
     * N <-
     * 
     * @param {*} fechaIni Tipo N con la fecha inicial del periodo
     * @param {*} fechaFin Tipo N con la fecha final del periodo
     * @returns Tipo N con los minutos que habrá entre muestras en el gráfico
     */
    escogerPeriodoEntreMuestras(fechaIni, fechaFin){

        var diferenciaTiempo = fechaFin - fechaIni;

        //Menos de 24 horas
        if(diferenciaTiempo < 86400000){
            //Periodos de 10 minutos (se hará la media de los datos de cada 10 minutos)
            return 10

            //Mas de un dia y menos de 72 horas
        }else if(diferenciaTiempo >= 86400000 && diferenciaTiempo < 86400000*3){
            //Periodos de 30 minutos
            return 30
            
            //Mas de 3 dias y menos de 6 dias
        }else if(diferenciaTiempo >= 86400000*3 && diferenciaTiempo < 86400000*6){
            //Periodos de 60 minutos
            return 60
            //Mas de una semana (no se si llegaremos a tanto, por si acaso...)
        }else{
            //Periodos de 120 minutos
            return 120
        }

    }

    /**
     * sacarMediaMedicionesPorPeriodo()
     * Descripción:
     * método que obtiene los valores de las mediciones que serán mostrados en el gráfico, así como las fechas
     * asociadas a cada medición. Estas mediciones serán una media de las mediciones que se encuentren dentro de cada periodo
     * de x minutos escogido en el método escogerPeriodoEntreMuestras()
     * 
     * fechaIni: N,
     * fechaFin: N,
     * mediciones: [lista JSON] -> sacarMediaMedicionesPorPeriodo() <-
     * JSON  <-
     * {
     * fechas: [lista N],
     *  medias: [lista R]
     * }
     * 
     * @param {*} fechaIni Tipo N con la fecha inicial del periodo
     * @param {*} fechaFin Tipo N con la fecha final del periodo
     * @param {*} mediciones Lista de JSON con las mediciones
     * @returns objeto JSON {fechas: [lista N], medias: [lista R]}
     */
    sacarMediaMedicionesPorPeriodo(fechaIni, fechaFin, mediciones){
        var periodoInicio = fechaIni;
        var fechasPorPeriodo = [];
        var mediaMedicionesPorPeriodo = [];
        var periodo = this.escogerPeriodoEntreMuestras(fechaIni, fechaFin);

        console.log(periodoInicio)
        console.log(fechaFin)
        console.log(periodo)

        while(periodoInicio < fechaFin){            
            mediaMedicionesPorPeriodo.push(this.mediaMedicionesPorPeriodo(periodoInicio, periodoInicio + periodo*60000, mediciones));
            fechasPorPeriodo.push(periodoInicio);
            periodoInicio += periodo*60000;
        }

        var variablesGrafica = {
            fechas : fechasPorPeriodo,
            medias : mediaMedicionesPorPeriodo
        }

        return variablesGrafica;
    }
    

    /**
     * mediaMedicionesPorPeriodo();
     * Descripción:
     * método que extrae la media a partir de una serie de mediciones.
     * 
     * fechaIni: N,
     * fechaFin: N,
     * mediciones: [lista JSON] -> mediaMedicionesPorPeriodo() <-
     * R <-
     * 
     * @param {*} fechaIni 
     * @param {*} fechaFin 
     * @param {*} mediciones 
     * @returns Tipo R con la media de cada periodo
     */
    mediaMedicionesPorPeriodo(fechaIni, fechaFin, mediciones){
        var sum = 0;
        var cont = 0;
        
        for(var i = 0; i < mediciones.length; i++){
            if(mediciones[i].fecha >= fechaIni && mediciones[i].fecha < fechaFin){
                cont ++;
                sum += mediciones[i].medida;
            }
        }
        if(cont > 0){
            return sum/cont;
        }
        return 0;
    }



    //---------------------------------------------------------------------------------
    //---------------------------------------------------------------------------------
    // LÓGICA PARA OBTENER LA MEDIA GLOBAL Y LA DESVIACIÓN DE LAS MEDIDAS TOMADAS EN UN PERIODO DE TIEMPO DE TODOS LOS SENSORES
    //---------------------------------------------------------------------------------
    //---------------------------------------------------------------------------------

    mediaGlobalMediciones(mediciones){
        var n = 1
        var sum = 0

        for(var i = 0; i < mediciones.length; i++){
            sum = sum +  mediciones[i].medida
            console.log("Suma: " + (sum))
            n++;
    
        }

        console.log("Suma: " + sum)
        
        console.log("Cont: " + n)
        return  sum/(n-1);    
    }

    sensoresQueHanEmitido(mediciones){
        var sensores = [];

        for(var i = 0; i < mediciones.length; i++){
            
            if(!sensores.includes( mediciones[i].macSensor )){
                sensores.push(mediciones[i].macSensor)
            }
            
        }

        return sensores;
    }

    mediaYRegistroValoresNegativosOCeroEnMedicionesPorSensor(mediciones){
        var n = 1;
        var sum = 0;
        var advertenciasSensores = [];

        // Para saber si el sensor ha estado registrando valores negativos o 0 de forma irregular
        // Si es de forma regular se verá que la media es 0 o < que 0...
        var valorNegativoOCero = false;
        var sensores = this.sensoresQueHanEmitido(mediciones);

        console.log("Longitud de sensores: " + sensores.length);
        for(var j = 0; j < sensores.length; j++){
            for(var i = 0; i < mediciones.length; i++){
                if(mediciones[i].macSensor == sensores[j]){
                    if(mediciones[i].medida > 0){
                        sum += mediciones[i].medida 
                        n++;
                    }else{
                        valorNegativoOCero = true;
                    }
                   
                }
            }

            console.log(sum)
            console.log(n)

            //añadimos a la lista la información de cada sensor con los posibles errores (para saber si la media está muy desviada se calcula posteriormente)
            advertenciasSensores.push({
                mediaGlobal: null,
                sensor: sensores[j],
                mediaSensor: sum/(n-1), // da el valor de la media de las mediciones de cada sensor
                desviacionRespectoMediaGlobal:null,
                limiteDesviacionSuperior: 0,
                limiteDesviacionInferior: 0,
                valoresIrregularesNoValidos: valorNegativoOCero, // true es que hay mediciones negativas o 0 
                mediaDesviada:0 // 0 será que la media se encuentra en un rango aceptable; -1 cuando se encuentre muy por debajo de la media y 1 muy por encima
            })

            //Restauramos las condiciones para el siguiente sensor
            sum = 0;
            n = 1;
            valorNegativoOCero = false;
        }
        
        return advertenciasSensores;
    }


    desviacionEstandar(mediaGlobalMediciones, listaMediasSensores){

        var sum = 0;


console.log("Este es el NaN? " + listaMediasSensores.length)
        for(var i = 0; i < listaMediasSensores.length; i++){

            sum += Math.pow((listaMediasSensores[i].mediaSensor - mediaGlobalMediciones), 2);
        }

        console.log("Este es el NaN? " + Math.sqrt(sum/listaMediasSensores.length))
        return Math.sqrt(sum/listaMediasSensores.length);
    }


    advertenciasMedicionesSensores(mediciones){
        
        var mediaGlobal = this.mediaGlobalMediciones(mediciones);
        var listaAdvertenciasPorSensor = this.mediaYRegistroValoresNegativosOCeroEnMedicionesPorSensor(mediciones);
        var desviacion = this.desviacionEstandar(mediaGlobal, listaAdvertenciasPorSensor);

        for (var i = 0; i < listaAdvertenciasPorSensor.length; i++){

            listaAdvertenciasPorSensor[i].mediaGlobal = mediaGlobal;
            listaAdvertenciasPorSensor[i].desviacionRespectoMediaGlobal = desviacion;
            listaAdvertenciasPorSensor[i].limiteDesviacionInferior = mediaGlobal - 2*desviacion;
            listaAdvertenciasPorSensor[i].limiteDesviacionSuperior = mediaGlobal + 2*desviacion;
            //Si la media de las medidas de un sensor es mayor a la media global mas 2 veces la desviación pondremos un 1
            if(listaAdvertenciasPorSensor[i].mediaSensor > (mediaGlobal + 2*desviacion)){
                listaAdvertenciasPorSensor[i].mediaDesviada = 1;

                //Si la media de las medidas de un sensor es menor a la media global menos 2 veces la desviación pondremos un -1
            }else if (listaAdvertenciasPorSensor[i].mediaSensor < (mediaGlobal - 2*desviacion)){
                listaAdvertenciasPorSensor[i].mediaDesviada = -1;
            }
        }


        return listaAdvertenciasPorSensor;

    }
    
}