//-- Ejemplo primer servidor web

//-- URL para lanzar una petición: http://127.0.0.1:8080/
//-- Significa: "Conéctate al puerto 8080 de tu propia máquina"

//-- El servidor se detiene pulsando: Ctrl-C


const http = require('http');

//-- Crear el servidor
const server = http.createServer();

//-- Función de retrollamada de petición recibida
//-- Cada vez que un cliente realiza una petición
//-- Se llama a esta función
function atender(req, res) {
    //-- req: http.IncomingMessage: Mensaje de solicitud
    //-- res: http.SercerResponse: Mensaje de respuesta (vacío)

    //-- Indicamos que se ha recibido una petición
    console.log("Petición recibida!");

    //-- pero no enviamos respusta (todavía)
}

//-- Activar la función de retrollamada del servidor
server.on('request', atender);

//-- Activar el servidor. A la escucha de peitciones
//-- en el puerto 8080
server.listen(8080);