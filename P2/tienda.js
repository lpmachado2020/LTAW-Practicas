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

//-- Rutas de los archivos index, error y carpetas
const RUTA_INDEX = path.join(__dirname, 'ficheros', 'index.html');
const RUTA_ERROR = path.join(__dirname, 'ficheros', 'error.html');
const RUTA_CARRITO = path.join(__dirname, 'ficheros', 'carrito.html');
const RUTA_COMPRA = path.join(__dirname, 'ficheros', 'finalizar_compra.html');
const RUTA_PRODUCTO = path.join(__dirname, 'ficheros', 'producto.html');
const RUTA_PERFIL = path.join(__dirname, 'ficheros', 'perfil.html');
const RUTA_COMPRA_EXITOSA  = path.join(__dirname, 'ficheros', 'compra-exitosa.html');
const CARPETA_FICHEROS = path.join(__dirname, 'ficheros');
const CARPETA_IMAGENES = path.join(__dirname, 'imagenes');
const CARPETA_ESTILO = path.join(__dirname, 'estilo');
const CARPETA_JS = path.join(__dirname, 'js');
const CLIENTE_JS = path.join(__dirname, 'js', 'busqueda.js');
const RUTA_TIENDA_JSON = path.join(__dirname, 'tienda.json');

//-- HTML de la página de respuesta LOGIN
const RUTA_LOGIN = path.join(__dirname, 'ficheros', 'login.html');
const RUTA_SIGNUP = path.join(__dirname, 'ficheros', 'registro.html');

//-- Leer el fichero JSON y creación de la estructura tienda a partir del contenido del fichero
const  tienda_json = fs.readFileSync(RUTA_TIENDA_JSON);
const tienda = JSON.parse(tienda_json);
let productos = tienda.productos;
const usuarios = tienda.usuarios;
const pedidos = tienda.pedidos;

//---------------------------------------- Funciones ----------------------------------------//
//-- Función para servir archivos estáticos de manera asíncrona
function servirArchivo(res, rutaArchivo, contentType) {
    fs.readFile(rutaArchivo, (err, contenido) => {
        //-- Si hay un error al leer el archivo
        if (err) {
            res.writeHead(404);
            res.end();
        //-- Sino envía el código de éxito 200 y el tipo MIME correspondiente
        } else {
            res.writeHead(200, {'Content-Type': contentType});
            res.end(contenido, 'utf-8');
        }
    });
}

//-- Función para reemplazar texto en cualquier caso
function replaceTexto(res, rutaArchivo, contentType, textoReemplazo, textoHTMLExtra) {
    try {
        let contenido = fs.readFileSync(rutaArchivo, 'utf8');

        //-- Reemplazar texto con el textoHTMLExtra
        const nuevoContenido = contenido.replace(textoReemplazo, textoHTMLExtra);
        
        //-- Servir la página con el texto reemplazado
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(nuevoContenido, 'utf-8');
    } catch (err) {
        console.error(`Error al leer el archivo ${rutaArchivo}:`, err);
        res.writeHead(500);
        res.end();
    }
}

//-- Función que maneja la actualización del stock y la validación de stock
function procesoPedido(carrito) {
    let stockSuficiente = true;
    let productosSinStock = [];

    //-- Comprobar el stock de cada producto en el carrito
    carrito.forEach(item => {
        let producto = productos.find(p => p.nombre === item);
        if (producto && producto.stock <= 0) {
            stockSuficiente = false;
            //-- Se utiliza para comunicar qué producto está agotado cuando se accede al carrito
            productosSinStock.push(item); //-- Agregar el producto sin stock a la lista
        }
    });

    //-- Si hay stock suficiente, reducir el stock de cada producto
    if (stockSuficiente) {
        carrito.forEach(item => {
            let producto = productos.find(p => p.nombre === item);
            if (producto) {
                producto.stock -= 1;
            }
        });

        //-- Guardar los cambios en el archivo tienda.json
        fs.writeFile(RUTA_TIENDA_JSON, JSON.stringify(tienda, null, 2), 'utf-8', (err) => {
            if (err) {
                console.error('Error al actualizar el stock en tienda.json:', err);
            }
        });
    }

    //-- Retornar el resultado del proceso y la lista de productos sin stock
    return {
        success: stockSuficiente,
        productosSinStock: productosSinStock
    };
}


//-- Función que añaliza las cookies y devuelve el nombre del usuario y el carrito si existen
function getCookies(req) {
    //-- Leer la Cookie recibida
    const cookie = req.headers.cookie;
  
    //-- Inicializar las variables para el usuario y el carrito
    //-- Si no existe carrito o user se devuelve null
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
  
            //-- Leer el usuario
            //-- Solo si el nombre es 'user'
            if (nombre.trim() === 'user') {
                user = decodeURIComponent(valor.trim());
            }

            //-- Leer el carrito
            //-- Solo si el nombre es 'carrito'
            if (nombre.trim() === 'carrito') {
                carrito = decodeURIComponent(valor.trim());
            }
        });
    }
    //-- Devolver un objeto con el usuario y el carrito
    return { user, carrito };
}

//-- Función para manejar la solicitud de añadir al carrito
function productosCarrito(req, res) {
    const cookieData = getCookies(req);
    const username = cookieData.user;
    let carrito = cookieData.carrito || '';

    //-- Si no está autenticado, redirigir al login
    if (!username) {
        res.writeHead(302, {'Location': '/login.html'});
        res.end();
        return;
    }

    const url = new URL(req.url, 'http://' + req.headers['host']);
    const producto = url.searchParams.get('producto');

    //-- Añadir el producto al carrito
    carrito = carrito ? `${carrito}:${producto}` : producto;

    //-- Establecer la cookie del carrito
    res.setHeader('Set-Cookie', `carrito=${encodeURIComponent(carrito)}; Path=/; charset=utf-8; SameSite=None`);

    //-- Encontrar el usuario y agregar el producto al carrito
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
        //-- Guardar la lista actualizada de usuarios en el archivo tienda.json
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

//-- Función para generar la lista de archivos donde se encuentra la página principal
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

//-- Función para generar la lista de productos desde el archivo tienda.json
function mostrarProductos(res) {
    const disponibles = [];
    const noDisponibles = [];

    //-- Separa los productos si tiene o no stock
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

//-- Función para obtener y mostrar el carrito
function mostrarCarrito(req, res, avisoError) {
    const cookieData = getCookies(req);
    const username = cookieData.user;
    const carrito = cookieData.carrito ? cookieData.carrito.split(':') : [];

    if (!username) {
        res.writeHead(302, { 'Location': '/login.html' });
        res.end();
        return;
    }

    //-- Si el carrito está vacío, mostrar un aviso
    if (carrito.length === 0) {
        const avisoHTML = `<p>El carrito está vacío.</p>`;
        fs.readFile(RUTA_CARRITO, 'utf8', (err, data) => {
            if (err) {
                res.status(500).send('Error al leer el archivo HTML');
                return;
            }

            //-- Reemplazar el marcador de posición con el aviso de carrito vacío
            let updatedHTML = data.replace('<!-- HTML_EXTRA -->', `<li class="nav-menu-item"><a href="perfil.html" class="nav-menu-link nav-link">${username}</a></li>
                        <li class="nav-menu-item"><a href="/logout" class="nav-menu-link nav-link">Log out</a></li>`);
            updatedHTML = updatedHTML.replace('<!-- PRODUCTOS -->', avisoHTML);
            
            //-- Enviar la respuesta
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(updatedHTML);
        });
        return;
    }

    //-- Crear un array único de productos
    const productosUnicos = [...new Set(carrito)];

    //-- Generar el contenido del carrito
    const carritoHTML = productosUnicos.map(producto => {
        //-- Contar cuántas veces aparece cada producto en el carrito
        const cantidad = carrito.filter(item => item === producto).length;

        //-- Crear el HTML para cada producto con su cantidad y los botones de añadir y eliminar
        return `
            <li>
                ${cantidad} x ${producto} 
                <button onclick="modificarCarrito('${producto}', 'add')">+</button>
                <button onclick="modificarCarrito('${producto}', 'remove')">-</button>
            </li>`;
    }).join(''); //-- Unir todos los elementos del array resultante en una sola cadena

    //-- Leer la carrito.html
    fs.readFile(RUTA_CARRITO, 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error al leer el archivo HTML');
            return;
        }

        textoHTMLExtra = `<li class="nav-menu-item"><a href="perfil.html" class="nav-menu-link nav-link">${username}</a></li>
                        <li class="nav-menu-item"><a href="/logout" class="nav-menu-link nav-link">Log out</a></li>`;

        //-- Reemplazar el marcador de posición con el HTML del carrito
        let updatedHTML = data.replace('<!-- HTML_EXTRA -->', textoHTMLExtra);
        updatedHTML = updatedHTML.replace('<!-- PRODUCTOS -->', carritoHTML);
        updatedHTML = updatedHTML.replace('<!-- AVISO -->', avisoError);
        
        //-- Enviar la respuesta
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(updatedHTML);
    });
}

//-- Función para actualizar el carrito
function actualizarCarrito(req, res) {
    const cookieData = getCookies(req);
    const username = cookieData.user;
    let carrito = cookieData.carrito ? cookieData.carrito.split(':') : [];

    if (!username) {
        res.writeHead(302, { 'Location': '/login.html' });
        res.end();
        return;
    }

    const url = new URL(req.url, 'http://' + req.headers['host']);
    const producto = url.searchParams.get('producto');
    const accion = url.searchParams.get('accion');

    if (accion === 'add') {
        carrito.push(producto);
    } else if (accion === 'remove') {
        const index = carrito.indexOf(producto);
        if (index > -1) {
            carrito.splice(index, 1);
        }
    }

    const nuevoCarrito = carrito.join(':');
    res.setHeader('Set-Cookie', `carrito=${encodeURIComponent(nuevoCarrito)}; Path=/; charset=utf-8; SameSite=None`);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
}

//-- Función para verificar si el carrito está vacío y si hay suficiente stock de los productos
function verificarCarritoYStock(req, res) {
    const cookieData = getCookies(req);
    const user = cookieData.user;
    const carrito = cookieData.carrito ? cookieData.carrito.split(':') : [];

    //-- Leer el contenido de carrito.html
    fs.readFile(RUTA_CARRITO, 'utf8', (err, data) => {
        if (err) {
            res.writeHead(500);
            res.end('Error interno del servidor');
            return;
        }

        //-- Reemplazar el marcador <!-- HTML_EXTRA --> si hay un usuario registrado
        let nuevoContenido = data;
        if (user) {
            nuevoContenido = nuevoContenido.replace('<!-- HTML_EXTRA -->', `
                <li class="nav-menu-item"><a href="perfil.html" class="nav-menu-link nav-link">${user}</a></li>
                <li class="nav-menu-item"><a href="/logout" class="nav-menu-link nav-link">Log out</a></li>
            `);
        }

        //-- Verificar si el carrito está vacío
        if (carrito.length === 0) {
            const avisoError = '<p>El carrito está vacío, no puedes finalizar la compra.</p>';
            nuevoContenido = nuevoContenido.replace('<!-- AVISO -->', avisoError);
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(nuevoContenido);
            return;
        }

        //-- Verificar si hay suficiente stock para cada producto en el carrito
        for (let item of carrito) {
            let producto = productos.find(p => p.nombre === item);
            if (producto && producto.stock <= 0) {
                //-- Mostrar aviso de falta de stock y los productos del carrito
                mostrarCarrito(req, res, `<p>El producto ${item} no tiene suficiente stock.</p>`);
                return false;
            }
        }

        //-- Si todo está bien, servir la página de finalizar_compra.html
        fs.readFile(RUTA_COMPRA, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error interno del servidor');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
    });
}

//-- Función para servir la página del producto con los datos del producto
function servirProducto(req, res, idProducto) {
    const producto = productos.find(p => p.id === idProducto);

    //-- Obtener las cookies
    const cookieData = getCookies(req);
    const user = cookieData.user;

    //-- Si no hay producto redirige a la página de error
    if (!producto) {
        servirArchivo(res, RUTA_ERROR, 'text/html');
        return;
    }

    //-- Leemos el fichero producto.html
    fs.readFile(RUTA_PRODUCTO, 'utf8', (err, contenido) => {
        if (err) {
            res.writeHead(500);
            res.end();
            return;
        }

        //-- Si se lee correctamente, se añaden los datos del producto seleccionado
        let nuevoContenido = contenido
            .replace(/<!-- NOMBRE_PRODUCTO -->/g, producto.nombre)
            .replace(/<!-- DESCRIPCION_PRODUCTO -->/g, producto.descripcion)
            .replace(/<!-- UNIDADES_PRODUCTO -->/g, producto.unidades)
            .replace(/<!-- PRECIO_PRODUCTO -->/g, producto.precio)
            .replace(/<!-- STOCK_PRODUCTO -->/g, producto.stock)
            .replace(/FOTO_PRODUCTO/g, producto.foto)
            .replace(/NOMBRE PRODUCTO/g, producto.nombre)
            .replace(/'PRODUCTO'/g, `'${producto.nombre}'`);

            //-- Reemplazar el marcador <!-- HTML_EXTRA --> si hay un usuario registrado
        if (user) {
            nuevoContenido = nuevoContenido.replace('<!-- HTML_EXTRA -->', `
                <li class="nav-menu-item"><a href="perfil.html" class="nav-menu-link nav-link">${user}</a></li>
                <li class="nav-menu-item"><a href="/logout" class="nav-menu-link nav-link">Log out</a></li>
            `);
        }

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(nuevoContenido, 'utf-8');
    });
}

//---------------------------------------- Creación del servidor ----------------------------------------//
const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://' + req.headers['host']);
    const extension = path.extname(url.pathname);

    console.log("Petición recibida:", url.pathname);

    //-- Si se solicita un producto
    if (url.pathname.startsWith('/producto') && extension === '.html') {
        //-- Comprobamos que la url tiene la estructura de productoN.html
        const match = url.pathname.match(/\/producto(\d+)\.html/);
        //-- Si coincide, se extrae el número N del producto
        if (match) {
            const idProducto = parseInt(match[1], 10);
            servirProducto(req, res, idProducto);
        } else {
            servirArchivo(res, RUTA_ERROR, 'text/html');
        }

    //-- Petición de búsqueda de productos
    } else if (url.pathname === '/buscar') {
        // Lee los parámetros de búsqueda de la URL
        let param1 = url.searchParams.get('param1');
        param1 = param1.toUpperCase();

        // Verifica si el parámetro tiene al menos 3 caracteres
        if (param1.length >= 3) {
            console.log("Param: " + param1);

            // Filtra los productos basados en el parámetro de búsqueda
            let result = productos.filter(prod => prod.nombre.toUpperCase().includes(param1));

            // Construye una página HTML con los resultados de la búsqueda
            let htmlResponse = '';
            result.forEach(producto => {
                htmlResponse += `<p><a href="/producto${producto.id}.html">${producto.nombre}</a></p>`;
            });

            // Envía la página HTML como respuesta
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(htmlResponse);
        } else {
            // Respuesta vacía si la longitud del parámetro es menor a 3 caracteres
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end('<p>Escribe al menos 3 caracteres para buscar.</p>');
        }

    //-- Petición de busqueda.js que usa el cliente en el navegador
    } else if (url.pathname === '/js/busqueda.js') {
        //-- Lee el fichero javascript
        fs.readFile(CLIENTE_JS, 'utf-8', (err, data) => {
            if (err) {
                console.log("Error: " + err);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'text/html');
                res.write(RUTA_ERROR);
            } else {
                res.setHeader('Content-Type', 'application/javascript');
                res.write(data);
            }
            res.end();
        });
    
    //-- Si la URL es /logout, manejar el log out eliminando las cookies de user y carrito
    } else if (url.pathname === '/logout') {
        res.setHeader('Set-Cookie', ['user=; Max-Age=0; SameSite=None; Path=/', 'carrito=; Max-Age=0; charset=utf-8; SameSite=None; Path=/']);
        res.writeHead(302, { 'Location': '/' });
        res.end();

    //-- Si la URL es /agregar_carrito, manejar añadir un producto
    } else if (url.pathname === '/agregar_carrito') {
        productosCarrito(req, res);

    //-- Si la URL es /login, manejar la solicitud de log in
    } else if (url.pathname == '/login') {

        //-- Leer los parámetros de inicio de sesión
        let username = url.searchParams.get('username');
        let password = url.searchParams.get('password');

        let usuarioEncontrado = false;
        
        //-- Recorremos los usuarios de la base de datos
        usuarios.forEach(usuario => {
            //-- Si el usuario y la contraseña coinciden
            if (usuario.usuario === username && usuario.contraseña === password) {

                //-- Obtener el carrito del usuario
                let carritoUsuario = usuario.carrito ? usuario.carrito.join(':') : '';

                //-- Añadir el campo 'user' y 'carrito' a la cookie de respuesta
                res.setHeader('Set-Cookie', [`user=${encodeURIComponent(username)}; SameSite=None`, `carrito=${encodeURIComponent(carritoUsuario)}; Path=/; charset=utf-8; SameSite=None`]);
                
                //-- Agregar el nombre de usuario y el botón de log out al texto extra
                textoHTMLExtra = `<li class="nav-menu-item"><a href="perfil.html" class="nav-menu-link nav-link">${username}</a></li>
                                <li class="nav-menu-item"><a href="/logout" class="nav-menu-link nav-link">Log out</a></li>`;
                
                replaceTexto(res, RUTA_INDEX, 'text/html', '<!-- HTML_EXTRA -->', textoHTMLExtra);
                usuarioEncontrado = true;
            //-- Si el usuario coincide, pero no la contraseña
            } else if (usuario.usuario === username && usuario.contraseña != password) {
                //-- Añade un aviso indicando que la contraseña no es válida
                textoHTMLExtra = `<p>¡Contraseña incorrecta! Introduzca una contraseña válida</p>`;

                replaceTexto(res, RUTA_LOGIN, 'text/html', '<!-- AVISO -->', textoHTMLExtra);
                usuarioEncontrado = true;
            }
        });

        //-- Si el usuario no está en la base de datos
        if (!usuarioEncontrado) {
            //-- Añade un aviso y redirige a la página de registro
            textoHTMLExtra = `<p>Usuario no encontrado. Por favor, regístrese.</p>`;
            replaceTexto(res, RUTA_SIGNUP, 'text/html', '<!-- AVISO -->', textoHTMLExtra);
        }

    //-- Si la URL es /registrar, manejar la solicitud de registro
    } else if (url.pathname === '/registrar' && req.method === 'POST') {
        let body = '';
        
        //-- Los datos vienen en el cuerpo
        req.on('data', chunk => {
            body += chunk.toString(); //-- Convertir el buffer a cadena
        });
        
        req.on('end', () => {
            //-- Parsear los datos del formulario
            const formData = new URLSearchParams(body);
            const username = formData.get('username');
            const name = formData.get('name');
            const email = formData.get('email');
            const password = formData.get('password');

            let mensajeError = '';

            //-- Validar si todos los campos están completos
            if (!username || !name || !email || !password) {
                mensajeError += `<p>Faltan campos por rellenar. Por favor, complete todos los campos.</p>`;
            }
    
            //-- Validar si el nombre de usuario ya existe
            const usuarioExistente = usuarios.find(usuario => usuario.usuario === username);
            if (usuarioExistente) {
                mensajeError += `<p>Nombre de usuario existente. Introduzca un nombre de usuario diferente.</p>`;
            }
    
            //-- Validar si el correo electrónico ya existe
            const emailExistente = usuarios.find(usuario => usuario.email === email);
            if (emailExistente) {
                mensajeError += `<p>Correo electrónico existente. Introduzca una dirección diferente.</p>`;
            }
    
            //-- Validar si el correo electrónico es válido
            const emailValido = /\S+@\S+\.\S+/.test(email);
            if (!emailValido) {
                mensajeError += `<p>Correo electrónico no válido.</p>`;
            }
    
            if (mensajeError) {
                replaceTexto(res, RUTA_SIGNUP, 'text/html', '<!-- AVISO -->', mensajeError);
                return;
            }
            
            //-- Si se introducen valores válidos. Crear un nuevo objeto de usuario
            const nuevoUsuario = {
                usuario: username,
                nombre: name,
                correo: email,
                contraseña: password,
                carrito: []
            };
            
            //-- Agregar el nuevo usuario a la base de datos de los usuarios
            usuarios.push(nuevoUsuario);
            
            //-- Guardar la lista actualizada de usuarios en el archivo tienda.json
            fs.writeFile(RUTA_TIENDA_JSON, JSON.stringify(tienda, null, 2), 'utf-8',(err) => {
                if (err) {
                    console.error('Error al escribir en el archivo tienda.json:', err);
                    res.writeHead(500);
                    res.end();
                } else {
                    //-- Redirigir al usuario a una página index.html
                    //-- Añadir el campo 'user' a la cookie de respuesta
                    res.setHeader('Set-Cookie', `user=${username}; charset=utf-8; SameSite=None`);

                    //-- Agregar el nombre de usuario y el botón de log out al texto extra
                    textoHTMLExtra = `<li class="nav-menu-item"><a href="perfil.html" class="nav-menu-link nav-link">${username}</a></li>
                                    <li class="nav-menu-item"><a href="/logout" class="nav-menu-link nav-link">Log out</a></li>`;
                    
                    replaceTexto(res, RUTA_INDEX, 'text/html', '<!-- HTML_EXTRA -->', textoHTMLExtra);
                    res.end();
                }
            });
        });

    //-- Manejo de la solicitud para finalizar_compra.html
    } else if (url.pathname === '/finalizar_compra.html') {
        verificarCarritoYStock(req, res);

    //-- Si la URL es /finalizar_compra, manejar la solicitud de finalizar la compra
    } else if (url.pathname === '/finalizar_compra' && req.method === 'GET') {
        //-- Validar la dirección y la tarjeta de crédito
        let direccion = url.searchParams.get('direccion');
        let tarjeta = url.searchParams.get('tarjeta');

        //-- Eliminar los espacios del número de la tarjeta
        tarjeta = tarjeta.replace(/\s+/g, '');

        let mensajeError = '';

        //-- Validar que la dirección no sea nula
        if (!direccion) {
            mensajeError += '<p>La dirección no puede estar vacía.</p>';
        }

        //-- Validar que la tarjeta tenga 16 dígitos y sea un número
        if (!tarjeta || tarjeta.length !== 16 || isNaN(tarjeta)) {
            mensajeError += '<p>El número de tarjeta debe ser de 16 dígitos numéricos.</p>';
        }

        //-- Si hay errores en la validación, mostrarlos y terminar la respuesta
        if (mensajeError) {
            replaceTexto(res, RUTA_COMPRA, 'text/html', '<!-- AVISO -->', mensajeError);
            res.end();
            return;
        }

        //-- Obtener las cookies
        const cookieData = getCookies(req);
        const user = cookieData.user;
        const carrito = cookieData.carrito ? cookieData.carrito.split(':') : [];

        //-- Verificar stock y procesar pedido
        const resultado = procesoPedido(carrito);

        if (resultado.success) {
            //-- Crear un nuevo objeto de pedido
            const nuevoPedido = {
                usuario: user,
                direccion: direccion,
                tarjeta: tarjeta,
                lista_productos: carrito
            };

            //-- Agregar el nuevo pedido a la base de datos de pedidos
            tienda.pedidos.push(nuevoPedido);

            //-- Guardar la lista actualizada de pedidos en el archivo tienda.json
            fs.writeFile(RUTA_TIENDA_JSON, JSON.stringify(tienda, null, 2), 'utf-8', (err) => {
                if (err) {
                    console.error('Error al escribir en el archivo tienda.json:', err);
                    res.writeHead(500);
                    res.end();
                } else {
                    //-- Vaciar el carrito del usuario en la base de datos
                    const usuarioIndex = tienda.usuarios.findIndex(u => u.nombre === user);
                    if (usuarioIndex !== -1) {
                        tienda.usuarios[usuarioIndex].carrito = [];
                    }

                    //-- Guardar la lista actualizada de usuarios en el archivo tienda.json
                    fs.writeFile(RUTA_TIENDA_JSON, JSON.stringify(tienda, null, 2), 'utf-8', (err) => {
                        if (err) {
                            console.error('Error al escribir en el archivo tienda.json:', err);
                            res.writeHead(500);
                            res.end();
                        } else {
                            //-- Eliminar la cookie del carrito
                            res.setHeader('Set-Cookie', `carrito=; Max-Age=0; charset=utf-8; SameSite=None; Path=/`);
                            
                            // Crear HTML del pedido realizado
                            const pedidoHTML = `
                            <ul>
                                <li><strong>Usuario:</strong> ${user}</li>
                                <li><strong>Dirección de envío:</strong> ${direccion}</li>
                                <li><strong>Productos:</strong>
                                    <ul>
                                        ${carrito.map(producto => `<li>${producto}</li>`).join('')}
                                    </ul>
                                </li>
                            </ul>
                            `;

                            // Leer contenido de compra-exitosa.html
                            fs.readFile(RUTA_COMPRA_EXITOSA, 'utf8', (err, data) => {
                                if (err) {
                                    console.error('Error al leer el archivo compra-exitosa.html:', err);
                                    res.writeHead(500);
                                    res.end();
                                } else {
                                    // Reemplazar el marcador <!-- COMPRA_REALIZADA --> con el HTML del pedido
                                    let nuevoContenido = data.replace('<!-- COMPRA_REALIZADA -->', pedidoHTML);
                                    nuevoContenido = nuevoContenido.replace('<!-- HTML_EXTRA -->', `<li class="nav-menu-item"><a href="perfil.html" class="nav-menu-link nav-link">${user}</a></li>
                                <li class="nav-menu-item"><a href="/logout" class="nav-menu-link nav-link">Log out</a></li>`)

                                    // Enviar la página HTML como respuesta
                                    res.writeHead(200, { 'Content-Type': 'text/html' });
                                    res.end(nuevoContenido);
                                }
                            });
                        }
                    });
                }
            });
        } else {
            //-- Mostrar los productos que no tienen stock suficiente
            const mensajeError = `<p>Los siguientes productos no están disponibles: ${resultado.productosSinStock.join(', ')}</p>`;
            replaceTexto(res, RUTA_COMPRA, 'text/html', '<!-- AVISO -->', mensajeError);
            res.end();
        }

    //-- Si la URL es la raíz del sitio
    } else if (url.pathname === '/') {

        //-- Obtenemos las cookies
        const cookieData = getCookies(req);
        const user = cookieData.user;

        //-- Si hay un usario registrado cambia la barra del navegador
        if (user) {
            //-- Agregar el nombre de usuario y el botón de log out al texto extra
            textoHTMLExtra = `<li class="nav-menu-item"><a href="perfil.html" class="nav-menu-link nav-link">${user}</a></li>
                            <li class="nav-menu-item"><a href="/logout" class="nav-menu-link nav-link">Log out</a></li>`;
        } else {
            //-- Si el usuario no está autenticado, mostrar el enlace al login
            textoHTMLExtra = `<li class="nav-menu-item"><a href="login.html" class="nav-menu-link nav-link">Log In</a></li>
                            <li class="nav-menu-item"><a href="registro.html" class="nav-menu-link nav-link">Sign Up</a></li>`;
        }

        replaceTexto(res, RUTA_INDEX, 'text/html', '<!-- HTML_EXTRA -->', textoHTMLExtra);
    
    //-- Si la URL es /ls, mostrar la lista de archivos en la carpeta principal
    } else if (url.pathname === '/ls') {
        listarArchivosHTML(res);

    //-- Si la URL es /productos, mostrar la lista de productos disponibles
    } else if (url.pathname === '/productos') {
        mostrarProductos(res);
    
    //-- Si la URL es la raíz del sitio
    } else if (url.pathname === '/carrito') {

        //-- Obtener las cookies
        const cookieData = getCookies(req);
        const user = cookieData.user;

        //-- Si no está autenticado, redirigir al login
        if (!user) {
            res.writeHead(302, {'Location': '/login.html'});
            res.end();
            return;
        }

        mostrarCarrito(req, res, '<!-- AVISO -->');

    //-- Ruta para actualizar el carrito
    } else if (url.pathname === '/actualizar_carrito') {
        actualizarCarrito(req, res);

    } else if (url.pathname === '/js/carrito.js') {
        const filePath = path.join(CARPETA_JS, 'carrito.js');
        servirArchivo(res, filePath, 'application/javascript');
    
    //-- Si se accede al perfil, muestra los pedidos que haya en la base de datos
    } else if (url.pathname === '/perfil.html') {
        const cookieData = getCookies(req);
        const user = cookieData.user;

        //-- Obtener datos del usuario
        // const usuario = usuarios.find(userObj => userObj.usuario === user);

        //-- Obtener pedidos del usuario
        const pedidosUsuario = pedidos.filter(pedido => pedido.usuario === user);

        //-- Leer el contenido de perfil.html
        fs.readFile(RUTA_PERFIL, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Error interno del servidor');
                return;
            }

            let pedidosHTML;

            //-- Condición por si no hay ningún pedido aún en nombre del user
            if (pedidosUsuario.length === 0) {
                pedidosHTML = '<p>No has realizado aún ningún pedido.</p>';
            } else {
                pedidosHTML = pedidosUsuario.map(pedido => `
                    <div>
                        <h3>Pedido a ${pedido.direccion}</h3>
                        <ul>
                            ${pedido.lista_productos.map(producto => `<li>${producto}</li>`).join('')}
                        </ul>
                    </div>
                `).join('');
            }

            //-- Reemplazar el marcador <!-- DATOS_PEDIDOS --> con el contenido dinámico
            data = data.replace('<!-- DATOS_PEDIDOS -->', pedidosHTML);

            //-- Enviar la respuesta
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });

    //-- Si la extensión es .html, servir desde la carpeta ficheros/...
    } else if (extension === '.html') {

        //-- Obtenemos las cookies
        const cookieData = getCookies(req);
        const user = cookieData.user;

        //-- Si hay un usario registrado cambia la barra del navegador
        if (user) {
            //-- Agregar el nombre de usuario y el botón de log out al texto extra
            textoHTMLExtra = `<li class="nav-menu-item"><a href="perfil.html" class="nav-menu-link nav-link">${user}</a></li>
                            <li class="nav-menu-item"><a href="/logout" class="nav-menu-link nav-link">Log out</a></li>`;
        } else {
            //-- Si el usuario no está autenticado, mostrar el enlace al login
            textoHTMLExtra = `<li class="nav-menu-item"><a href="login.html" class="nav-menu-link nav-link">Log In</a></li>
                            <li class="nav-menu-item"><a href="registro.html" class="nav-menu-link nav-link">Sign Up</a></li>`;        }

        replaceTexto(res, path.join(__dirname, 'ficheros', url.pathname), 'text/html', '<!-- HTML_EXTRA -->', textoHTMLExtra);

    //-- Si la extensión es .css, servir desde la carpeta estilo/...
    } else if (extension === '.css') {
        servirArchivo(res, path.join(CARPETA_ESTILO, path.basename(url.pathname)), 'text/css');

    //-- Si la extensión es .jpg, servir desde la carpeta imagenes/...
    } else if (extension === '.jpg') {
        servirArchivo(res, path.join(CARPETA_IMAGENES, path.basename(url.pathname)), 'image/jpg');

    //-- Si la extensión es .png, servir desde la carpeta imagenes/...
    } else if (extension === '.png') {
        servirArchivo(res, path.join(CARPETA_IMAGENES, path.basename(url.pathname)), 'image/png');

    //-- Si la extensión es .js, servir desde la carpeta js/...
    } else if (extension === '.js') {
        servirArchivo(res, path.join(CARPETA_JS, path.basename(url.pathname)), 'text/javascript');
    
    //-- En cualquier otro caso sirve la página de error
    } else {
        servirArchivo(res, RUTA_ERROR, 'text/html');
    }
});
  
//-- Activar el servidor: ¡Que empiece la fiesta!
server.listen(PUERTO);
console.log("Server activado!. Escuchando en puerto: " + PUERTO);
