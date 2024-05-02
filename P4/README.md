# Práctica 4 (ESPECIFICACIONES)

Convertir el **servidor de Chat** de la práctica 3 en una **aplicación Electron nativa**. Debe tener una **interfaz gráfica** que muestre la siguiente información:

* Versión de node
* Versión de Electron
* Versión de Chrome
* URL a la que se deben conectar los clientes para chatear
* Mostrar los mensajes que llegan al servidor, del resto de usuarios
* Botón de pruebas para enviar un mensaje a todos los clientes conectados

La URL a la que se conectan los clientes deberá **obtener la dirección IP** de la **máquina** en la que se está ejecutando (no valdría dejar la url "cableada" en una cadena).

En la **versión básica** de la aplicación no hace falta que esté **empaquetada**. Basta con que arranque al ejecutar ```npm start```

### Mejoras

Puedes incluir las mejoras que consideres (¡Imaginación al poder!). No olvides indicarlas en la documentación. Algunas propuestas de mejoras:

* Empaquetado de la app, para el sistema operativo que uses
* Mostrar la URL de conexión mediante un código QR en la interfaz gráfica. De esta manera la gente lo puede abrir fácilmente desde sus móviles sin escribir nada
* Mostrar más información del sistema: arquitectura, máquina, directorios...

### EVALUACION

* **Puntuación total**: 2 ptos
  * **Documentacion (wiki)**: 0.5 ptos
  * **Funcionalidad**: 1 pto
    * **Interfaz básica**: 0.5 ptos
    * **Funcionamiento del chat**: 0.5 ptos
* **Mejoras**: 0.5 ptos
