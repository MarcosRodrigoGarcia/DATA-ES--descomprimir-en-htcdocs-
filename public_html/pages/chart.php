<?php
session_start();
include_once('../../resources/templates/header.php');
?>

<div class="container busqueda-personalizada" id="contenedor-gafico">
    <h1 id='titulografico' titulografico=<?php echo $_POST['tabla']; ?>> <?php echo $_POST['titulo']; ?></h1>
    <h2 id='subtitulografico'><?php echo $_POST['subtitulo']; ?></h2>
    <div class="row" id="contenedor_variables">
    </div>
    <div class="progress">
        <div class="progress-bar progress-bar-striped bg-info" role="progressbar" style="width: 0%;" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100"></div>
    </div>
    <div class="botones">
        <button class="btn btn-info" onclick="recogerValoresVariables2()"><i class="fa-solid fa-chart-line"></i> Mostrar gráfico</button>

    </div>
    <div id="chart-container" style="width:100%"></div>
</div>


<script>
    //ESTA FUNCIÓN BUSCA LAS VARIABLES Y LOS VALORES DE LA TABLA SELECCIONADA


    //console.log("estoy dentro de la función");


    var tablasOperacion = $('#titulografico').attr('titulografico');
    var nombreTabla = $('#subtitulografico').text();
    //borramos todos los hijos del contenedor de variables
    $('#contenedor_variables .variable_tabla').remove();

    // CREAMOS CONTENEDOR VARIABLES
    let contenedor = document.getElementById("contenedor_variables");

    //consulta
    const request = new XMLHttpRequest();
    const endpoint = "https://servicios.ine.es/wstempus/js/ES/GRUPOS_TABLA/" + tablasOperacion;
    //console.log(endpoint);

    request.open('GET', endpoint, true);
    request.send();
    request.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            //console.log("dentro de on ready")

            //seleccionamos el div

            ////console.log(request.responseText);
            let datos2 = JSON.parse(this.responseText);
            //console.log(datos2);
            //acceder al primer elemento
            //creamos un div por cada uno de las variables. Desntro de cada div, crearemos un select para cada uno de los datos que pueden tomar esas variables
            for (let item of datos2) {

                //console.log("estoy dentro del for:");
                var newDiv = document.createElement("div");
                newDiv.setAttribute("class", "variable_tabla");
                newDiv.setAttribute("id", item.Id);
                //let id_variable=item.Id;
                contenedor.appendChild(newDiv);
                //hemos creado un div por cada una de las variables ahora tendremos que llenarlas con un select
                let newH3 = document.createElement("h3");
                newH3.appendChild(document.createTextNode(item.Nombre));
                let newSelect = document.createElement("select");
                newSelect.setAttribute("id", "s" + item.Id);
                newSelect.addEventListener('onchange', actualizarStatusBar('100%'));
                // newSelect.setAttribute("multiple","multiple");

                let div_variable = document.getElementById(item.Id);
                div_variable.appendChild(newH3);
                div_variable.appendChild(newSelect);
                let select_variable = document.getElementById("s" + item.Id);
                //hacemos consulta de los valores de las variables
                const request = new XMLHttpRequest();
                const endpoint = "https://servicios.ine.es/wstempus/js/ES/VALORES_GRUPOSTABLA/" + tablasOperacion + "/" + item.Id + "/";
                //console.log(endpoint);

                request.open('GET', endpoint, true);
                request.send();
                request.onreadystatechange = function() {
                    if (this.readyState == 4 && this.status == 200) {
                        let valores = JSON.parse(this.responseText);
                        //console.log(valores);
                        for (let item of valores) {
                            var newOption = document.createElement("option");
                            newOption.setAttribute("value", "tv=" + item.FK_Variable + ":" + item.Id);
                            newOption.setAttribute("data-name", item.Nombre);
                            var value = "tv=" + item.FK_Variable + ":" + item.Id
                            var newContent = document.createTextNode(item.Nombre);
                            newOption.appendChild(newContent);
                            select_variable.appendChild(newOption);
                            if (item.FK_Variable == 349 || item.FK_Variable == 70 || item.FK_Variable == 794 || item.FK_Variable == 115) {
                                //console.log('dentro del if');
                                select_variable.setAttribute('multiple', 'multiple');
                                select_variable.classList.add('provincia');
                                select_variable.style.height = "100px";
                                if (item.FK_Variable == 794) {
                                    select_variable.style.height = "unset";
                                }

                            }

                        }
                    }
                }
            }
        }
    }

    $('#contenedor_variables').hide;
    $('#contenedor_variables').fadeIn(1000);
    actualizarStatusBar('66%');


    //AJAX Rescatar clasificacion

    var id_operacion = $('#operaciones').val();
    var id_tabla = $('#tablas').val();

    $.ajax({
        "method": "POST",
        "url": "../controllers/ajax.php",
        "data": {
            id_operacion: id_operacion,
            id_tabla: id_tabla,
            operacion: 'recuperar'

        }
    }).done(function(respuesta) {
        //RESPUESTA DEL SERVIDOR
        $('#txtHint').html(respuesta);

        //ahora mostraremos los checkbox
        var datoschart = JSON.parse(respuesta);
        // //console.log('RESPUESTA AJAX');
        // //console.log(datoschart);
        actualizarcheckbox(datoschart)






        // //console.log(respuesta);
    }).fail(function(respuesta) {
        //RESPUESTA fallida DEL SERVIDOR
        //console.log('Respuesta fallida');
    });

    //BUSCA SERIES y LLAMA A PINTAR GRAFICO
    function mostrarSeries2(parametros) {
        var index = 0;
        var dataseries = [];
        var prueba = "prueba"
        var tablasOperacion = $('#titulografico').attr('titulografico');
        const request = new XMLHttpRequest();
        const endpoint = "https://servicios.ine.es/wstempus/js/ES/SERIES_TABLA/" + tablasOperacion + "/?" + parametros;
        request.open('GET', endpoint, true);
        request.send();
        request.onreadystatechange = function() {

            if (this.readyState == 4 && this.status == 200) {
                let valores = JSON.parse(this.responseText);
                //console.log(valores);

                for (let item of valores) {
                    var i = 0;


                    //Por cada item haremos una consulta a la API 

                    const request = new XMLHttpRequest();
                    const endpoint = 'https://servicios.ine.es/wstempus/js/ES/DATOS_SERIE/' + item.COD + '?date=19000101:';
                    //console.log('endpoint:' + endpoint);
                    request.open('GET', endpoint, true);
                    request.send();

                    request.onreadystatechange = function() {
                        // recogemos los datos
                        if (this.readyState == 4 && this.status == 200) {
                            let series = JSON.parse(this.responseText);
                            // let conjuntoData = [];
                            //console.log(series);
                            //Variables Chart

                            var anyos = new Array();
                            var periodos = new Array();

                            var data = new Array();

                            // nombreTabla = $('#operaciones option:selected').text() /*+' '+ series.Nombre*/;
                            for (let serie of series.Data) {

                                // anyos.push(serie.Anyo + " " + serie.FK_Periodo);
                                data.push(serie.Valor);
                                anyos.push(serie.Anyo);
                                periodos.push(serie.FK_Periodo);

                            }
                            // conjuntoData.push(data);
                            // //console.log(conjuntoData);

                            //console.log("i");
                            //console.log("--------------------------");
                            //console.log(i);

                            var dataserie = {
                                name: ciudades[i],
                                data: data
                            };
                            dataseries.push(dataserie);

                            i++;
                            // //console.log('index:'+index);
                            //  //console.log(valores.length-1);

                            //TENDREMOS QUE CREAR EL OBJETO GRÁFICO (Faltaría que solo lo cree cuando en la última iteración del for)
                            // if(index==valores.length-1){

                            chartBusquedaPersonalizada = new chart(nombreTabla, "tiempo", "Y", anyos, periodos, dataseries, "line", "color");

                            // LLAMAMOS A LA FUNCIÓN QUE PINTA EL GRÁFICO
                            pintarChart2(chartBusquedaPersonalizada.anyos, chartBusquedaPersonalizada.dataSeries, chartBusquedaPersonalizada.title, chartBusquedaPersonalizada.type);
                            // pintarChart2(anyos, chartBusquedaPersonalizada.dataSeries, nombreTabla);
                            // pintarChart(anyos, data, nombreTabla);
                        }
                    }

                }

            }
        }

    }

    function recogerValoresVariables2() {
        //primero tenemos que recoger las variables seleccionadas para luego ver las series que la componen
        let valoresVariables = "";
        let nombreVariable = "";
        ciudades = [];

        $('.variable_tabla select').each(function(index) {
            valoresVariables += $(this).val() + "&";

        });

        $(".variable_tabla select.provincia option:selected").each(function() {
            var $this = $(this);
            if ($this.length) {
                var ciudad = $this.text();
                ciudades.push(ciudad);
            }
        });

        //console.log("CIUDADES");
        //console.log(ciudades);



        valoresVariables = valoresVariables.substring(0, valoresVariables.length - 1);
        valoresVariables = valoresVariables.replaceAll(",", "&");
        // llamamos a la función 

        //console.log("consulta");
        //console.log(valoresVariables);
        mostrarSeries2(valoresVariables);
    }
</script>



<?php

include_once('../../resources/templates/footer.php');
include_once('../../resources/templates/login.php');
include_once('../../resources/templates/sing_up.php');
?>