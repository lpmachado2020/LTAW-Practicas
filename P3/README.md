# Práctica 3 (ESPECIFIACIONES)

Hacer una **aplicación Web de Chat**, en el que múltiples usuarios puedan hablar entre sí a través del **Navegador**. La aplicación consiste en un programa servidor hecho en **node.js**, al que se conectan los clientes desde los navegadores. Cada vez que un usuario se conecte al servidor se le enviará un **mensaje de bienvenida**, que sólo él verá, y aunciará al resto de participantes que se ha conectado alguien nuevo.

Para el **intercambio de datos** entre los clientes y el servidor se utilizará la **biblioteca socket.io**. Además, la aplicación web se desarrollará utilizando el paquete **express** de Node.

Cada mensaje enviado por uno de los participantes será visible para el resto. El servidor se encargará de esta tarea. Además, el servidor responderá a estos comandos especiales. La respuesta sólo la verá el cliente que haya enviado el comando (El resto NO lo verán).

* **/help**: Mostrará una lista con todos los comandos soportados
* **/list**: Devolverá el número de usuarios conectados
* **/hello**: El servidor nos devolverá el saludo
* **/date**: Nos devolverá la fecha

Cuando el servidor detecta que llega un **mensaje que empieza por el carácter '/'**, lo interpretará como un comando y lo procesará (pero **no lo enviará al resto de usuarios del chat**). El resto de mensjaes que no sean comandos sí los re-enviará a los participantes del chat.

Debes hacer una **documentación técnica** y un **manual de usuario**, ambos en _markdown_ en la wiki de la práctica P3. Si haces mejoras, índicalas explícitamente en la documentación.

### Mejoras

Puedes incluir las mejoras que consideres (¡Imaginación al poder!). No olvides indicarlas en la documentación. Algunas propuestas de mejoras:

* Incluir sonidos cuando se reciben mensajes
* Permitir que los usuarios tengan nicknames
* Añadir la funcionalidad de "El usuario x está escribiendo..."
* Mostrar los usuarios que están conectados
* Mensajes directos entre usuarios

### EVALUACION

* **Puntuación total**: 2 ptos
  * **Documentacion (wiki)**: 0.5 ptos
  * **Funcionalidad**: 1 pto
    * **Conexión al chat y comunicación entre usuarios**: 0.5 ptos
    * **Comandos especiales**: 0.5 ptos
* **Mejoras**: 0.5 ptos