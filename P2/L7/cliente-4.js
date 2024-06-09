console.log("Ejecutando Javascript...");

//-- Elementos HTML para mostrar información
const display = document.getElementById("display");

//-- Caja de búsqueda
const search_box = document.getElementById("search-box");

//-- Retrollamada del botón de Ver productos
search_box.oninput = () => {
    //-- Crear objeto para hacer peticiones AJAX
    const m = new XMLHttpRequest();

    //-- Función de callback que se invoca cuando hay cambios de estado en la petición
    m.onreadystatechange = () => {
        //-- Petición enviada y recibida. Todo OK!
        if (m.readyState == 4) {
            //-- Solo la procesamos si la respuesta es correcta
            if (m.status == 200) {
                //-- La respuesta es un objeto JSON
                let productos = JSON.parse(m.responseText);

                console.log(productos);

                //-- Borrar el resultado anterior
                display.innerHTML = "";

                //-- Recorrer los productos del objeto JSON
                for (let i = 0; i < productos.length; i++) {
                    //-- Añadir cada producto al párrafo de visualización
                    let producto = productos[i];
                    display.innerHTML += producto.nombre;

                    //-- Separamos los productos por una coma
                    if (i < productos.length - 1) {
                        display.innerHTML += ', ';
                    }
                }
            } else {
                //-- Hay un error en la petición
                //-- Lo notificamos en la consola y en la propia web
                console.log("Error en la petición: " + m.status + " " + m.statusText);
                display.innerHTML += '<p>ERROR</p>';
            }
        }
    };

    console.log(search_box.value.length);

    //-- La petición se realiza solo si hay al menos 1 carácter
    if (search_box.value.length >= 1) {
        //-- Configurar la petición
        m.open("GET", "/buscar?param1=" + search_box.value, true);

        //-- Enviar la petición!
        m.send();
    } else {
        display.innerHTML = "";
    }
};
