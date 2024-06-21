//-- Elementos del interfaz
const display = document.getElementById("display");
const msg_entry = document.getElementById("msg_entry");
const sound_notification = document.getElementById("sound-notification");

//-- Crear un websocket. Se establece la conexión con el servidor
const socket = io();

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

//-- Al apretar el botón se envía un mensaje al servidor
msg_entry.onchange = () => {
    if (msg_entry.value) {
      socket.send(msg_entry.value);
    }
    
    //-- Borrar el mensaje actual
    msg_entry.value = "";
}
