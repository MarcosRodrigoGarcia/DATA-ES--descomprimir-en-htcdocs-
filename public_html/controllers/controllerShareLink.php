<?php

// Función para gestionar la descomposición de Deflate de los datos
function descomprimirDeflate($base64Data) {
    // Convertir el hash en Base64 a binario
    $compressedData = base64_decode($base64Data);

    // Descomprimir los datos utilizando Deflate (zlib)
    $jsonData = zlib_decode($compressedData);

    if ($jsonData === false) {
        throw new Exception("Error al descomprimir los datos");
    }

    // Convertir el JSON descomprimido en un array PHP
    $originalData = json_decode($jsonData, true);

    if ($originalData === null) {
        throw new Exception("Error al decodificar JSON");
    }

    return $originalData;
}

try {
    // Obtener la parte final de la URL después de "/share/"
    $urlPath = $_SERVER['REQUEST_URI']; // Esto obtiene la ruta completa de la URL

    // Extraer el hash Base64 de la URL (esperando la estructura '/share/{hash}')
    $pathParts = explode("/share/", $urlPath);
    
    if (count($pathParts) < 2) {
        throw new Exception("No se ha encontrado un hash válido en la URL.");
    }

    $hashBase64 = $pathParts[1]; // Aquí obtenemos el hash (por ejemplo, 'eJyVkUFqwzAQRa8itGrBC')

    // Descomprimir y decodificar los datos
    $dataChartLink = descomprimirDeflate($hashBase64);

    // Convertir el array PHP de vuelta a JSON para enviarlo por POST
    $jsonData = json_encode($dataChartLink, JSON_UNESCAPED_UNICODE);

    // Generar el formulario y enviarlo automáticamente usando JavaScript
    echo '<form id="postForm" action="https://marcosrodrigo.es/busquedaPersonalizada" method="POST">';
    echo '<input type="hidden" name="dataChartLink" value=\'' . htmlspecialchars($jsonData, ENT_QUOTES, 'UTF-8') . '\'>';
    echo '</form>';
    echo '<script type="text/javascript">';
    echo 'document.getElementById("postForm").submit();';
    echo '</script>';

} catch (Exception $e) {
    // Mostrar mensaje de error en caso de fallo
    echo "<h1>Error:</h1>";
    echo "<p>" . $e->getMessage() . "</p>";
}

?>
