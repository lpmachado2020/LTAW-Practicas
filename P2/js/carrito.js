//-- Archivo js para manejar el funcionamiento de la página carrito.html

function modificarCarrito(producto, accion) {
    fetch(`/actualizar_carrito?producto=${producto}&accion=${accion}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                location.reload();
            }
        });
}
