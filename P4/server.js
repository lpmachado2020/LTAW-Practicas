//-- Servidor server.js

/*
- Activar servidor en el terminal: npm start
- El servidor se detiene pulsando: Ctrl-C
*/

//-- Cargar las dependencias
const socket = require('socket.io');
const http = require('http');
const express = require('express');
const colors = require('colors');
const electron = require('electron');   //-- Cargar el módulo de electron
const ip = require('ip');   //-- Cargar el módulo de ip

//-- Puerto
const PUERTO = 9090;

//-- Dirección del chat
const dirección_ip = `${ip.address()}:${PUERTO}`;

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
    const usernames = Object.values(users);
    
    if (usernames.includes(username)) {
        return res.redirect('/?error=El nombre de usuario ya está en uso. Por favor, elige otro.');
    } else {
        console.log(`-- Usuario ingresado: ${username.green} --`);
        res.redirect('/chat.html');
    }
});

// Almacenar usuarios conectados
const users = {};

let count = 0;

//------------------- GESTION SOCKETS IO
//-- Evento: Nueva conexión recibida
io.on('connection', (socket) => {
    let username;

    count++;

    // Enviar el conteo actualizado al proceso de renderizado
    if (win) {
        win.webContents.send('lista_usuarios', count);
    }

    console.log("Contador 1", count);
    socket.on('setUsername', (name) => {
        username = name;
        users[socket.id] = username;
        socket.emit('message', `¡Bienvenido al chat, ${username}!`);
        socket.broadcast.emit('message', `${username} se ha unido al chat`);
        io.emit('updateUserList', Object.values(users));
        console.log(`** NUEVA CONEXIÓN: ${username} **`.yellow);

        
    });

    //-- Evento de desconexión
    socket.on('disconnect', function(){
        if (username) {
            count--;

            // Enviar el conteo actualizado al proceso de renderizado
            if (win) {
                win.webContents.send('lista_usuarios', count);
            }
            console.log("Contador 2", count);
            delete users[socket.id];
            io.emit('message', `${username} ha abandonado el chat`);
            io.emit('updateUserList', Object.values(users));
            console.log(`** CONEXIÓN TERMINADA: ${username} **`.yellow);
            
        }
    });

    //-- Mensaje recibido: Reenviarlo a todos los clientes conectados y al proceso de renderizado
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
                    response = "Comando no reconocido. Escribe /help para ver la lista de comandos disponibles.";
                    break;
            }
            socket.emit('message', response);
        } else {
            // Es un mensaje normal
            console.log("Mensaje Recibido!: " + msg.blue);
            const completeMessage = `${username}: ${msg}`;
            io.emit('message', completeMessage);
            if (win) {
                win.webContents.send('message', completeMessage); // Enviar mensaje al proceso de renderizado
            }
        }
    });

    //-- Emitimos el mensaje de escribiendo a todos
    socket.on('typing', () => {
        socket.broadcast.emit('typing', username);
    });

    socket.on('stopTyping', () => {
        socket.broadcast.emit('stopTyping', username);
    });
});


//------------------- ELECTRÓN
console.log("Arrancando electron...");

//-- Variable para acceder a la ventana principal
//-- Se pone aquí para que sea global al módulo principal
let win = null;

//-- Punto de entrada. En cuanto electron está listo,
//-- ejecuta esta función
electron.app.on('ready', () => {
    console.log("Evento Ready!");

    //-- Crear la ventana principal de nuestra aplicación
    win = new electron.BrowserWindow({
        width: 600,   //-- Anchura 
        height: 600,  //-- Altura

        //-- Permitir que la ventana tenga ACCESO AL SISTEMA
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    //-- En la parte superior se nos ha creado el menu
    //-- por defecto
    //-- Si lo queremos quitar, hay que añadir esta línea
    win.setMenuBarVisibility(false)

    //-- Cargar contenido web en la ventana
    //-- La ventana es en realidad.... ¡un navegador!
    //win.loadURL('https://www.urjc.es/etsit');

    //-- Cargar interfaz gráfica en HTML
    win.loadFile("public/index.html");

    //-- Esperar a que la página se cargue y se muestre
    //-- y luego enviar el mensaje al proceso de renderizado para que 
    //-- lo saque por la interfaz gráfica
    win.on('ready-to-show', () => {
        // win.webContents.send('print', "MENSAJE ENVIADO DESDE PROCESO MAIN");
        win.webContents.send('lista_usuarios', count);
        win.webContents.send('ip', dirección_ip);
    });

    //-- Enviar un mensaje al proceso de renderizado para que lo saque
    //-- por la interfaz gráfica
    // win.webContents.send('print', "MENSAJE ENVIADO DESDE PROCESO MAIN");
    // win.webContents.send('lista_usuarios', count);
});

// //-- Esperar a recibir los mensajes de botón apretado (Test) del proceso de 
// //-- renderizado. Al recibirlos se escribe una cadena en la consola
// electron.ipcMain.handle('test', (event, msg) => {
//     console.log("-> Mensaje: " + msg);
//     io.send(message);   //-- Mensaje desde el servidor a todos los clientes
// });

//-- Esperar a recibir los mensajes de botón apretado (Test) del proceso de 
//-- renderizado. Al recibirlos se escribe una cadena en la consola
electron.ipcMain.handle('test', (event, message) => {
    console.log("-> Mensaje: " + message);
    io.send(message);   //-- Mensaje desde el servidor a todos los clientes
});

//-- Lanzar el servidor HTTP
//-- ¡Que empiecen los juegos de los WebSockets!
server.listen(PUERTO);
console.log("Escuchando en puerto: " + PUERTO);
