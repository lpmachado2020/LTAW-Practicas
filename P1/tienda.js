//-- Servidor tienda.js

/*
Activar servidor: node tienda.js
URL para lanzar una petición: http://127.0.0.1:9090/
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

// Tipos MIME para diferentes extensiones de archivos
const TIPOS_MIME = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.jpg': 'image/jpeg',
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
    console.log("Petición recibida!");
    const url = new URL(req.url, 'http://' + req.headers['host']);
    const extension = path.extname(url.pathname);
    
    // Si la URL es la raíz del sitio
    if (url.pathname === '/') {
        servirArchivo(res, RUTA_INDEX, 'text/html');
    // Si la extensión del archivo está definida en los tipos MIME
    } else if (TIPOS_MIME[extension]) {
        servirArchivo(res, path.join(__dirname, url.pathname), TIPOS_MIME[extension]);
    // Sino se encuentra la extensión del archivo solicitado
    } else {
        servirArchivo(res, RUTA_ERROR, 'text/html');
    }
});
  
//-- Activar el servidor: ¡Que empiece la fiesta!
server.listen(PUERTO);
console.log("Server activado!. Escuchando en puerto: " + PUERTO);