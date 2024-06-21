const electron = require('electron');

console.log("Hola desde el proceso de la web...");

//-- Obtener elementos de la interfaz
const btn_test = document.getElementById("btn_test");
const display = document.getElementById("display");
const info1 = document.getElementById("info1");
const info2 = document.getElementById("info2");
const info3 = document.getElementById("info3");
const users = document.getElementById('lista_usuarios');
const ip = document.getElementById('ip');
// const print = document.getElementById("print");

//-- Acceder a la API de node para obtener la info
//-- Sólo es posible si nos han dado permisos desde
//-- el proceso princpal
info1.textContent = process.versions.node;
info2.textContent = process.versions.chrome;
info3.textContent = process.versions.electron;


//-- Botón de prueba mensaje del servidor a los clientes
btn_test.onclick = () => {
    console.log("Botón prueba!");
    //-- Enviar mensaje al proceso principal
    electron.ipcRenderer.invoke('test', "Mensaje de prueba del servidor!!!");
    display.innerHTML += "Mensaje de prueba del servidor!!!";
}

// //-- Mensaje recibido del proceso MAIN --> Server.js
// electron.ipcRenderer.on('print', (event, message) => {
//     console.log("Recibido: " + message);
//     print.textContent = message;
//   });

//-- Mensaje recibido del proceso Main --> Server.js
//-- Recibimos el número de usuarios conectados
electron.ipcRenderer.on('lista_usuarios', (event, message) => {
    console.log("Recibido: " + message);
    users.textContent = message;
});

//-- Mensaje recibido del proceso Main --> Server.js
//-- Recibimos la dirección ip
electron.ipcRenderer.on('ip', (event, message) => {
    console.log("Recibido: " + message);
    ip.textContent = message;
});

//-- Botón de mensaje de prueba que envía el servidor a todos los clientes

//-- Evento recibido del proceso principal con los mensajes de los clientes
electron.ipcRenderer.on('message', (event, message) => {
    display.innerHTML += '<p>' + message + '</p>';
});