const electron = require('electron');

console.log("Hola desde el proceso de la web...");

//-- Obtener elementos de la interfaz
const btn_test = document.getElementById("btn_test");
const display = document.getElementById("display");
const version_node = document.getElementById("info1");
const version_chrome = document.getElementById("info2");
const version_electron = document.getElementById("info3");
const info4 = document.getElementById("info4");
const info5 = document.getElementById("info5");
const info6 = document.getElementById("info6");
const users = document.getElementById('lista_usuarios');
const ip = document.getElementById('ip');

//-- Acceder a la API de node para obtener la info
//-- Sólo es posible si nos han dado permisos desde
//-- el proceso princpal
version_node.textContent = process.versions.node;
version_chrome.textContent = process.versions.chrome;
version_electron.textContent = process.versions.electron;

info4.textContent = process.arch;
info5.textContent = process.platform;
info6.textContent = process.cwd();

//-- Botón de prueba mensaje del servidor a los clientes
btn_test.onclick = () => {
    console.log("Botón prueba!");
    //-- Enviar mensaje al proceso principal
    electron.ipcRenderer.invoke('test', "Mensaje de prueba del servidor!!!");
    display.innerHTML += "<p>Mensaje de prueba del servidor!!!</p>";
}

//-- Mensaje recibido del proceso Main --> Server.js
//-- Recibimos el número de usuarios conectados
electron.ipcRenderer.on('lista_usuarios', (event, message) => {
    console.log("Recibido: " + message);
    users.textContent = message;
});

//-- Recibimos la dirección ip
electron.ipcRenderer.on('ip', (event, message) => {
    console.log("Recibido: " + message);
    ip.textContent = message;
});

//-- Evento recibido del proceso principal con los mensajes de los clientes
electron.ipcRenderer.on('message', (event, message) => {
    display.innerHTML += '<p>' + message + '</p>';
});