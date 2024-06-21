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

//-- Crear una nueva aplicación web
const app = express();

//-- Crear un servidor, asociado a la App de express
const server = http.Server(app);

//-- Crear el servidor de websockets, asociado al servidor http
const io = socket(server);

// Configurar para que Express entienda los datos enviados desde el formulario
app.use(express.urlencoded({ extended: true }));

//-- Definir el punto de entrada principal de mi aplicación web
app.get('/', (req, res) => {
    //-- Si accede al recurso '/' envíale a la página home.html para que introduzca su nickname
    res.sendFile(__dirname + '/public/home.html');
});

//-- Esto es necesario para que el servidor le envíe al cliente la
//-- biblioteca socket.io para el cliente
app.use('/', express.static(__dirname + '/'));

//-- El directorio público contiene ficheros estáticos
app.use(express.static('public'));

// Manejar la solicitud POST del formulario de inicio de sesión
app.post('/login', (req, res) => {
    const username = req.body.username;

    console.log(`-- Usuario ingresado: ${username.green} --`);

    // Redireccionar al usuario a la página chat.html dentro del directorio 'public'
    res.redirect('/chat.html');
});

// Almacenar usuarios conectados
const users = {};

//------------------- GESTION SOCKETS IO
//-- Evento: Nueva conexión recibida
io.on('connection', (socket) => {
    let username;

    socket.on('setUsername', (name) => {
        username = name;
        users[socket.id] = username;
        socket.emit('message', `¡Bienvenido al chat, ${username}!`);
        socket.broadcast.emit('message', `${username} se ha unido al chat`);
        console.log(`** NUEVA CONEXIÓN: ${username} **`.yellow);
    });

    //-- Evento de desconexión
    socket.on('disconnect', function(){
        if (username) {
            delete users[socket.id];
            io.emit('message', `${username} ha abandonado el chat`);
            console.log(`** CONEXIÓN TERMINADA: ${username} **`.yellow);
        }
    });

    //-- Mensaje recibido: Reenviarlo a todos los clientes conectados
    socket.on("message", (msg) => {
        if (msg.startsWith('/')) {
            // Es un comando
            let response;
            switch (msg) {
                case '/help':
                    response = "Comandos soportados: /help, /list, /hello, /date";
                    break;
                case '/list':
                    response = `Usuarios conectados: ${Object.values(users).join(', ')}`;
                    break;
                case '/hello':
                    response = `¡Hola, ${username}!`;
                    break;
                case '/date':
                    response = `Fecha y hora actual: ${new Date()}`;
                    break;
                default:
                    response = "Comando no reconocido. Escribe /help para ver la lista de comandos.";
                    break;
            }
            socket.emit('message', response);
        } else {
            // Es un mensaje normal
            console.log("Mensaje Recibido!: " + msg.blue);
            io.emit('message', `${username}: ${msg}`);
        }
    });
});

//-- Lanzar el servidor HTTP
//-- ¡Que empiecen los juegos de los WebSockets!
server.listen(PUERTO);
console.log("Escuchando en puerto: " + PUERTO);
