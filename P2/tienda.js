//-- Servidor tienda.js

/*
Activar servidor en el terminal: node tienda.js
URL para lanzar una petición: http://127.0.0.1:9090/ o http://localhost:9090/
Significa: "Conéctate al puerto 9090 de tu propia máquina"
Usando curl se mandan peticiones desde línea de comandos
curl -m 1 127.0.0.1:9090
El servidor se detiene pulsando: Ctrl-C
*/

//-- Importar módulos de Node.js
const http = require('http');
const fs = require('fs');
const path = require('path');

//-- Puerto de escucha del servidor
const PUERTO = 9090;

// Rutas de los archivos index, error y carpetas
const RUTA_INDEX = path.join(__dirname, 'ficheros', 'index.html');
const RUTA_ERROR = path.join(__dirname, 'ficheros', 'error.html');
const RUTA_LOGIN = path.join(__dirname, 'ficheros', 'login.html');
const CARPETA_FICHEROS = path.join(__dirname, 'ficheros');
const CARPETA_IMAGENES = path.join(__dirname, 'imagenes');
const CARPETA_ESTILO = path.join(__dirname, 'estilo');
const CARPETA_JS = path.join(__dirname, 'js');
const RUTA_TIENDA_JSON = path.join(__dirname, 'tienda.json');

//-- HTML de la página de respuesta LOGIN
const RUTA_LOGIN_ERROR = path.join(__dirname, 'ficheros', 'login-error.html');
const RUTA_SINGUP = path.join(__dirname, 'ficheros', 'registro.html');

//-- Leer el fichero JSON y creación de la estructura tienda a partir del contenido del fichero
const  tienda_json = fs.readFileSync(RUTA_TIENDA_JSON);
const tienda = JSON.parse(tienda_json);
const productos = tienda.productos;
const usuarios = tienda.usuarios;

// Función para servir archivos estáticos de manera asíncrona
function servirArchivo(res, rutaArchivo, contentType) {
    fs.readFile(rutaArchivo, (err, contenido) => {
        // Si hay un error al leer el archivo
        if (err) {
            res.writeHead(404);
            res.end();
        // Sino envía el código de éxito 200 y el tipo MIME correspondiente
        } else {
            res.writeHead(200, {'Content-Type': contentType});
            res.end(contenido, 'utf-8');
        }
    });
}

// Función para servir archivos estáticos de manera síncrona
function servirArchivoSync(res, rutaArchivo, contentType, textoHTMLExtra) {
    try {
        let contenido = fs.readFileSync(rutaArchivo, 'utf8');

        // Reemplazar el texto "HTML_EXTRA" con el textoHTMLExtra
        const nuevoContenido = contenido.replace('HTML_EXTRA', textoHTMLExtra);
        
        // Servir la página con el texto reemplazado
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(nuevoContenido, 'utf-8');
    } catch (err) {
        console.error(`Error al leer el archivo ${rutaArchivo}:`, err);
        res.writeHead(500);
        res.end();
    }
}

// Función para generar la lista de archivos donde se encuentra la página principal
function listarArchivosHTML(res) {
    fs.readdir(CARPETA_FICHEROS, (err, files) => {
        if (err) {
            console.error('Error al leer el directorio:', err);
            res.writeHead(500);
            res.end();
        } else {
            const html = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta http-equiv="X-UA-Compatible" content="IE=edge">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Lista de archivos</title>
                </head>
                <body>
                    <h1>Archivos en la carpeta principal:</h1>
                    <ul>
                        ${files.map(file => `<li>${file}</li>`).join('')}
                    </ul>
                </body>
                </html>
            `;
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(html);
        }
    });
}

// Función para generar la lista de productos desde el archivo tienda.json
function mostrarProductos(res) {
    const disponibles = [];
    const noDisponibles = [];

    productos.forEach(producto => {
        if (producto.stock > 0) {
            disponibles.push(producto);
        } else {
            noDisponibles.push(producto);
        }
    });

    const htmlProductos = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Productos disponibles</title>
        </head>
        <body>
            <h1>Productos disponibles:</h1>
            <ul>
                ${disponibles.map(producto => `<li>${producto.nombre} - Stock: ${producto.stock}</li>`).join('')}
            </ul>
            <h1>Productos no disponibles:</h1>
            <ul>
                ${noDisponibles.map(producto => `<li>${producto.nombre} - Stock: ${producto.stock}</li>`).join('')}
            </ul>
        </body>
        </html>
    `;
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(htmlProductos);
}


//-- Creación del servidor
const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://' + req.headers['host']);
    const extension = path.extname(url.pathname);

    if (url.pathname == '/login') {
        //-- Leer los parámetros de inicio de sesión
        let username = url.searchParams.get('username');
        let password = url.searchParams.get('password');
        console.log("\n---- LOG IN ----");
        console.log("  Username: " + username);
        console.log("  Password: " + password);
        console.log();

        let usuarioEncontrado = false;

        usuarios.forEach(usuario => {
            //-- Si el usuario y la contraseña coinciden
            if (usuario.usuario === username && usuario.contraseña === password) {

                // Añadir el campo 'user' a la cookie de respuesta
                res.setHeader('Set-Cookie', `user=${username}; SameSite=None`);
                // Agregar el nombre de usuario al texto extra
                textoHTMLExtra = `<li class="nav-menu-item"><a href="perfil.html" class="nav-menu-link nav-link">${username}</a></li>`;
                
                servirArchivoSync(res, RUTA_INDEX, 'text/html', textoHTMLExtra);
                usuarioEncontrado = true;
            //-- Si el usuario coincide, pero no la contraseña
            } else if (usuario.usuario === username && usuario.contraseña != password) {
                textoHTMLExtra = `<p>¡Contraseña incorrecta!</p><p>Introduzca una contraseña válida</p>`;

                servirArchivoSync(res, RUTA_LOGIN_ERROR, 'text/html', textoHTMLExtra);
                usuarioEncontrado = true;
            }
        });

        //-- Si el usuario no está en la base de datos
        if (!usuarioEncontrado) {
            textoHTMLExtra = `<p>Usuario no encontrado. Por favor, regístrese.</p>`;

            servirArchivoSync(res, RUTA_SINGUP, 'text/html', textoHTMLExtra);
        }

    // Si la URL es /registrar, manejar la solicitud de registro
    } else if (url.pathname === '/registrar' && req.method === 'POST') {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString(); // Convertir el buffer a cadena
        });
        
        req.on('end', () => {
            // Parsear los datos del formulario
            const formData = new URLSearchParams(body);
            const username = formData.get('username');
            const name = formData.get('name');
            const email = formData.get('email');
            const password = formData.get('password');

            // Validar si el nombre de usuario ya existe
            const usuarioExistente = usuarios.find(usuario => usuario.usuario === username);
            if (usuarioExistente) {
                // Redirigir a la página de error de nombre de usuario existente
                // res.writeHead(302, {'Location': '/registro-error.html?mensaje=El%20nombre%20de%20usuario%20ya%20existe'});
                // return res.end();
                textoHTMLExtra = `<p>Nombre de usuario existente</p><p>Introduzca un nombre de usuario diferente</p>`;

                servirArchivoSync(res, RUTA_SINGUP, 'text/html', textoHTMLExtra);
                return res.end();
            }

            // Validar si el correo electrónico ya existe
            const emailExistente = usuarios.find(usuario => usuario.correo === email);
            if (emailExistente) {
                // Redirigir a la página de error de correo electrónico existente
                // res.writeHead(302, {'Location': '/registro-error.html?mensaje=El%20correo%20electr%C3%B3nico%20ya%20existe'});
                // return res.end();
                textoHTMLExtra = `<p>Correo electrónico existente.</p><p>Introduzca una dirección diferente</p>`;

                servirArchivoSync(res, RUTA_SINGUP, 'text/html', textoHTMLExtra);
                return res.end();
            }

            // Validar si el correo electrónico es válido
            const emailValido = /\S+@\S+\.\S+/.test(email);
            if (!emailValido) {
                // Redirigir a la página de error de correo electrónico inválido
                // res.writeHead(302, {'Location': '/registro-error.html?mensaje=El%20correo%20electr%C3%B3nico%20no%20es%20v%C3%A1lido'});
                // return res.end();
                textoHTMLExtra = `<p>Correo electrónico no válido</p>`;

                servirArchivoSync(res, RUTA_SINGUP, 'text/html', textoHTMLExtra);
                return res.end();
            }
            
            // Crear un nuevo objeto de usuario
            const nuevoUsuario = {
                usuario: username,
                nombre: name,
                correo: email,
                contraseña: password
            };
            
            // Agregar el nuevo usuario al arreglo de usuarios
            usuarios.push(nuevoUsuario);
            
            // Guardar la lista actualizada de usuarios en el archivo tienda.json
            fs.writeFile(RUTA_TIENDA_JSON, JSON.stringify(tienda, null, 2), (err) => {
                if (err) {
                    console.error('Error al escribir en el archivo tienda.json:', err);
                    res.writeHead(500);
                    res.end();
                } else {
                    // Redirigir al usuario a una página index.html
                    res.writeHead(302, {'Location': '/registro-exitoso.html'});
                    res.end();
                }
            });
        });

    // Si la URL es /finalizar_compra, manejar la solicitud de finalizar compra
    } else if (url.pathname === '/finalizar_compra' && req.method === 'GET') {
        let direccion = url.searchParams.get('direccion');
        let tarjeta = url.searchParams.get('tarjeta');

            // Crear un nuevo objeto de pedido
            const nuevoPedido = {
                usuario: "prueba",
                direccion: direccion,
                tarjeta: tarjeta,
                lista_productos: ["prueba"]  // Tiene que ser una lista
            };

            // Agregar el nuevo pedido al arreglo de pedidos en la tienda
            tienda.pedidos.push(nuevoPedido);

            // Guardar la lista actualizada de pedidos en el archivo tienda.json
            fs.writeFile(RUTA_TIENDA_JSON, JSON.stringify(tienda, null, 2), (err) => {
                if (err) {
                    console.error('Error al escribir en el archivo tienda.json:', err);
                    res.writeHead(500);
                    res.end();
                } else {
                    // Redirigir al usuario a una página de confirmación de compra exitosa
                    res.writeHead(302, {'Location': '/compra-exitosa.html'});
                    res.end();
                }
            });
        
    //-- Si la URL es la raíz del sitio
    } else if (url.pathname === '/') {
        console.log("Petición main");
        
        // Verificar si existe la cookie "user" y tiene un valor
        const cookie = req.headers.cookie;
        const usuarioAutenticado = cookie && cookie.includes('user=');

        // Definir el texto a reemplazar en la página index.html
        let textoHTMLExtra = '';
        if (usuarioAutenticado) {
            // Obtener el nombre de usuario de la cookie
            const username = cookie.split('=')[1];
            // Agregar el nombre de usuario al texto extra
            textoHTMLExtra = `<li class="nav-menu-item"><a href="perfil.html" class="nav-menu-link nav-link">${username}</a></li>`;
        } else {
            // Si el usuario no está autenticado, mostrar el enlace al login
            textoHTMLExtra = '<li class="nav-menu-item"><a href="login.html" class="nav-menu-link nav-link">Log In</a></li>';
        }

        servirArchivoSync(res, RUTA_INDEX, 'text/html', textoHTMLExtra);
    
    // Si la URL es /ls, mostrar la lista de archivos en la carpeta principal
    } else if (url.pathname === '/ls') {
        console.log("Petición listado de archivos");
        listarArchivosHTML(res);
    // Si la URL es /productos, mostrar la lista de productos disponibles
    } else if (url.pathname === '/productos') {
        console.log("Petición listado de productos");
        mostrarProductos(res);
    
    // Si la extensión es .html, servir desde la carpeta ficheros/...
    } else if (extension === '.html') {
        console.log("Petición recursos");
        servirArchivo(res, path.join(__dirname, 'ficheros', url.pathname), 'text/html');
    // Si la extensión es .css, servir desde la carpeta estilo/...
    } else if (extension === '.css') {
        console.log("Petición estilo .css");
        servirArchivo(res, path.join(CARPETA_ESTILO, path.basename(url.pathname)), 'text/css');
    // Si la extensión es .jpg, servir desde la carpeta imagenes/...
    } else if (extension === '.jpg') {
        console.log("Petición imágenes .jpg");
        servirArchivo(res, path.join(CARPETA_IMAGENES, path.basename(url.pathname)), 'image/jpg');
    // Si la extensión es .png, servir desde la carpeta imagenes/...
    } else if (extension === '.png') {
        console.log("Petición imágenes .png");
        servirArchivo(res, path.join(CARPETA_IMAGENES, path.basename(url.pathname)), 'image/png');
    // Si la extensión es .js, servir desde la carpeta js/...
    } else if (extension === '.js') {
        console.log("Petición javascript");
        servirArchivo(res, path.join(CARPETA_JS, path.basename(url.pathname)), 'text/javascript');
    
        // En cualquier otro caso sirve la página de error
    } else {
        console.log("Página error");
        servirArchivo(res, RUTA_ERROR, 'text/html');
    }
});
  
//-- Activar el servidor: ¡Que empiece la fiesta!
server.listen(PUERTO);
console.log("Server activado!. Escuchando en puerto: " + PUERTO);
