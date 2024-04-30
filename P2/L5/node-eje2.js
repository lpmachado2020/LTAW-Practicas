//-- Ejercicio 2. L5
// Créate un fichero inicial tienda.json que contenga al menos 3 productos, dos usuarios y un pedido. 
// Haz un programa en node.js que abra este fichero y muestre la siguiente información:
// Número de usuarios registrados en la tienda
// Listado con los nombres de los usuarios
// Número de productos en la tienda
// Listado de los productos de la tienda
// Número de pedidos pendientes, y los detalles del pedido

const fs = require('fs');

//-- Nombre del fichero JSON a leer
const FICHERO_JSON = "tienda-eje2.json"

//-- Leer el fichero JSON
const  tienda_json = fs.readFileSync(FICHERO_JSON);

//-- Crear la estructura tienda a partir del contenido del fichero
const tienda = JSON.parse(tienda_json);

//------ Mostrar informacion sobre la tienda:
console.log("\n---- Informacion sobre la tienda ----\n");

//-- Número de usuarios registrados en la tienda
console.log("Número de usuarios registrados en la tienda: " + tienda.usuarios.length);

//-- Listado con los nombres de los usuarios
console.log("\nListado de nombres de los usuarios:");
tienda.usuarios.forEach(usuario => {
    console.log(usuario.nombre);
});

//-- Número de productos en la tienda
console.log("\nNúmero de productos en la tienda: " + tienda.productos.length);

//-- Listado de los productos de la tienda
console.log("Listado de los productos de la tienda:");
tienda.productos.forEach(producto => {
    console.log(producto.nombre);
});

//-- Número de pedidos pendientes, y los detalles del pedido
console.log("\nNúmero de pedidos pendientes: " + tienda.pedidos.length);
console.log("Detalles del pedido:");
tienda.pedidos.forEach(pedido =>{
    console.log("Nombre de usuario: " + pedido.usuario);
    console.log("Dirección de envío: " + pedido.direccion);
    console.log("Número de tarjeta: " + pedido.tarjeta);
    console.log("Lista de productos: ");
    pedido.lista_productos.forEach(id_product => {
        console.log("- " + id_product)
    })
});

console.log("\n---- Fin informacion sobre la tienda ----\n");

//-- También podemos hacer la operación inversa: pasar una variable a formato JSON. 
//-- Se hace con el método: JSON.stringify(variable)