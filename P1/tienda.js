//-- Servidor tienda.js

/*
Activar servidor en el terminal: node tienda.js
URL para lanzar una petición: http://127.0.0.1:9090/ o http://localhost:9090/
Significa: "Conéctate al puerto 9090 de tu propia máquina"
Usando curl se mandan peticiones desde línea de comandos
curl -m 1 127.0.0.1:9090
El servidor se detiene pulsando: Ctrl-C
*/

//-- Importar módulos de Node.js
const http = require('http');
const fs = require('fs');
const path = require('path');

//-- Puerto de escucha del servidor
const PUERTO = 9090;

// Rutas de los archivos index y de error
const RUTA_INDEX = path.join(__dirname, 'index.html');
const RUTA_ERROR = path.join(__dirname, 'error.html');
const CARPETA_IMAGENES = path.join(__dirname, 'imagenes');

// Tipos MIME para diferentes extensiones de archivos
const TIPOS_MIME = {
    '.html': 'text/html',
    '.css': 'text/css'
};

// Función para servir archivos estáticos
function servirArchivo(res, rutaArchivo, contentType) {
    fs.readFile(rutaArchivo, (err, contenido) => {
        // Si hay un error al leer el archivo
        if (err) {
            res.writeHead(404);
            res.end();
        // Sino envía el código de éxito 200 y el tipo MIME correspondiente
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(contenido, 'utf-8');
        }
    });
}

//-- Crear el servidor
const server = http.createServer((req, res) => {
    // console.log("Petición recibida!");
    const url = new URL(req.url, 'http://' + req.headers['host']);
    const extension = path.extname(url.pathname);
    
    // Si la URL es la raíz del sitio
    if (url.pathname === '/') {
        console.log("Petición main")
        servirArchivo(res, RUTA_INDEX, 'text/html');
    // Si la extensión del archivo está definida en los tipos MIME
    } else if (TIPOS_MIME[extension]) {
        console.log("Petición recursos")
        servirArchivo(res, path.join(__dirname, url.pathname), TIPOS_MIME[extension]);
    // Si la extensión es .jpg, servir desde la carpeta imagenes/
    } else if (extension === '.jpg' || extension === '.png') {
        console.log("Petición imágenes")
        servirArchivo(res, path.join(CARPETA_IMAGENES, path.basename(url.pathname)), 'image/jpeg');
    // Sino se encuentra la extensión del archivo solicitado
    } else {
        console.log("Página error servida")
        servirArchivo(res, RUTA_ERROR, 'text/html');
    }
});
  
//-- Activar el servidor: ¡Que empiece la fiesta!
server.listen(PUERTO);
console.log("Server activado!. Escuchando en puerto: " + PUERTO);
