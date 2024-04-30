//-- Ejercicio 3. L5
// Incrementa el stock de todos los productos en 1 unidad
// Guarda el resultado en el fichero tienda.json.

const fs = require('fs');

//-- Nombre del fichero JSON a leer
const FICHERO_JSON = "tienda-eje3.json"

//-- Nombre del fichero JSON de salida
const FICHERO_JSON_OUT = "tienda-eje3-modificado.json"

//-- Leer el fichero JSON
const  tienda_json = fs.readFileSync(FICHERO_JSON);

//-- Crear la estructura tienda a partir del contenido del fichero
const tienda = JSON.parse(tienda_json);

//------ Mostrar informacion sobre la tienda:
console.log("\n---- Informacion sobre el stock de la tienda SIN incremento ----\n")

tienda.productos.forEach(producto => {
    console.log("Stock del producto " + producto.nombre + ": " + producto.stock);
});

// Incrementa el stock de todos los productos en 1 unidad
tienda.productos.forEach(producto =>{
    producto.stock += 1;
});

// Guarda el resultado en el fichero tienda.json
//-- Convertir la variable a cadena JSON
let myJSON = JSON.stringify(tienda);

//-- Guardarla en el fichero destino
fs.writeFileSync(FICHERO_JSON_OUT, myJSON);

console.log("\n---- Informacion sobre el stock de la tienda CON incremento ----\n")

tienda.productos.forEach(producto => {
    console.log("Stock del producto " + producto.nombre + ": " + producto.stock);
});

console.log("\n---- Fin informacion sobre el stock la tienda ----\n")

//-- También podemos hacer la operación inversa: pasar una variable a formato JSON. 
//-- Se hace con el método: JSON.stringify(variable)