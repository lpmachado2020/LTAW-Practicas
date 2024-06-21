//-- Elementos del interfaz
const display = document.getElementById("display");
const msg_entry = document.getElementById("msg_entry");
const sound_notification = document.getElementById("sound-notification");
const user_list = document.getElementById("user_list");
const typingDisplay = document.getElementById("typingDisplay");

//-- Crear un websocket. Se establece la conexión con el servidor
const socket = io();

let typingTimeout;

socket.on("connect", () => {
    const username = localStorage.getItem('username');
    if (username) {
      socket.emit('setUsername', username);
    }
});

socket.on("message", (msg) => {
    display.innerHTML += '<p style="color:blue">' + msg + '</p>';
    sound_notification.play();  // Reproducir el sonido cuando se recibe un mensaje
});

socket.on("updateUserList", (users) => {
    user_list.innerHTML = `${users.join(', ')}`;
});

//-- Escuchamos los eventos de escribiendo y su parada para actualizar el estado
socket.on('typing', (username) => {
    typingDisplay.innerHTML = `${username} está escribiendo...`;
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        typingDisplay.innerHTML = '';
    }, 3000);
});

socket.on('stopTyping', (username) => {
    typingDisplay.innerHTML = ''; //-- Cuando deja de escribir vacía el campo
});

msg_entry.addEventListener('input', () => {
    socket.emit('typing');
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        socket.emit('stopTyping');
    }, 1000); //-- Dejamos un minuto el mensaje de escribiendo, si para de escribir deja de enviar el mensaje
});


//-- Al apretar el botón se envía un mensaje al servidor
msg_entry.onchange = () => {
    if (msg_entry.value) {
      socket.send(msg_entry.value);
    }
    
    //-- Borrar el mensaje actual
    msg_entry.value = "";
}
