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

//-- Manejar la solicitud POST del formulario de inicio de sesión
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

//-- Almacenar usuarios conectados
const users = {};

//-- Contador de los usuarios conectados
let count = 0;

//------------------- GESTION SOCKETS IO
//-- Evento: Nueva conexión recibida
io.on('connection', (socket) => {
    let username;

    //-- Aumento en una unidad del contador por la nueva conexción
    count++;

    //-- Enviar el conteo actualizado al proceso de renderizado
    if (win) {
        win.webContents.send('lista_usuarios', count);
    }

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
        if (username) {

            //-- Decremento en una unidad del contador por la desconexción
            count--;

            //-- Enviar el conteo actualizado al proceso de renderizado
            if (win) {
                win.webContents.send('lista_usuarios', count);
            }

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
                    response = `¡Hola, ${username}! Bienvenido/a al chat!`;
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
            //-- Si es un mensaje sin la barra
            console.log("Mensaje Recibido!: " + msg.blue);
            io.emit('message', `${username}: ${msg}`);  //-- Envíalo a todos poniéndo el nombre de usuario antes y luego el mensaje enviado
            
            if (win) {
                win.webContents.send('message', `${username}: ${msg}`); //-- Enviar mensaje al proceso de renderizado
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
        width: 1000,   //-- Anchura 
        height: 750,  //-- Altura

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
});

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
