//-- Servidor tienda.js

/*
- Activar servidor en el terminal: node tienda.js
- URL para lanzar una petición: http://127.0.0.1:9090/ o http://localhost:9090/
  Significa: "Conéctate al puerto 9090 de tu propia máquina"
- Usando curl se mandan peticiones desde línea de comandos: curl -m 1 127.0.0.1:9090
- El servidor se detiene pulsando: Ctrl-C
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
const RUTA_CARRITO = path.join(__dirname, 'ficheros', 'carrito.html');
const CARPETA_FICHEROS = path.join(__dirname, 'ficheros');
const CARPETA_IMAGENES = path.join(__dirname, 'imagenes');
const CARPETA_ESTILO = path.join(__dirname, 'estilo');
const CARPETA_JS = path.join(__dirname, 'js');
const RUTA_TIENDA_JSON = path.join(__dirname, 'tienda.json');

//-- HTML de la página de respuesta LOGIN
const RUTA_LOGIN_ERROR = path.join(__dirname, 'ficheros', 'login-error.html');
const RUTA_SINGUP_ERROR = path.join(__dirname, 'ficheros', 'registro-error.html');

//-- Leer el fichero JSON y creación de la estructura tienda a partir del contenido del fichero
const  tienda_json = fs.readFileSync(RUTA_TIENDA_JSON);
const tienda = JSON.parse(tienda_json);
const productos = tienda.productos;
const usuarios = tienda.usuarios;


//---------------------------------------- Funciones ----------------------------------------//
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
function replaceTexto(res, rutaArchivo, contentType, textoReemplazo, textoHTMLExtra) {
    try {
        let contenido = fs.readFileSync(rutaArchivo, 'utf8');

        // Reemplazar el texto "HTML_EXTRA" con el textoHTMLExtra
        const nuevoContenido = contenido.replace(textoReemplazo, textoHTMLExtra);
        
        // Servir la página con el texto reemplazado
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(nuevoContenido, 'utf-8');
    } catch (err) {
        console.error(`Error al leer el archivo ${rutaArchivo}:`, err);
        res.writeHead(500);
        res.end();
    }
}

//-- Analizar la cookie y devolver el nombre del usuario y el carrito si existen
function get_cookies(req) {
    //-- Leer la Cookie recibida
    const cookie = req.headers.cookie;
  
    //-- Inicializar las variables para el usuario y el carrito
    let user = null;
    let carrito = null;

    //-- Hay cookie
    if (cookie) {
        //-- Obtener un array con todos los pares nombre-valor
        let pares = cookie.split(";");
        
        //-- Recorrer todos los pares nombre-valor
        pares.forEach(element => {
            //-- Obtener los nombres y valores por separado
            let [nombre, valor] = element.split('=');
  
            // //-- Leer el usuario
            // //-- Solo si el nombre es 'user'
            // if (nombre.trim() === 'user') {
            //     user = valor;
            // }

            // //-- Leer el carrito
            // //-- Solo si el nombre es 'carrito'
            // if (nombre.trim() === 'carrito') {
            //     carrito = valor;
            // }
            if (nombre.trim() === 'user') {
                user = decodeURIComponent(valor.trim());
            }
            if (nombre.trim() === 'carrito') {
                carrito = decodeURIComponent(valor.trim());
            }
        });
    }

    //-- Devolver un objeto con el usuario y el carrito
    return { user, carrito };
}

// Función para manejar la solicitud de añadir al carrito
function productosCarrito(req, res) {
    const cookieData = get_cookies(req);
    const username = cookieData.user;
    let carrito = cookieData.carrito || '';

    // Si no está autenticado, redirigir al login
    if (!username) {
        res.writeHead(302, {'Location': '/login.html'});
        res.end();
        return;
    }

    const url = new URL(req.url, 'http://' + req.headers['host']);
    const producto = url.searchParams.get('producto');

    // Añadir el producto al carrito
    carrito = carrito ? `${carrito}:${producto}` : producto;

    // Establecer la cookie del carrito
    res.setHeader('Set-Cookie', `carrito=${encodeURIComponent(carrito)}; Path=/; charset=utf-8; SameSite=None`);
    console.log("Carrito al agregar producto:", carrito);

    // Encontrar el usuario y agregar el producto al carrito
    let usuarioEncontrado = false;
    usuarios.forEach(usuario => {
        if (usuario.usuario === username) {
            //-- Si no tiene el campo carrito lo crea
            if (!usuario.carrito) {
                usuario.carrito = [];
            }
            //-- Añade el producto al carrito
            usuario.carrito.push(producto);
            usuarioEncontrado = true;
        }
    });

    //-- Si encuentra el usuario
    if (usuarioEncontrado) {
        // Guardar la lista actualizada de usuarios en el archivo tienda.json
        fs.writeFile(RUTA_TIENDA_JSON, JSON.stringify(tienda, null, 2), 'utf-8',(err) => {
            if (err) {
                console.error('Error al escribir en el archivo tienda.json:', err);
                res.writeHead(500);
                res.end();
            } else {
                res.writeHead(302, {'Location': '/'});
                res.end();
            }
        });
    } else {
        res.writeHead(400, {'Content-Type': 'text/plain'});
        res.end('Usuario no encontrado');
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


//---------------------------------------- Creación del servidor ----------------------------------------//
const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://' + req.headers['host']);
    const extension = path.extname(url.pathname);

    //-- Si la URL es /logout, manejar el log out eliminando las cookies de user y carrito
    if (url.pathname === '/logout') {
        res.setHeader('Set-Cookie', ['user=; Max-Age=0; SameSite=None; Path=/', 'carrito=; Max-Age=0; charset=utf-8; SameSite=None; Path=/']);
        res.writeHead(302, { 'Location': '/' });
        res.end();
    //-- Si la URL es /agregar_carrito, manejar añadir un producto a la cookie carrito desde el cliente
    } else if (url.pathname === '/agregar_carrito') {
        productosCarrito(req, res);
    //-- Si la URL es /login, manejar la solicitud de log in
    } else if (url.pathname == '/login') {
        console.log("Petición de login")
        //-- Leer los parámetros de inicio de sesión
        let username = url.searchParams.get('username');
        let password = url.searchParams.get('password');

        let usuarioEncontrado = false;

        usuarios.forEach(usuario => {
            //-- Si el usuario y la contraseña coinciden
            if (usuario.usuario === username && usuario.contraseña === password) {

                // Obtener el carrito del usuario
                let carritoUsuario = usuario.carrito ? usuario.carrito.join(':') : '';

                // Añadir el campo 'user' a la cookie de respuesta
                res.setHeader('Set-Cookie', [`user=${encodeURIComponent(username)}; SameSite=None`, `carrito=${encodeURIComponent(carritoUsuario)}; Path=/; charset=utf-8; SameSite=None`]);
                console.log("Carrito en finalizar compra:", carritoUsuario);
                
                // Agregar el nombre de usuario y el botón de log out al texto extra
                textoHTMLExtra = `<li class="nav-menu-item"><a href="perfil.html" class="nav-menu-link nav-link">${username}</a></li>
                                <li class="nav-menu-item"><a href="/logout" class="nav-menu-link nav-link">Log out</a></li>`;
                
                replaceTexto(res, RUTA_INDEX, 'text/html', 'HTML_EXTRA', textoHTMLExtra);
                usuarioEncontrado = true;
            //-- Si el usuario coincide, pero no la contraseña
            } else if (usuario.usuario === username && usuario.contraseña != password) {
                textoHTMLExtra = `<p>¡Contraseña incorrecta!</p><p>Introduzca una contraseña válida</p>`;

                replaceTexto(res, RUTA_LOGIN_ERROR, 'text/html', 'AVISO', textoHTMLExtra);
                usuarioEncontrado = true;
            }
        });

        //-- Si el usuario no está en la base de datos
        if (!usuarioEncontrado) {
            textoHTMLExtra = `<p>Usuario no encontrado. Por favor, regístrese.</p>`;
            replaceTexto(res, RUTA_SINGUP_ERROR, 'text/html', 'AVISO', textoHTMLExtra);
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

            // Validar si todos los campos están completos
            if (!username || !name || !email || !password) {
                // Redirigir a la página de error de campos faltantes
                textoHTMLExtra = `<p>Faltan campos por rellenar. Por favor, complete todos los campos.</p>`;
                replaceTexto(res, RUTA_SINGUP_ERROR, 'text/html', 'AVISO', textoHTMLExtra);
                return res.end();
            }

            // Validar si el nombre de usuario ya existe
            const usuarioExistente = usuarios.find(usuario => usuario.usuario === username);
            if (usuarioExistente) {
                // Redirigir a la página de error de nombre de usuario existente
                textoHTMLExtra = `<p>Nombre de usuario existente</p><p>Introduzca un nombre de usuario diferente</p>`;
                replaceTexto(res, RUTA_SINGUP_ERROR, 'text/html', 'AVISO', textoHTMLExtra);
                return res.end();
            }

            // Validar si el correo electrónico ya existe
            const emailExistente = usuarios.find(usuario => usuario.correo === email);
            if (emailExistente) {
                // Redirigir a la página de error de correo electrónico existente
                textoHTMLExtra = `<p>Correo electrónico existente.</p><p>Introduzca una dirección diferente</p>`;
                replaceTexto(res, RUTA_SINGUP_ERROR, 'text/html', 'AVISO', textoHTMLExtra);
                return res.end();
            }

            // Validar si el correo electrónico es válido
            const emailValido = /\S+@\S+\.\S+/.test(email);
            if (!emailValido) {
                // Redirigir a la página de error de correo electrónico inválido
                textoHTMLExtra = `<p>Correo electrónico no válido</p>`;
                replaceTexto(res, RUTA_SINGUP_ERROR, 'text/html', 'AVISO', textoHTMLExtra);
                return res.end();
            }
            
            // Crear un nuevo objeto de usuario
            const nuevoUsuario = {
                usuario: username,
                nombre: name,
                correo: email,
                contraseña: password,
                carrito: []
            };
            
            // Agregar el nuevo usuario al arreglo de usuarios
            usuarios.push(nuevoUsuario);
            
            // Guardar la lista actualizada de usuarios en el archivo tienda.json
            fs.writeFile(RUTA_TIENDA_JSON, JSON.stringify(tienda, null, 2), 'utf-8',(err) => {
                if (err) {
                    console.error('Error al escribir en el archivo tienda.json:', err);
                    res.writeHead(500);
                    res.end();
                } else {
                    // Redirigir al usuario a una página index.html
                    // Añadir el campo 'user' a la cookie de respuesta
                    res.setHeader('Set-Cookie', `user=${username}; charset=utf-8; SameSite=None`);
                    // Agregar el nombre de usuario y el botón de log out al texto extra
                    textoHTMLExtra = `<li class="nav-menu-item"><a href="perfil.html" class="nav-menu-link nav-link">${username}</a></li>
                                    <li class="nav-menu-item"><a href="/logout" class="nav-menu-link nav-link">Log out</a></li>`;
                    
                    replaceTexto(res, RUTA_INDEX, 'text/html', 'HTML_EXTRA', textoHTMLExtra);
                    res.end();
                }
            });
        });

    // Si la URL es /finalizar_compra, manejar la solicitud de finalizar compra
    } else if (url.pathname === '/finalizar_compra' && req.method === 'GET') {
        console.log("Compra finalizada")
        let direccion = url.searchParams.get('direccion');
        let tarjeta = url.searchParams.get('tarjeta');

        //-- Obtenemos las cookies
        const cookieData = get_cookies(req);
        const user = cookieData.user;
        let carrito = cookieData.carrito;

        if (carrito) {
            const carritoUsuario = carrito.split(':');
            console.log("Carrito en finalizar compra:", carritoUsuario);

            // Crear un nuevo objeto de pedido
            const nuevoPedido = {
                usuario: user,
                direccion: direccion,
                tarjeta: tarjeta,
                lista_productos: carritoUsuario
            };

            // Agregar el nuevo pedido al arreglo de pedidos en la tienda
            tienda.pedidos.push(nuevoPedido);

            // Guardar la lista actualizada de pedidos en el archivo tienda.json
            fs.writeFile(RUTA_TIENDA_JSON, JSON.stringify(tienda, null, 2), 'utf-8', (err) => {
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
        }

    //-- Si la URL es la raíz del sitio
    } else if (url.pathname === '/') {
        console.log("Petición main");

        //-- Obtenemos las cookies
        const cookieData = get_cookies(req);
        const user = cookieData.user;

        if (user) {
            // Agregar el nombre de usuario y el botón de log out al texto extra
            textoHTMLExtra = `<li class="nav-menu-item"><a href="perfil.html" class="nav-menu-link nav-link">${user}</a></li>
                            <li class="nav-menu-item"><a href="/logout" class="nav-menu-link nav-link">Log out</a></li>`;
        } else {
            // Si el usuario no está autenticado, mostrar el enlace al login
            textoHTMLExtra = '<li class="nav-menu-item"><a href="login.html" class="nav-menu-link nav-link">Log In</a></li>';
        }

        replaceTexto(res, RUTA_INDEX, 'text/html', 'HTML_EXTRA', textoHTMLExtra);
    
    // Si la URL es /ls, mostrar la lista de archivos en la carpeta principal
    } else if (url.pathname === '/ls') {
        console.log("Petición listado de archivos");
        listarArchivosHTML(res);
    // Si la URL es /productos, mostrar la lista de productos disponibles
    } else if (url.pathname === '/productos') {
        console.log("Petición listado de productos");
        mostrarProductos(res);
    
    //-- Si la URL es la raíz del sitio
    } else if (url.pathname === '/carrito') {
        console.log("Petición carrito");

        //-- Obtenemos las cookies
        const cookieData = get_cookies(req);
        const user = cookieData.user;

        // Si no está autenticado, redirigir al index
        if (!user) {
            res.writeHead(302, {'Location': '/index.html'});
            res.end();
            return;
        }

        // Agregar el nombre de usuario y el botón de log out al texto extra
        textoHTMLExtra = `<li class="nav-menu-item"><a href="perfil.html" class="nav-menu-link nav-link">${user}</a></li>
                        <li class="nav-menu-item"><a href="/logout" class="nav-menu-link nav-link">Log out</a></li>`;

        replaceTexto(res, RUTA_CARRITO, 'text/html', 'HTML_EXTRA', textoHTMLExtra);

    // Si la extensión es .html, servir desde la carpeta ficheros/...
    } else if (extension === '.html') {
        console.log("Petición recursos");

        //-- Obtenemos las cookies
        const cookieData = get_cookies(req);
        const user = cookieData.user;

        if (user) {
            // Agregar el nombre de usuario y el botón de log out al texto extra
            textoHTMLExtra = `<li class="nav-menu-item"><a href="perfil.html" class="nav-menu-link nav-link">${user}</a></li>
                            <li class="nav-menu-item"><a href="/logout" class="nav-menu-link nav-link">Log out</a></li>`;
        } else {
            // Si el usuario no está autenticado, mostrar el enlace al login
            textoHTMLExtra = '<li class="nav-menu-item"><a href="login.html" class="nav-menu-link nav-link">Log In</a></li>';
        }

        replaceTexto(res, path.join(__dirname, 'ficheros', url.pathname), 'text/html', 'HTML_EXTRA', textoHTMLExtra);

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
