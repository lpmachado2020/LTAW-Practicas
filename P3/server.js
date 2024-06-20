//-- Servidor server.js

/*
- Activar servidor en el terminal: node server.js
- URL para lanzar una petición: http://127.0.0.1:8080/ o http://localhost:8080/
  Significa: "Conéctate al puerto 8080 de tu propia máquina"
- El servidor se detiene pulsando: Ctrl-C
*/

//-- Cargar las dependencias
const socket = require('socket.io');
const http = require('http');
const express = require('express');
const colors = require('colors');

const PUERTO = 8080;

//-- Crear una nueva aplciacion web
const app = express();

//-- Crear un servidor, asosiaco a la App de express
const server = http.Server(app);

//-- Crear el servidor de websockets, asociado al servidor http
const io = socket(server);

//-------- PUNTOS DE ENTRADA DE LA APLICACION WEB
// Configurar para que Express entienda los datos enviados desde el formulario
app.use(express.urlencoded({ extended: true }));

//-- Definir el punto de entrada principal de mi aplicación web
app.get('/', (req, res) => {
    //-- Si accede al recurso '/' envíale a la página home.html para que introduzca su nickname
    res.sendFile(__dirname + '/public/home.html');
});

//-- Esto es necesario para que el servidor le envíe al cliente la
//-- biblioteca socket.io para el cliente
app.use('/', express.static(__dirname +'/'));

//-- El directorio publico contiene ficheros estáticos
app.use(express.static('public'));

// Manejar la solicitud POST del formulario de inicio de sesión
app.post('/login', (req, res) => {
    const username = req.body.username;
    // Aquí puedes hacer lo que quieras con el username, como almacenarlo en una variable o base de datos
    console.log(`Usuario ingresado: ${username}`);

    // Redireccionar al usuario a la página chat.html dentro del directorio 'public'
    res.redirect('public/chat.html');
});

//------------------- GESTION SOCKETS IO
//-- Evento: Nueva conexion recibida
io.on('connect', (socket) => {
  
  console.log('** NUEVA CONEXIÓN **'.yellow);

  //-- Evento de desconexión
  socket.on('disconnect', function(){
    console.log('** CONEXIÓN TERMINADA **'.yellow);
  });  

  //-- Mensaje recibido: Reenviarlo a todos los clientes conectados
  socket.on("message", (msg)=> {
    console.log("Mensaje Recibido!: " + msg.blue);

    //-- Reenviarlo a todos los clientes conectados
    io.send(msg);
  });

});

//-- Lanzar el servidor HTTP
//-- ¡Que empiecen los juegos de los WebSockets!
server.listen(PUERTO);
console.log("Escuchando en puerto: " + PUERTO);