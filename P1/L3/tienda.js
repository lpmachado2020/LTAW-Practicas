//-- Servidor

//-- URL para lanzar una petición: http://127.0.0.1:8080/
//-- Significa: "Conéctate al puerto 8080 de tu propia máquina"

//-- Usando curl se mandan peticiones desde línea de comandos
//-- url -m 1 127.0.0.1:8080

//-- El servidor se detiene pulsando: Ctrl-C


const http = require('http');

//-- El servidor debe escuchar en el puerto 9090
//-- Definir el puerto a utilizar
const PUERTO = 9090;

//-- Crear el servidor. La función de retrollamada de
//-- atención a las peticiones se define detnro de los
//-- argumentos
const server = http.createServer((req, res) => {
    
  //-- Indicamos que se ha recibido una petición
  console.log("Petición recibida!");
});

//-- Activar el servidor: ¡Que empiece la fiesta!
server.listen(PUERTO);

console.log("Servidor activado. Escuchando en puerto: " + PUERTO);