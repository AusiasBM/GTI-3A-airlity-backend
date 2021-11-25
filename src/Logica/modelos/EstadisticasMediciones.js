/**
 * LogicaNegocio.js
 * @author Aitor Benítez Estruch
 * @date: 2021/11/02
 * 
 * @description:
 * Clase LogicaNegocio contiene los métodos con las operaciones necesarias para insertar datos (mediciones del sensor)
 * y recuperarlas de la bd.
 * 
 */


 module.exports = class EstadisticasMediciones{

    constructor(){} // ()


    obtenerValoresEstadisticos( medicionesFiltradasPorPeriodo, umbralMaximo){
        
        var mediaYTiempo = this.mediaPonderada( medicionesFiltradasPorPeriodo);
        var valorMax = this.valorMaximoPeriodo(medicionesFiltradasPorPeriodo);
        var adv = this.advertenciasUmbrales(medicionesFiltradasPorPeriodo, umbralMaximo);

        var tiempoSobreexpuesto = this.calculoTiempoSobrexpuesto(adv);
        var valoracion = this.valoracionCalidadAireRespirado(mediaYTiempo.tiempoMedido, tiempoSobreexpuesto, mediaYTiempo.mediaPonderada, valorMax, umbralMaximo);

        var objeto = {
            media: mediaYTiempo.mediaPonderada,
            tiempo: mediaYTiempo.tiempoMedido,
            valorMaximo: valorMax,
            advertencias: adv,
            valoracionCalidadAire: valoracion
        }

        return objeto;

    }


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


    valorMaximoPeriodo(mediciones){

        let varlorMaximoMedido = 0
    
        for(var i = 0; i < mediciones.length; i++){
            if(mediciones[i].medida > varlorMaximoMedido){
                varlorMaximoMedido = mediciones[i].medida
            }
        }
    
        return varlorMaximoMedido
    }


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

    calculoTiempoSobrexpuesto(advertencias){

        var tiempoSobrexpuesto = 0;
        for(var i = 0; i < advertencias.length; i ++){
            tiempoSobrexpuesto += advertencias[i].periodoTiempoTranscurrido;
        }

        return tiempoSobrexpuesto;
    }




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
    

    
}