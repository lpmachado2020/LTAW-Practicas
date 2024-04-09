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

// Rutas de los archivos index, error y carpetas
const RUTA_INDEX = path.join(__dirname, 'ficheros', 'index.html');
const RUTA_ERROR = path.join(__dirname, 'ficheros', 'error.html');
const CARPETA_FICHEROS = path.join(__dirname, 'ficheros');
const CARPETA_IMAGENES = path.join(__dirname, 'imagenes');
const CARPETA_ESTILO = path.join(__dirname, 'estilo');
const CARPETA_JS = path.join(__dirname, 'js');

// Función para servir archivos estáticos
function servirArchivo(res, rutaArchivo, contentType) {
    fs.readFile(rutaArchivo, (err, contenido) => {
        // Si hay un error al leer el archivo
        if (err) {
            res.writeHead(404);
            res.end();
        // Sino envía el código de éxito 200 y el tipo MIME correspondiente
        } else {
            res.writeHead(200, {'Content-Type': contentType});
            res.end(contenido, 'utf-8');
        }
    });
}

// Función para generar la lista de archivos donde se encuentra la página principal
function listarArchivosHTML(res) {
    fs.readdir(CARPETA_FICHEROS, (err, files) => {
        if (err) {
            console.error('Error al leer el directorio:', err);
            res.writeHead(500);
            res.end();
        } else {
            const html = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta http-equiv="X-UA-Compatible" content="IE=edge">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Lista de archivos</title>
                </head>
                <body>
                    <h1>Archivos en la carpeta principal:</h1>
                    <ul>
                        ${files.map(file => `<li>${file}</li>`).join('')}
                    </ul>
                </body>
                </html>
            `;
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(html);
        }
    });
}

//-- Creación del servidor
const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://' + req.headers['host']);
    const extension = path.extname(url.pathname);
    
    // Si la URL es la raíz del sitio
    if (url.pathname === '/') {
        console.log("Petición main");
        servirArchivo(res, RUTA_INDEX, 'text/html');
    // Si la URL es la página de error
    } else if (url.pathname === '/error.html') {
        console.log("Petición error");
        servirArchivo(res, RUTA_ERROR, 'text/html');
    // Si la URL es /ls, mostrar la lista de archivos en la carpeta principal
    } else if (url.pathname === '/ls') {
        console.log("Petición listado de archivos");
        listarArchivosHTML(res);
    // Si la extensión es .html, servir desde la carpeta fichero/...
    } else if (extension === '.html') {
        console.log("Petición recursos");
        servirArchivo(res, path.join(__dirname, 'ficheros', url.pathname), 'text/html');
    // Si la extensión es .css, servir desde la carpeta estilo/...
    } else if (extension === '.css') {
        console.log("Petición estilo .css");
        servirArchivo(res, path.join(CARPETA_ESTILO, path.basename(url.pathname)), 'text/css');
    // Si la extensión es .jpg, servir desde la carpeta imagenes/...
    } else if (extension === '.jpg') {
        console.log("Petición imágenes .jpg");
        servirArchivo(res, path.join(CARPETA_IMAGENES, path.basename(url.pathname)), 'image/jpg');
    // Si la extensión es .png, servir desde la carpeta imagenes/...
    } else if (extension === '.png') {
        console.log("Petición imágenes .png");
        servirArchivo(res, path.join(CARPETA_IMAGENES, path.basename(url.pathname)), 'image/png');
    // Si la extensión es .js, servir desde la carpeta js/...
    } else if (extension === '.js') {
        console.log("Petición javascript");
        servirArchivo(res, path.join(CARPETA_JS, path.basename(url.pathname)), 'text/javascript');
    // En cualquier otro caso sirve la página de error
    } else {
        console.log("Página error servida");
        servirArchivo(res, RUTA_ERROR, 'text/html');
    }
});
  
//-- Activar el servidor: ¡Que empiece la fiesta!
server.listen(PUERTO);
console.log("Server activado!. Escuchando en puerto: " + PUERTO);
