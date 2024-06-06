//-- Este es el archivo js en la parte del cliente
console.log("Ejecutando Javascript...");

//-- Maneja el presionar el botón añadir producto
function agregarAlCarrito(producto) {
    window.location.href = `/agregar_carrito?producto=${producto}`;
}

// //------------------------------------ Buscador ------------------------------------ //
// //-- Elementos HTML para mostrar informacion
// const display = document.getElementById("display");

// //-- Caja de busqueda
// const searchBox = document.getElementById("search-box");

// //-- Retrollamada del boton de Ver productos
// searchBox.oninput = () => {

//     //-- Crear objeto para hacer peticiones AJAX
//     const m = new XMLHttpRequest();

//     //-- Función de callback que se invoca cuando
//     //-- hay cambios de estado en la petición
//     m.onreadystatechange = () => {

//         //-- Petición enviada y recibida. Todo OK!
//         if (m.readyState==4) {

//             //-- Solo la procesamos si la respuesta es correcta
//             if (m.status==200) {

//                 //-- La respuesta es un objeto JSON
//                 let productos = JSON.parse(m.responseText)

//                 console.log(productos);

//                 //-- Borrar el resultado anterior
//                 display.innerHTML = "";

//                 //--Recorrer los productos del objeto JSON
//                 for (let i=0; i < productos.length; i++) {

//                     //-- Añadir cada producto al párrafo de visualización
//                     display.innerHTML += productos[i];

//                     //-- Separamos los productos por ',''
//                     if (i < productos.length-1) {
//                     display.innerHTML += ', ';
//                     }
//                 }

//             } else {
//                 //-- Hay un error en la petición
//                 //-- Lo notificamos en la consola y en la propia web
//                 console.log("Error en la petición: " + m.status + " " + m.statusText);
//                 display2.innerHTML += '<p>ERROR</p>'
//             }
//         }
//     }

//     console.log(searchBox.value.length);

//     //-- La peticion se realia solo si hay al menos 1 carácter
//     if (searchBox.value.length >= 1) {

//       //-- Configurar la petición
//       m.open("GET","/productos?param1=" + searchBox.value, true);

//       //-- Enviar la petición!
//       m.send();
      
//     } else {
//         display.innerHTML="";
//     }
// }
