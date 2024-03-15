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

//-- Puerto de esucha del servidor
const PUERTO = 9090;

//-- Leer el contenido de index.html y error.html
const pagina_main = fs.readFileSync(path.join(__dirname, 'index.html'));
const pagina_error = fs.readFileSync(path.join(__dirname, 'error.html'));

//-- Crear el servidor
const server = http.createServer((req, res) => {
    
    //-- Indicamos que se ha recibido una petición
    console.log("Petición recibida!");

    //-- Valores de la respuesta por defecto
    let code = 200;
    let code_msg = "OK";
    let page = pagina_main;

    //-- Analizar el recurso
    //-- Construir el objeto url con la url de la solicitud
    const url = new URL(req.url, 'http://' + req.headers['host']);
    console.log(url.pathname);

    //-- Cualquier recurso que no sea la página principal
    //-- genera un error
    if (url.pathname != '/') {
        code = 404;
        code_msg = "Not Found";
        page = pagina_error;
    }

    //-- Generar la respusta en función de las variables
    //-- code, code_msg y page
    res.statusCode = code;
    res.statusMessage = code_msg;
    res.setHeader('Content-Type','text/html');
    res.write(page);
    res.end();
  });
  
  //-- Activar el servidor: ¡Que empiece la fiesta!
  server.listen(PUERTO);
  
  console.log("Server activado!. Escuchando en puerto: " + PUERTO);