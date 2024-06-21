//-- Servidor server.js

/*
- Activar servidor en el terminal: node server.js
- URL para lanzar una petición: http://127.0.0.1:9090/ o http://localhost:9090/
  Significa: "Conéctate al puerto 9090 de tu propia máquina"
- El servidor se detiene pulsando: Ctrl-C
*/

//-- Cargar las dependencias
const socket = require('socket.io');
const http = require('http');
const express = require('express');
const colors = require('colors');

//-- Puerto de escucha del servidor
const PUERTO = 9090;

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
    const username = req.body.username; //-- Extraemos el nombre del usuario del cuerpo
    const usernames = Object.values(users); //-- Obtenemos una lista con los nombres de usuarios
    
    //-- Si el nombre de usuario ya ha sido introducido
    if (usernames.includes(username)) {
        //-- Redirige a la página de home.html pero muestra un error
        return res.redirect('/?error=El nombre de usuario ya está en uso. Por favor, elige otro.');
    } else {
        //-- Si el usuario es válido redirigeme al chat.html
        console.log(`-- Usuario ingresado: ${username.green} --`);  //-- Aparece en verde el nombre del usuario
        res.redirect('/chat.html');
    }
});

//-- Almacena los usuarios conectados
const users = {};

//------------------- GESTION SOCKETS IO
//-- Evento: Nueva conexión recibida
io.on('connection', (socket) => {
    let username;   //-- Variable para almacenar el nombre de usuario

    //-- Evento setUsername
    socket.on('setUsername', (name) => {
        username = name;    //-- El nombre recibido ahora es username
        users[socket.id] = username;    //-- Almacena el nombre de usuario en el objeto users con el id del socket como clave
        socket.emit('message', `¡Bienvenido al chat, ${username}!`);    //-- Envía la usuario que se acaba de conectar un mensaje de bienvenida
        socket.broadcast.emit('message', `${username} se ha unido al chat`);    //-- Al resto se les notifica del nuevo usuario conectado
        io.emit('updateUserList', Object.values(users));    //-- Se actualiza la lista de los usuarios conectados
        console.log(`** NUEVA CONEXIÓN: ${username} **`.yellow);    //-- Nos aparece en amarillo la nueva conexión en la consola
    });

    //-- Evento de desconexión
    socket.on('disconnect', function(){
        if (username) { //-- Comprueba si existe usuario
            delete users[socket.id];    //-- Lo eliminamos del objeto user con el id que es la clave
            io.emit('message', `${username} ha abandonado el chat`);    //-- Se notifica al resto de clientes de la desconexión
            io.emit('updateUserList', Object.values(users));    //-- Se actualiza la lista de los usuarios conectados
            console.log(`** CONEXIÓN TERMINADA: ${username} **`.orange);    //-- En la consola aparece la desconexión en naranja  
        }
    });

    //-- Mensaje recibido: Reenviarlo a todos los clientes conectados
    socket.on("message", (msg) => {
        //-- Si el mensaje es /help, /list, /hello y /date solo se manda la respuesta al cliente que lo ha solicitado
        if (msg.startsWith('/')) {  //-- Verificamos que el mensaje empieza por '/'
            let response;   //-- Se almacena la respuesta
            switch (msg) {
                case '/help':   //-- Si el comando es /help muestra todos los comandos que se pueden usar
                    response = "Comandos soportados: /help, /list, /hello, /date";
                    break;
                case '/list':   //-- Si el comando es /list muestra la lista de usuarios conectados
                    response = `Usuarios conectados: ${Object.values(users).join(', ')}`;
                    break;
                case '/hello':  //-- Si es hello, saluda al usuario
                    response = `¡Hola, ${username}! Bienvenido al chat!`;
                    break;
                case '/date':   //-- Si es /date, muestra la fecha actual
                    response = `Fecha y hora actual: ${new Date()}`;
                    break;
                default:    //-- Si introduce un comando barra lo que sea diferente manda este aviso
                    response = "Comando no reconocido. Escribe /help para ver la lista de comandos disponibles.";
                    break;
            }
            socket.emit('message', response);   //-- La respuesta se envía al cliente que lo envío con .emit
        } else {
            // Si es un mensaje sin la barra
            console.log("Mensaje Recibido!: " + msg.blue);
            io.emit('message', `${username}: ${msg}`);  //-- Envíalo a todos poniéndo el nombre de usuario antes y luego el mensaje enviado
        }
    });

    //-- Emitimos el mensaje de escribiendo a todos, si para también
    socket.on('typing', () => {
        socket.broadcast.emit('typing', username);
    });

    socket.on('stopTyping', () => {
        socket.broadcast.emit('stopTyping', username);
    });
});

//-- Lanzar el servidor HTTP
//-- ¡Que empiecen los juegos de los WebSockets!
server.listen(PUERTO);
console.log("Escuchando en puerto: " + PUERTO);
