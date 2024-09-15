var nombreTabla;
var chartBusquedaPersonalizada;
var nombreEjeX = 'tiempo';
var nombreEjeY = 'dato';
var nombreSerie;
var ciudades=[];

        
        
        //CARGA LAS OPERACIONES
        function cargarOperaciones() {
             //ocultar botton WA

            $('.botones_compartir').hide();


            const endpoint = 'https://servicios.ine.es/wstempus/js/ES/OPERACIONES_DISPONIBLES?geo=1';
            const request = new XMLHttpRequest();

            request.open('GET', endpoint, true);
            request.send();
            request.onreadystatechange = function() {
                //Cuando la respuesta del servidor es 4 y el status 200
                if (this.readyState == 4 && this.status == 200) {
                    //seleccionamos el select
                    let select = document.getElementById("operaciones");
                    ////console.log(request.responseText);
                    let datos = JSON.parse(this.responseText);
                    //console.log(datos);
                    //acceder al primer elemento
                    
                    //ITERAMOS CADA ELEMENTO PARA SACAR SU COD_IOE QUE UTILIZAREMOS POSTERIORMENTE
                    for (let item of datos) {
                        if(item.Cod_IOE!=""){
                            var newSelect = document.createElement("option");
                            newSelect.setAttribute("value", item.Cod_IOE);
                            var newContent = document.createTextNode(item.Nombre);
                            newSelect.appendChild(newContent);
                            select.appendChild(newSelect);
                        }
                    }
                }
            }
        }
        //CARGA LAS TABLAS ASOCIADAS A LA OPERACIÓN
        function tablasOperacion() {

            /* deshabilita el botón de Mostrar Gráfico */
            $('button:contains("Mostrar gráfico")').prop('disabled', true);  

            $('#contenedor_variables').fadeOut();
            //Borramos el Select de tablas
            removeselect();
            //Cogemos el valor del código de operación
            var selectedElement = document.getElementById('operaciones');
            var operacion = selectedElement.value;

            const request = new XMLHttpRequest();
            const endpoint = "https://servicios.ine.es/wstempus/js/ES/TABLAS_OPERACION/IOE" + operacion + "/";
            //console.log(endpoint);

            request.open('GET', endpoint, true);
            request.send();
            request.onreadystatechange = function() {

                if (this.readyState == 4 && this.status == 200) {

                    //seleccionamos el slect
                    let select = document.getElementById("tablas");
                    ////console.log(request.responseText);
                    let datos = JSON.parse(this.responseText);
                    //console.log(datos);
                    //acceder al primer elemento

                    //Rellenamos el select de tabla
                    for (let item of datos) {
                        //console.log(item);
                        var newSelect = document.createElement("option");
                        newSelect.setAttribute("value", item.Id);
                        var newContent = document.createTextNode(item.Nombre);
                        newSelect.appendChild(newContent);
                        select.appendChild(newSelect);

                    }
                }
            }
            $('div.tabla').fadeIn();
            //actualizar status bar
            actualizarStatusBar('33%');
        }
        //BORRA SELECT
        function removeselect() {
            var cell = document.getElementById("tablas");

            if (cell.hasChildNodes()) {
                while (cell.childNodes.length >= 1) {
                    cell.removeChild(cell.firstChild);
                }
            }

        }

        //ESTA FUNCIÓN BUSCA LAS VARIABLES Y LOS VALORES DE LA TABLA SELECCIONADA
        function buscarVariablesSerie() {

            //console.log("estoy dentro de la función");

            var selectedElement = document.getElementById('tablas');
            var tablasOperacion = selectedElement.value;
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
                        newSelect.addEventListener('onchange',actualizarStatusBar('100%'));
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
                                    if(item.FK_Variable==349||item.FK_Variable==70||item.FK_Variable==794||item.FK_Variable==115){
                                        //console.log('dentro del if');
                                        select_variable.setAttribute('multiple','multiple');
                                        select_variable.classList.add('provincia');
                                        select_variable.style.height = "100px";
                                        if(item.FK_Variable==794){
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

            })

            $.ajax({
                "method": "POST",
                "url": "../controllers/ajax.php",
                "data": {
                        id_operacion:id_operacion,
                        id_tabla:id_tabla,
                        operacion:'recuperar'

                }
        }).done(function(respuesta) {
                //RESPUESTA DEL SERVIDOR
                $('#txtHint').html(respuesta);

                //ahora mostraremos los checkbox
                var datoschart= JSON.parse(respuesta);
                // //console.log('RESPUESTA AJAX');
                // //console.log(datoschart);
                actualizarcheckbox(datoschart)

                




                // //console.log(respuesta);
        }).fail(function(respuesta) {
            //RESPUESTA fallida DEL SERVIDOR
            console.log ('Respuesta fallida');
        });


        $('button:contains("Mostrar gráfico")').prop('disabled', false);   
            
            
            
        }
        function recogerValoresVariables() {
            //primero tenemos que recoger las variables seleccionadas para luego ver las series que la componen
            let valoresVariables = "";
            let nombreVariable = "";
            ciudades=[];

            $('.variable_tabla select').each(function(index) {
                valoresVariables += $(this).val() + "&";  

            });

            $(".variable_tabla select.provincia option:selected").each(function () {
                var $this = $(this);
                if ($this.length) {
                 var ciudad = $this.text();
                 ciudades.push(ciudad);
                }
            });
                

            valoresVariables = valoresVariables.substring(0, valoresVariables.length - 1);
            valoresVariables = valoresVariables.replaceAll(",","&");
            // llamamos a la función 

            //console.log("consulta");
            //console.log(valoresVariables);
            mostrarSeries(valoresVariables);


        }

        //BUSCA SERIES y LLAMA A PINTAR GRAFICO
        function mostrarSeries(parametros) {
            var index=0;
            var dataseries = [];
            var prueba = "prueba"
            var selectedElement = document.getElementById('tablas');
            var tablasOperacion = selectedElement.value;
            const request = new XMLHttpRequest();
            const endpoint = "https://servicios.ine.es/wstempus/js/ES/SERIES_TABLA/" + tablasOperacion + "/?" + parametros;
            request.open('GET', endpoint, true);
            request.send();
            request.onreadystatechange = function() {

                if (this.readyState == 4 && this.status == 200) {
                    let valores = JSON.parse(this.responseText);
                    //console.log(valores);

                    for (let item of valores) {
                        var i=0;
                        
                        
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
                                
                                nombreTabla = $('#operaciones option:selected').text() /*+' '+ series.Nombre*/;
                                for (let serie of series.Data) {

                                    // anyos.push(serie.Anyo + " " + serie.FK_Periodo);
                                    data.push(serie.Valor);
                                    anyos.push(serie.Anyo);
                                    periodos.push(serie.FK_Periodo);
                                    
                                }
                                
                                var dataserie= {name: ciudades[i],data: data};
                                dataseries.push(dataserie);
                                
                                i++;
                                // //console.log('index:'+index);
                                //  //console.log(valores.length-1);
                                
                                //TENDREMOS QUE CREAR EL OBJETO GRÁFICO (Faltaría que solo lo cree cuando en la última iteración del for)
                                // if(index==valores.length-1){

                                chartBusquedaPersonalizada=new chart(nombreTabla,"tiempo","Y",anyos,periodos,dataseries,"line","color");
                               
                                // LLAMAMOS A LA FUNCIÓN QUE PINTA EL GRÁFICO
                                pintarChart2(chartBusquedaPersonalizada.anyos, chartBusquedaPersonalizada.dataSeries, chartBusquedaPersonalizada.title,chartBusquedaPersonalizada.type);
                                // pintarChart2(anyos, chartBusquedaPersonalizada.dataSeries, nombreTabla);
                                // pintarChart(anyos, data, nombreTabla);

                                $('.botones_compartir').show();
                                
                               
                            }
                        }
                        
                    }
                    
                }
            }
            
        }

        function actualizarcheckbox(datoschart){
            if (parseInt(datoschart.c_economia)==1){
                $('#Economía').prop('checked',true);
            }
            if (parseInt(datoschart.c_demografia)==1){
                $('#demografia').prop('checked',true);
            }
            if (parseInt(datoschart.c_aYg)==1){
                $('#AyG').prop('checked',true);
            }
            if (parseInt(datoschart.c_turismo)==1){
                $('#turismo').prop('checked',true);
            }
            if (parseInt(datoschart.c_vivienda)==1){
                $('#vivienda').prop('checked',true);
            }
            if (parseInt(datoschart.fav)==1){
                $('#fav').prop('checked',true);
            }
            if (parseInt(datoschart.ban)==1){
                $('#ban').prop('checked',true);
            }
            if (datoschart.comentario){
                $('#comentario').val(datoschart.comentario);
            }
            if (datoschart.img){
                
                console.log ('img');
                console.log (datoschart.img);
                $('#picture').attr('src',datoschart.img);
            }

        }
       
        
        function actualizarStatusBar(porcentaje){
            $('.progress-bar').css('width',porcentaje);
        }

        async function shareUrlImage() {

            const dataChartLink = await construirDataChartLink();
            console.log(dataChartLink);   

            try {
                // Selecciona el SVG desde el DOM usando la clase
                const svgElement = document.querySelector('svg.highcharts-root');
                if (!svgElement) {
                    throw new Error('No se encontró el SVG con la clase "highcharts-root"');
                }
        
                // Obtén el contenido SVG como texto
                const svgText = new XMLSerializer().serializeToString(svgElement);
        
                // Configura la solicitud POST
                const response = await fetch('../controllers/upload-image.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'test/plain' // O 'text/plain' si prefieres
                    },
                    body: svgText // Enviamos el SVG como raw data
                });
        
                // Verifica si la solicitud fue exitosa
                if (!response.ok) {
                    throw new Error(`Error en la solicitud: ${response.statusText}`);
                }
        
                // Obtén la respuesta del servidor
                const result = await response.json();
        
                if (result.success) {
                    console.log('Imagen subida exitosamente:', result.imageUrl);
                    // Llama a la función con la nueva URL de la imagen
                    updateMetaImage('../img/compartir/share.png'); 
                } else {
                    console.error('Error al subir la imagen:', result.error);
                }
            } catch (error) {
                console.error('Error:', error.message);
            }
        }

        function updateMetaImage(newImageUrl) {
            // Selecciona la etiqueta <meta> con el atributo property="og:image"
            const metaTag = document.querySelector('meta[property="og:image"]');
        
            // Verifica si la etiqueta <meta> fue encontrada
            if (metaTag) {
                // Actualiza el atributo content con la nueva URL de la imagen
                metaTag.setAttribute('content', newImageUrl);
                console.log('Etiqueta meta actualizada con la nueva URL de imagen:', newImageUrl);
            } else {
                console.error('Etiqueta meta con property="og:image" no encontrada.');
            }
            clickShareLink();
        }

        function clickShareLink() {
            // Selecciona el enlace con el ID 'share-link'
            const shareLink = document.getElementById('share-link');
            
            // Verifica si el enlace fue encontrado
            if (shareLink) {
                // Simula un clic en el enlace
                shareLink.click();
                console.log('Enlace compartido a WhatsApp.');
            } else {
                console.error('Enlace con ID "share-link" no encontrado.');
            }
        }

        // Función para construir el objeto con la operación, tabla y variables seleccionadas
        async function construirDataChartLink() {
            // Obtener el select de operaciones y tabla
            const operacionSelect = document.getElementById("operaciones");
            const tablaSelect = document.getElementById("tablas");

            // Obtener los valores y nombres seleccionados de la operación
            const operacion = {
            nombre: operacionSelect.options[operacionSelect.selectedIndex].text,
            valor: operacionSelect.value
            };

            // Obtener los valores y nombres seleccionados de la tabla
            const tabla = {
            nombre: tablaSelect.options[tablaSelect.selectedIndex].text,
            valor: tablaSelect.value
            };

            // Obtener todas las variables seleccionadas (con múltiples select)
            const variables = [];
            const variableTables = document.querySelectorAll('#contenedor_variables .variable_tabla');

            variableTables.forEach((table) => {
                const nombreVariable = table.querySelector('h3').textContent;  // Obtener el nombre del <h3>
                const idVariable = table.id;  // Obtener el id del contenedor .variable_tabla
                
                const select = table.querySelector('select');
                
                const seleccionados = Array.from(select.selectedOptions).map((option) => ({
                nombre: option.getAttribute('data-name'),
                valor: option.value
            }));

            // Añadir cada variable al array con su nombre y valores seleccionados
            variables.push({
            id: idVariable,  // Aquí está el ID del contenedor
            nombre: nombreVariable,  // Aquí está el texto del <h3>
            valoresSeleccionados: seleccionados
            });
        });

            // Devolver el objeto con operación, tabla y variables
            return {
            operacion,
            tabla,
            variables
            }; 

    }
        
        
        
        

        
        
        
        

      
