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
const RUTA_COMPRA = path.join(__dirname, 'ficheros', 'finalizar_compra.html');
const RUTA_PRODUCTO = path.join(__dirname, 'ficheros', 'producto.html');
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

// Función para reemplazar texto en cualquier caso
function replaceTexto(res, rutaArchivo, contentType, textoReemplazo, textoHTMLExtra) {
    try {
        let contenido = fs.readFileSync(rutaArchivo, 'utf8');

        // Reemplazar texto con el textoHTMLExtra
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

//-- Función que maneja la actualización del stock y la validación de stock
function procesoPedido(carrito) {
    let stockSuficiente = true;
    let productosSinStock = [];

    // Comprobar el stock de cada producto en el carrito
    carrito.forEach(item => {
        let producto = productos.find(p => p.nombre === item);
        if (producto && producto.stock <= 0) {
            stockSuficiente = false;
            productosSinStock.push(item); // Agregar el producto sin stock a la lista
        }
    });

    // Si hay stock suficiente, reducir el stock de cada producto
    if (stockSuficiente) {
        carrito.forEach(item => {
            let producto = productos.find(p => p.nombre === item);
            if (producto) {
                producto.stock -= 1;
            }
        });

        // Guardar los cambios en el archivo tienda.json
        fs.writeFile(RUTA_TIENDA_JSON, JSON.stringify(tienda, null, 2), 'utf-8', (err) => {
            if (err) {
                console.error('Error al actualizar el stock en tienda.json:', err);
            }
        });
    }

    // Retornar el resultado del proceso y la lista de productos sin stock
    return {
        success: stockSuficiente,
        productosSinStock: productosSinStock
    };
}


//-- Analizar la cookie y devolver el nombre del usuario y el carrito si existen
function getCookies(req) {
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

// Función para manejar la solicitud de añadir al carrito
function productosCarrito(req, res) {
    const cookieData = getCookies(req);
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
    // console.log("Carrito al agregar producto:", carrito);

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

// Función para obtener y mostrar el carrito
function mostrarCarrito(req, res) {
    const cookieData = getCookies(req);
    const username = cookieData.user;
    const carrito = cookieData.carrito ? cookieData.carrito.split(':') : [];

    if (!username) {
        res.writeHead(302, { 'Location': '/login.html' });
        res.end();
        return;
    }

    // Crear un array único de productos
    const productosUnicos = [...new Set(carrito)];

    // Generar el HTML del carrito
    const carritoHTML = productosUnicos.map(producto => {
        // Contar cuántas veces aparece cada producto en el carrito
        const cantidad = carrito.filter(item => item === producto).length;

        // Crear el HTML para cada producto con su cantidad y los botones de añadir y eliminar
        return `
            <li>
                ${cantidad} x ${producto} 
                <button onclick="modificarCarrito('${producto}', 'add')">+</button>
                <button onclick="modificarCarrito('${producto}', 'remove')">-</button>
            </li>`;
    }).join(''); // Unir todos los elementos del array resultante en una sola cadena

    console.log(carritoHTML); // Esto es solo para verificar el resultado en la consola

    // Leer la carrito.html
    fs.readFile(RUTA_CARRITO, 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error al leer el archivo HTML');
            return;
        }

        textoHTMLExtra = `<li class="nav-menu-item"><a href="perfil.html" class="nav-menu-link nav-link">${username}</a></li>
                        <li class="nav-menu-item"><a href="/logout" class="nav-menu-link nav-link">Log out</a></li>`;

        // Reemplazar el marcador de posición con el HTML del carrito
        let updatedHTML = data.replace('<!-- HTML_EXTRA -->', textoHTMLExtra);
        updatedHTML = updatedHTML.replace('<!-- PRODUCTOS -->', carritoHTML);
        
        // Enviar la respuesta
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(updatedHTML);
    });
}

// Función para actualizar el carrito
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

// Función para verificar si el carrito está vacío y si hay suficiente stock de los productos
function verificarCarritoYStock(req, res, rutaArchivo, contentType) {
    const cookieData = getCookies(req);
    const carrito = cookieData.carrito ? cookieData.carrito.split(':') : [];

    // Verificar si el carrito está vacío
    if (carrito.length === 0) {
        const avisoError = '<p>El carrito está vacío, no puedes finalizar la compra.</p>';
        replaceTexto(res, RUTA_CARRITO, 'text/html', '<!-- AVISO -->', avisoError);
        return false;
    }

    // Verificar si hay suficiente stock para cada producto en el carrito
    for (let item of carrito) {
        let producto = productos.find(p => p.nombre === item);
        if (producto && producto.stock <= 0) {
            const avisoError = `<p>El producto ${item} no tiene suficiente stock.</p>`;
            replaceTexto(res, RUTA_CARRITO, 'text/html', '<!-- AVISO -->', avisoError);
            return false;
        }
    }

    // Si todo está bien, retornar true indicando que se puede proceder
    return true;
}

// Función para servir la página del producto con los datos del producto
function servirProducto(res, idProducto) {
    const producto = productos.find(p => p.id === idProducto);

    if (!producto) {
        servirArchivo(res, RUTA_ERROR, 'text/html');
        return;
    }

    fs.readFile(RUTA_PRODUCTO, 'utf8', (err, contenido) => {
        if (err) {
            res.writeHead(500);
            res.end();
            return;
        }

        let nuevoContenido = contenido
            .replace(/<!-- NOMBRE_PRODUCTO -->/g, producto.nombre)
            .replace(/<!-- DESCRIPCION_PRODUCTO -->/g, producto.descripcion)
            .replace(/<!-- UNIDADES_PRODUCTO -->/g, producto.unidades)
            .replace(/<!-- PRECIO_PRODUCTO -->/g, producto.precio)
            .replace(/<!-- STOCK_PRODUCTO -->/g, producto.stock)
            .replace(/FOTO_PRODUCTO/g, producto.foto)
            .replace(/NOMBRE PRODUCTO/g, producto.nombre)
            .replace(/'PRODUCTO'/g, `'${producto.nombre}'`);

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
        const match = url.pathname.match(/\/producto(\d+)\.html/);
        if (match) {
            const idProducto = parseInt(match[1], 10);
            servirProducto(res, idProducto);
        } else {
            servirArchivo(res, RUTA_ERROR, 'text/html');
        }

    //-- Petición de busqueda de productos
    } else if (url.pathname === '/buscar') {

        //-- Leer los parámetros
        let param1 = url.searchParams.get('param1');
        param1 = param1.toUpperCase();

        console.log("  Param: " +  param1);

        let result = productos.filter(prod => prod.nombre.toUpperCase().includes(param1));

        console.log(result);
        content = JSON.stringify(result);

        res.setHeader('Content-Type', 'application/json');
        res.write(content);
        res.end();

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
        // console.log("Petición de log out")
        res.setHeader('Set-Cookie', ['user=; Max-Age=0; SameSite=None; Path=/', 'carrito=; Max-Age=0; charset=utf-8; SameSite=None; Path=/']);
        res.writeHead(302, { 'Location': '/' });
        res.end();

    //-- Si la URL es /agregar_carrito, manejar añadir un producto
    } else if (url.pathname === '/agregar_carrito') {
        // console.log("Petición añadir producto al carrito")
        productosCarrito(req, res);

    //-- Si la URL es /login, manejar la solicitud de log in
    } else if (url.pathname == '/login') {
        // console.log("Petición de login")

        //-- Leer los parámetros de inicio de sesión
        let username = url.searchParams.get('username');
        let password = url.searchParams.get('password');

        let usuarioEncontrado = false;
        
        //-- Recorremos los usuarios de la base de datos
        usuarios.forEach(usuario => {
            //-- Si el usuario y la contraseña coinciden
            if (usuario.usuario === username && usuario.contraseña === password) {

                // Obtener el carrito del usuario
                let carritoUsuario = usuario.carrito ? usuario.carrito.join(':') : '';

                // Añadir el campo 'user' y 'carrito' a la cookie de respuesta
                res.setHeader('Set-Cookie', [`user=${encodeURIComponent(username)}; SameSite=None`, `carrito=${encodeURIComponent(carritoUsuario)}; Path=/; charset=utf-8; SameSite=None`]);
                // console.log("Carrito en finalizar compra 1:", carritoUsuario);
                
                // Agregar el nombre de usuario y el botón de log out al texto extra
                textoHTMLExtra = `<li class="nav-menu-item"><a href="perfil.html" class="nav-menu-link nav-link">${username}</a></li>
                                <li class="nav-menu-item"><a href="/logout" class="nav-menu-link nav-link">Log out</a></li>`;
                
                replaceTexto(res, RUTA_INDEX, 'text/html', '<!-- HTML_EXTRA -->', textoHTMLExtra);
                usuarioEncontrado = true;
            //-- Si el usuario coincide, pero no la contraseña
            } else if (usuario.usuario === username && usuario.contraseña != password) {
                //-- Añade un aviso indicando que la contraseña no es válida
                textoHTMLExtra = `<p>¡Contraseña incorrecta!</p><p>Introduzca una contraseña válida</p>`;

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

    // Si la URL es /registrar, manejar la solicitud de registro
    } else if (url.pathname === '/registrar' && req.method === 'POST') {
        let body = '';
        
        //-- Los datos vienen en el cuerpo
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

            let mensajeError = '';

            // Validar si todos los campos están completos
            if (!username || !name || !email || !password) {
                mensajeError += `<p>Faltan campos por rellenar. Por favor, complete todos los campos.</p>`;
            }
    
            // Validar si el nombre de usuario ya existe
            const usuarioExistente = usuarios.find(usuario => usuario.usuario === username);
            if (usuarioExistente) {
                mensajeError += `<p>Nombre de usuario existente. Introduzca un nombre de usuario diferente.</p>`;
            }
    
            // Validar si el correo electrónico ya existe
            const emailExistente = usuarios.find(usuario => usuario.email === email);
            if (emailExistente) {
                mensajeError += `<p>Correo electrónico existente. Introduzca una dirección diferente.</p>`;
            }
    
            // Validar si el correo electrónico es válido
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
            
            // Agregar el nuevo usuario a la base de datos de los usuarios
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
                    
                    replaceTexto(res, RUTA_INDEX, 'text/html', '<!-- HTML_EXTRA -->', textoHTMLExtra);
                    res.end();
                }
            });
        });

    // Manejo de la solicitud para finalizar_compra.html
     } else if (url.pathname === '/finalizar_compra.html') {
        // Verificar carrito y stock antes de servir la página
        if (verificarCarritoYStock(req, res, RUTA_COMPRA, 'text/html')) {
            servirArchivo(res, RUTA_COMPRA, 'text/html');
        }

    //-- Si la URL es /finalizar_compra, manejar la solicitud de finalizar la compra
    } else if (url.pathname === '/finalizar_compra' && req.method === 'GET') {
        // Validar la dirección y la tarjeta de crédito
        let direccion = url.searchParams.get('direccion');
        let tarjeta = url.searchParams.get('tarjeta');

        // Eliminar los espacios del número de la tarjeta
        tarjeta = tarjeta.replace(/\s+/g, '');

        let mensajeError = '';

        // Validar que la dirección no sea nula
        if (!direccion) {
            mensajeError += '<p>La dirección no puede estar vacía.</p>';
        }

        // Validar que la tarjeta tenga 16 dígitos y sea un número
        if (!tarjeta || tarjeta.length !== 16 || isNaN(tarjeta)) {
            mensajeError += '<p>El número de tarjeta debe ser de 16 dígitos numéricos.</p>';
        }

        // Si hay errores en la validación, mostrarlos y terminar la respuesta
        if (mensajeError) {
            replaceTexto(res, RUTA_COMPRA, 'text/html', '<!-- AVISO -->', mensajeError);
            res.end();
            return;
        }

        // Obtener las cookies
        const cookieData = getCookies(req);
        const user = cookieData.user;
        const carrito = cookieData.carrito ? cookieData.carrito.split(':') : [];

        // Verificar stock y procesar pedido
        const resultado = procesoPedido(carrito);

        if (resultado.success) {
            // Crear un nuevo objeto de pedido
            const nuevoPedido = {
                usuario: user,
                direccion: direccion,
                tarjeta: tarjeta,
                lista_productos: carrito
            };

            // Agregar el nuevo pedido a la base de datos de pedidos
            tienda.pedidos.push(nuevoPedido);

            // Guardar la lista actualizada de pedidos en el archivo tienda.json
            fs.writeFile(RUTA_TIENDA_JSON, JSON.stringify(tienda, null, 2), 'utf-8', (err) => {
                if (err) {
                    console.error('Error al escribir en el archivo tienda.json:', err);
                    res.writeHead(500);
                    res.end();
                } else {
                    // Vaciar el carrito del usuario en la base de datos
                    const usuarioIndex = tienda.usuarios.findIndex(u => u.nombre === user);
                    if (usuarioIndex !== -1) {
                        tienda.usuarios[usuarioIndex].carrito = [];
                    }

                    // Guardar la lista actualizada de usuarios en el archivo tienda.json
                    fs.writeFile(RUTA_TIENDA_JSON, JSON.stringify(tienda, null, 2), 'utf-8', (err) => {
                        if (err) {
                            console.error('Error al escribir en el archivo tienda.json:', err);
                            res.writeHead(500);
                            res.end();
                        } else {
                            // Eliminar la cookie del carrito
                            res.setHeader('Set-Cookie', `carrito=; Max-Age=0; charset=utf-8; SameSite=None; Path=/`);

                            // Redirigir al usuario a una página de confirmación de compra exitosa
                            res.writeHead(302, { 'Location': '/compra-exitosa.html' });
                            res.end();
                        }
                    });
                }
            });
        } else {
            // Mostrar los productos que no tienen stock suficiente
            const mensajeError = `<p>Los siguientes productos no están disponibles: ${resultado.productosSinStock.join(', ')}</p>`;
            replaceTexto(res, RUTA_COMPRA, 'text/html', '<!-- AVISO -->', mensajeError);
            res.end();
        }


    //-- Si la URL es la raíz del sitio
    } else if (url.pathname === '/') {
        // console.log("Petición main");

        //-- Obtenemos las cookies
        const cookieData = getCookies(req);
        const user = cookieData.user;

        //-- Si hay un usario registrado cambia la barra del navegador
        if (user) {
            // Agregar el nombre de usuario y el botón de log out al texto extra
            textoHTMLExtra = `<li class="nav-menu-item"><a href="perfil.html" class="nav-menu-link nav-link">${user}</a></li>
                            <li class="nav-menu-item"><a href="/logout" class="nav-menu-link nav-link">Log out</a></li>`;
        } else {
            // Si el usuario no está autenticado, mostrar el enlace al login
            textoHTMLExtra = `<li class="nav-menu-item"><a href="login.html" class="nav-menu-link nav-link">Log In</a></li>
                            <li class="nav-menu-item"><a href="registro.html" class="nav-menu-link nav-link">Sign Up</a></li>`;
        }

        replaceTexto(res, RUTA_INDEX, 'text/html', '<!-- HTML_EXTRA -->', textoHTMLExtra);
    
    // Si la URL es /ls, mostrar la lista de archivos en la carpeta principal
    } else if (url.pathname === '/ls') {
        // console.log("Petición listado de archivos");
        listarArchivosHTML(res);

    // Si la URL es /productos, mostrar la lista de productos disponibles
    } else if (url.pathname === '/productos') {
        // console.log("Petición listado de productos");
        mostrarProductos(res);
    
    //-- Si la URL es la raíz del sitio
    } else if (url.pathname === '/carrito') {
        // console.log("Petición carrito");

        // Obtener las cookies
        const cookieData = getCookies(req);
        const user = cookieData.user;

        // Si no está autenticado, redirigir al login
        if (!user) {
            res.writeHead(302, {'Location': '/login.html'});
            res.end();
            return;
        }

        mostrarCarrito(req, res);

    // Ruta para actualizar el carrito
    } else if (url.pathname === '/actualizar_carrito') {
        actualizarCarrito(req, res);

    } else if (url.pathname === '/js/carrito.js') {
        const filePath = path.join(CARPETA_JS, 'carrito.js');
        servirArchivo(res, filePath, 'application/javascript');

    // Si la extensión es .html, servir desde la carpeta ficheros/...
    } else if (extension === '.html') {
        // console.log("Petición recursos");

        //-- Obtenemos las cookies
        const cookieData = getCookies(req);
        const user = cookieData.user;

        //-- Si hay un usario registrado cambia la barra del navegador
        if (user) {
            // Agregar el nombre de usuario y el botón de log out al texto extra
            textoHTMLExtra = `<li class="nav-menu-item"><a href="perfil.html" class="nav-menu-link nav-link">${user}</a></li>
                            <li class="nav-menu-item"><a href="/logout" class="nav-menu-link nav-link">Log out</a></li>`;
        } else {
            // Si el usuario no está autenticado, mostrar el enlace al login
            textoHTMLExtra = `<li class="nav-menu-item"><a href="login.html" class="nav-menu-link nav-link">Log In</a></li>
                            <li class="nav-menu-item"><a href="registro.html" class="nav-menu-link nav-link">Sign Up</a></li>`;        }

        replaceTexto(res, path.join(__dirname, 'ficheros', url.pathname), 'text/html', '<!-- HTML_EXTRA -->', textoHTMLExtra);

    // Si la extensión es .css, servir desde la carpeta estilo/...
    } else if (extension === '.css') {
        // console.log("Petición estilo .css");
        servirArchivo(res, path.join(CARPETA_ESTILO, path.basename(url.pathname)), 'text/css');

    // Si la extensión es .jpg, servir desde la carpeta imagenes/...
    } else if (extension === '.jpg') {
        // console.log("Petición imágenes .jpg");
        servirArchivo(res, path.join(CARPETA_IMAGENES, path.basename(url.pathname)), 'image/jpg');

    // Si la extensión es .png, servir desde la carpeta imagenes/...
    } else if (extension === '.png') {
        // console.log("Petición imágenes .png");
        servirArchivo(res, path.join(CARPETA_IMAGENES, path.basename(url.pathname)), 'image/png');

    // Si la extensión es .js, servir desde la carpeta js/...
    } else if (extension === '.js') {
        // console.log("Petición javascript");
        servirArchivo(res, path.join(CARPETA_JS, path.basename(url.pathname)), 'text/javascript');
    
    // En cualquier otro caso sirve la página de error
    } else {
        // console.log("Página error");
        servirArchivo(res, RUTA_ERROR, 'text/html');
    }
});
  
//-- Activar el servidor: ¡Que empiece la fiesta!
server.listen(PUERTO);
console.log("Server activado!. Escuchando en puerto: " + PUERTO);
