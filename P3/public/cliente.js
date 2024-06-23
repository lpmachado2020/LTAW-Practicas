//-- Archivo cliente.js

//-- Elementos del interfaz
const display = document.getElementById("display");
const msg_entry = document.getElementById("msg_entry");
const sound_notification = document.getElementById("sound-notification");
const user_list = document.getElementById("user_list");
const typingDisplay = document.getElementById("typingDisplay");

//-- Crear un websocket. Se establece la conexión con el servidor
const socket = io();

let typingTimeout;  //-- Variable que controla el tiempo de escribiendo

socket.on("connect", () => {
    const username = localStorage.getItem('username');  //-- Al conectarse guardamos el username
    if (username) {
      socket.emit('setUsername', username); //-- Se lo enviamos al servidor
    }
});


socket.on("message", (msg) => {
  // Detectar si el mensaje es del servidor y debe ser más claro
  let msgClass = 'message';
  if (msg.includes('Comandos soportados') || msg.includes('Usuarios conectados') || msg.includes('¡Hola,') || msg.includes('Fecha y hora actual') || msg.includes('Comando no reconocido')) {
      msgClass = 'server-message';
  }

  display.innerHTML += `<p class="${msgClass}">${msg}</p>`; //-- Muestra el mensaje recibido con la clase correspondiente
  sound_notification.play();  // Reproducir el sonido cuando se recibe un mensaje
});

socket.on("updateUserList", (users) => {
    user_list.innerHTML = `${users.join(', ')}`;  //-- Actualiza la lista de los usuarios conectados
});

//-- Escuchamos los eventos de escribiendo y su parada para actualizar el estado
socket.on('typing', (username) => {
    typingDisplay.innerHTML = `${username} está escribiendo...`;  //-- Añadimos el texto en el typing display
    //-- Establecemos un temporizador la duración del mensaje de escribiendo
    clearTimeout(typingTimeout);  //-- Elimina el temporizador si ya exisitía y vuelve a empezar de cero
    typingTimeout = setTimeout(() => {
        typingDisplay.innerHTML = '';
    }, 3000); //-- Pasados los 3 segundos borra el mensaje de alguien está escribiendo
});

socket.on('stopTyping', (username) => {
    typingDisplay.innerHTML = ''; //-- Cuando deja de escribir vacía el campo
});

msg_entry.addEventListener('input', () => { //-- Si alguien escribe algo el evento se activa
    socket.emit('typing');  //-- Se envía el evento al servidor
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        socket.emit('stopTyping');  //-- Si pasado un segundo no se está escribiendo se para el mensaje de que alguien está escribiedno
    }, 1000);
});

//-- Al apretar el botón se envía un mensaje al servidor
msg_entry.onchange = () => {
    if (msg_entry.value) {
      socket.send(msg_entry.value); //-- Al hacer enter se envía el mensaje
    }
    
    //-- Borrar el mensaje actual de la caja donde se escribe
    msg_entry.value = "";
}
