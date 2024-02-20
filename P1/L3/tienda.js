//-- Servidor

//-- URL para lanzar una petición: http://127.0.0.1:8080/
//-- Significa: "Conéctate al puerto 8080 de tu propia máquina"

//-- Usando curl se mandan peticiones desde línea de comandos
//-- url -m 1 127.0.0.1:8080

//-- El servidor se detiene pulsando: Ctrl-C


const http = require('http');

//-- Definir el puerto a utilizar
const PUERTO = 9090;

//-- Crear el servidor
const server = http.createServer((req, res) => {
    
  //-- Indicamos que se ha recibido una petición
  console.log("Petición recibida!");

  //-- Cabecera que indica el tipo de datos del cuerpo de la respuesta: HTML
  res.setHeader('Content-Type', 'text/html');

  //-- Mensaje del cuerpo
  res.write(`
  <!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- Enlaces a tus scripts de JavaScript aquí -->
</head>
<body>

    <header>
        <h1>Tienda</h1>
        <!-- Barra de navegación -->
        <nav>
            <ul>
                <li><a href="#">Inicio</a></li>
                <li><a href="#">Productos</a></li>
                <li><a href="#">Carrito</a></li>
                <li><a href="#">Contacto</a></li>
            </ul>
        </nav>
    </header>

    <main>
        <!-- Contenido principal de tu tienda, como productos, categorías, etc. -->
    </main>

    <footer>
        <!-- Pie de página con información adicional y enlaces útiles -->
        <p>&copy; 2024 Tienda</p>
    </footer>
</body>
</html>
`);

  //-- Terminar la respuesta y enviarla
  res.end();

});

//-- Activar el servidor: ¡Que empiece la fiesta!
server.listen(PUERTO);

console.log("Servidor activado. Escuchando en puerto: " + PUERTO);