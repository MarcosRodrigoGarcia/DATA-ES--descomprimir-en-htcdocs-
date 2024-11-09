

<?php
session_start();
include_once('../../resources/templates/header.php');

// Asegúrate de que la solicitud es POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Leer el cuerpo de la solicitud POST (el JSON que llega)
    $jsonData = file_get_contents('php://input');

    // Decodificar el JSON
    $data = json_decode($jsonData, true);

    // Verificar si el JSON es válido
    if (json_last_error() === JSON_ERROR_NONE) {
        // Convertir el array PHP de nuevo a JSON para pasarlo al frontend
        $jsonDataForFrontend = json_encode($data, JSON_UNESCAPED_UNICODE);
    } else {
        // Si el JSON no es válido, devolver un error
        $jsonDataForFrontend = json_encode([
            'status' => 'error',
            'message' => 'Error al decodificar JSON: ' . json_last_error_msg()
        ]);
    }
} else {
    // Si no es una solicitud POST, asignar null en lugar de un mensaje de error
    $jsonDataForFrontend = "null"; // Aquí ponemos null en lugar de un JSON con el mensaje de error
}
?>

<body onload="cargarOperaciones(<?php echo htmlspecialchars(json_encode($jsonDataForFrontend), ENT_QUOTES, 'UTF-8'); ?>)">

   
    <div class="container busqueda-personalizada" id="contenedor-gafico">
    <div class="titulo">
      <h2>Búsqueda personalizada</h2>
    </div>
        <div class="row">
            <div class="col-md-6">
                <div class="operacion">
                    <h2> Operación </h2>
                        <select onchange="tablasOperacion()" id="operaciones" name="operaciones">
                            <option disabled>Selecciona Operación</option>
                        </select>
                </div>
            </div>
            <div class="col-md-6">
                <div class="tabla">
                    <h2> Tabla </h2>
                    <select onchange="buscarVariablesSerie()" id="tablas" name="tablas">
                    </select>
                </div>
            </div>
        </div>
        <div class = "row" id="contenedor_variables">
        </div>
        <div class="progress">
        <div class="progress-bar progress-bar-striped bg-info" role="progressbar" style="width: 0%;" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100"></div>
        </div>
        <div class="botones">
            <button class="btn btn-info" onclick="recogerValoresVariables()" disabled><i class="fa-solid fa-chart-line"></i> Mostrar gráfico</button>
            
        </div>
        <div id="chart-container" style="width:100%"></div>
        <div class="botones_compartir" style="display: none;">
           <button onclick="shareUrlImage()" id="btn-share" class="btn btn-outline-success mx-xl-2"><i class="fa fa-whatsapp" aria-hidden="true"></i> Compartir</button> 
           <a id="share-link"href="https://api.whatsapp.com/send?text=https://marcosrodrigo.es/"  data-action="share/whatsapp/share" target="_blank"> 
           </a>
        </div>
        
    </div>
    

        
    
  


<?php
    if (isset($_SESSION['administrator'])){
        if($_SESSION['administrator']==1){
            include_once('../administrador/administrador.php');

        }
    }    
    include_once('../../resources/templates/footer.php');
include_once('../../resources/templates/login.php');
include_once('../../resources/templates/sing_up.php');
?>

