console.log("Ejecutando Javascript de la búsqueda...");

//-- Elementos HTML para mostrar información
const display = document.getElementById("display");

//-- Caja de búsqueda
const search_box = document.getElementById("search-box");

//-- Retrollamada del botón de Ver productos
search_box.oninput = () => {
    console.log(search_box.value.length);

    //-- La petición se realiza solo si hay al menos 1 carácter
    if (search_box.value.length >= 1) {
        //-- Procesar los resultados de la búsqueda
        fetch('/buscar?param1=' + search_box.value)
            .then(response => response.text())
            .then(htmlResponse => {
                // Insertar los resultados de la búsqueda en el elemento "display"
                display.innerHTML = htmlResponse;
            })
            .catch(error => {
                console.error('Error en la búsqueda:', error);
                display.innerHTML = '<p>ERROR</p>';
            });
    } else {
        display.innerHTML = "";
    }
};
