//-- Este es el archivo js en la parte del cliente
console.log("Ejecutando Javascript del index...");

//-- Maneja el presionar el botón añadir producto
function agregarAlCarrito(producto) {
    window.location.href = `/agregar_carrito?producto=${producto}`;
}