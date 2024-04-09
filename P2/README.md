# Práctica 2 (ESPECIFICACIONES)

Ampliar la tienda on-line de la práctica 1 para incluir las nuevas características que se indican en los siguientes apartados. Debes hacer una documentación técnica y un manual de usuario, ambos en markdown en la wiki de la práctica P2. Si haces mejoras, índicalas explícitamente en la documentación. El servidor debe atender las peticiones en el puerto 9090

### Base de datos en fichero JSON

La tienda deberá tener una base de datos implementada en el fichero tienda.json. Debe contener los siguientes datos:

- Usuarios: Todos los usuarios registrados en la tienda. Debe haber al menos dos: el usuario root y un usuario normal. Cada usuario tiene un nombre (el que se usa para el login), un nombre real y una dirección de correo

- Productos: Todos los productos disponibles en la tienda. Para cada producto, al menos se deberá tener la siguiente información: nombre, descripción, precio y cantidad en stock

- Pedidos: Registro de los pedidos realizados. Cada pedido contiene la siguiente información: nombre de usuario, dirección de envío, numero de la tarjeta y una lista con los nombres de los productos comprados (Supondremos que la cantidad es siempre 1 para simplificar)

### Front-end

La tienda deberá tener al menos una página principal donde se muestren todos los productos disponibles (Al menos debe haber 3 productos). Cada producto tendrá su propia página donde aparecerá toda su información (que se leerá de la base de datos) y un botón para añadir al carrito de la compra

Deberá tener una página para hacer el login del usuario, y otra para hacer el procesamiento del pedido

### Usuarios

En la tienda debe haber al menos dos usuarios: root y otro, que ya están previamente registrados y son los que usaremos para las pruebas. La primera vez que te conectas la tienda mostrará su página principal, donde estará la opción de acceder a tu cuenta (login). Si no has accedido a tu cuenta no podrás realizar ninguna compra, aunque sí navegador por ella de forma anónima

### Login

El acceso a tu cuenta se hará mediante una opción disponible en la página principal. Al acceder a esa opción se pedirá que introduzcas el nombre del usuario. Si el usuario es correcto, aparecerá la página principal y se te indicará que estás conectado como el usuario tal (por simplicidad el acceso será sólo con el nombre del usuario. Pedir un password se deja como mejora)

### Carrito de la compra

Se implementará un carrito de la compra donde se irán añadiendo todos los productos. Para simplificar, no habrá opción de quitar del carrito

### Procesamiento de la compra

Una vez que el usuario ya ha metido productos en el carrito, pinchará en una opción para finalizar la compra. La tienda mostrará una página con el contenido actual del carrito y un formulario para solicituar al usuario los siguientes datos adicionales: dirección de envío y número de tarjeta para realizar el pago. Una vez introducidos, la tienda confirmará que el pedido se ha realizado y almacenará este pedido en la base de datos (fichero tienda.json)

### Búsqueda con autocompletado

La página principal debe ofrecer la opción de buscar un producto mediante una caja de búsqueda. Al escribir 3 ó más caracteres, aparecerá un menú desplegable con las opciones posibles. Al apretar el botón de buscar se enviará esta inforamción, y el servidor devolverá una página con información sobre el producto (o ir directamente a la página del producto)

### Mejoras

Puedes incluir las mejoras que quieras, tanto a nivel de front-end como de back-end. Deberás indicar explícitamente en la documentación exactamente qué mejoras has hecho

Estas son algunas propuestas de mejoras:

- Autenticación con usuario y password. Dentro del fichero tienda.json se deberá incluir un campo nuevo con la clase (por simplicidad pondremos la clave en texto plano). Al pinchan en login nos pedirá el usuario y el password. Sólo podremos acceder si son válidos

- Listado de pedidos pendientes: El usuario root tendrá la opción de poder ver los pedidos que hay pendientes

- Gestor para introducir productos nuevos. Permitir que el usuario root pueda añadir nuevos productos mediante un formulario. Al crear uno nuevo se guardará en el base de datos

- Control de stock: Por simplicidad en la práctica básica no se lleva control de stock: Se pueden añadir al carrito todos los productos que se quieran (el stock permanecerá a un valor siempre fijo). Como mejora puedes implementar su control: al añadir al carrito que se decremente y se almacene en la base de datos. Si el stock de un producto es 0, NO debe aparecer la opción de añadir al carrito

### EVALUACION

- Puntuación total: 3 ptos
  - Documentacion (wiki): 0.5 ptos
  - Funcionalidad: 2 pto
    - Base de datos y páginas dinámicas: 0.4 ptos
    - Login: 0.4 ptos
    - Carrito compra: 0.4 ptos
    - Búsqueda: 0.4 ptos
    - Finalizar la compra: 0.4 ptos
  - Mejoras: 0.5 ptos
