<?php
// upload-image.php

header('Content-Type: application/json');

// Asegúrate de que se está recibiendo una solicitud POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $uploadsDir = '/var/www/html/img/compartir/';
        $svgCode = file_get_contents('php://input'); // Lee el cuerpo de la solicitud como datos en bruto
        $svgPath = $uploadsDir . 'share.svg';  // Guarda el SVG con un nombre fijo
        $pngPath = $uploadsDir . 'share.png';  // Guarda el PNG con un nombre fijo

    // Guarda el código SVG en un archivo temporal
    file_put_contents($svgPath, $svgCode);

    try {
        // Crea una instancia de Imagick y lee el archivo SVG
        $imagick = new Imagick();
        $imagick->readImage($svgPath);

        // Establece el tamaño deseado del PNG
        $imagick->setImageFormat('png');
        $imagick->setImageResolution(300, 300);
        $imagick->resizeImage(1024, 1024, Imagick::FILTER_LANCZOS, 1);
        $imagick->stripImage(); // Elimina datos adicionales del archivo
        $imagick ->setBackgroundColor(new ImagickPixel('transparent'));

        // Escribe la imagen como PNG
        $imagick->writeImage($pngPath);

        // Limpia el objeto Imagick
        $imagick->clear();
        $imagick->destroy();

        // Elimina el archivo SVG temporal
        unlink($svgPath);

        // Devuelve una respuesta JSON con el éxito y la URL de la imagen PNG
        echo json_encode(['success' => true, 'imageUrl' => 'img/compartir/' . $imageId . '.png']);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Error al convertir la imagen: ' . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Solicitud inválida']);
}
?>
