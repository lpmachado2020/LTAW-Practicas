//-- En esta versión no hemos establecido ninguna política de seguridad de contenidos.
//-- Entonces, si se accede al Toggle Developer Tools nos aparece un error

//-- Cargar el módulo de electron
const electron = require('electron');

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
        width: 600,  //-- Anchura 
        height: 400  //-- Altura
    });

  //-- Cargar interfaz gráfica en HTML
  win.loadFile("index.html");
});