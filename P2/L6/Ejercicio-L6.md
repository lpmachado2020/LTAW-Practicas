## Ejercicio 2: Página de Acceso en la tienda (Login)

Añade un enlace en tu tienda para que los usuarios puedan acceder (login). Al pinchar sobre ese enlace debe aparecer un formulario pidiendo el nombre del usuario (por simplicidad en la práctica sólo pedimos el nombre y se deja como mejora el pedir un password). La tienda nos debe responder con una página HTML en la que nos de la bienvenida si el usuario introducido se encuentra dentro de la base de datos definida en el fichero tienda.json hecho en el ejercicio 2 de la sesión L5, o una página de error indicando que el usuario es desconocido

Utiliza el método GET para el envío de datos desde el cliente al servidor

Sube los ficheros a la carpeta P2 de tus prácticas, ya que serán parte de la práctica a entregar, aunque de momento sean temporales

## Ejercicio 3: Formulario de compra

Añade en la página principal otro enlace para finalizar la compra (Llámalo como quieras). Al pinchar ahí debe aparecer un formulario que nos pida la dirección de envío y el número de tarjeta de crédito para hacer el pago. Estos datos los debe recibir el servidor e introducirlos en la base de datos, en el campo de los pedidos (Fichero tienda.json). NOTA: En el campo de los pedidos todavía nos faltaría por añadir el usuario y la lista de productos. Esto lo haremos en los ejercicios siguientes. En este puedes o bien dejarlos en blanco o poner cualquier valor constante que quieras para hacer pruebas

Utiliza el método GET para el envío de datos desde el cliente al servidor

Sube los ficheros a la carpeta P2 de tus prácticas, ya que serán parte de la práctica a entregar, aunque de momento sean temporales

## Ejercicio 4: Practicar con Cookies

Haz los ejemplos del 4 al 6 que vimos en la sesión 6 de Teoría. Súbelos a la carpeta P2/S6 de tu repositorio. Estudia y asimila estos ejemplos. Te permitirán entender cómo funcionan las cookies. Las usaremos para la implementación del Login y del carrito de la compra

## Ejercicio 5: Página de acceso (Login, versión 2)

Modifica la página de acceso del ejercicio 2 para que el servidor añada el campo user a la cookie del mensaje de respuesta, si el login ha sido correcto (user=nombre-usuario). Si al acceder a esta página de Login el usuario ya estaba dentro, responder con una página indicando que ya ha accedido (Es decir, no debe aparecer el formulario de login)

En la petición recibida al recurso de login sabrás si el usuario está o no logeado leyendo el campo user de la cookie recibida (si es que hubiese cookie)

## Ejercicio 6: Nombre de usuario en página principal

Modifica la página principal de la tienda para que aparezca el enlace del Login en caso de que el usuario no se haya identificado. Si el usuario ya está identificado deberá aparecer su nombre de usuario (y NO el enlace al login)

Para implementarlo, en la página pricipal se deberá leer la Cookie y comprobar el valor del campo user si lo hubiese

## Ejercicio 7: Añadir al carrito

En las páginas web de cada producto crea una opción de añadir al carrito. Al hacerlo, el producto se añadirá a la cookie del carrito que se devolverá en el mensaje de respuesta. Por simplicidad, puedes hacer que se añada tantas veces como se quiera. En este ejercicio no hagas todavía el control del stock. Eso añadelo como mejora cuando lo básico te funcione (al añadir al carrito se deberá decrementar el stock del producto seleccionado y actualizarlo en la base de datos)

## Ejercicio 8: formalizar la compra (versión 2)

Modifica lo que hiciste en el ejercicio 3 para guardar en la base de datos tanto el nombre del usuario como los productos del carrito