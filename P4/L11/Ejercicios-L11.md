## Ejercicio 2

Parte del servidor de la práctica 3. Añade el ```package.json``` y haz que arranque como una aplicación de electron (con npm start). Haz que se abra una ventana en blanco. Debería funcionar exactamente igual, pero con la diferencia de que aparece una ventana gráfica sin nada. La creación de la ventana estará dentro de la función de callback ```electron.app.on()```, pero el resto del servidor NO

```javascript
electron.app.on('ready', () => {
  //-- Aquí se crea la ventana y se hace lo relacionado con la gui
  //-- Pero el servidor no va aquí dentro, si no fuera, como en la práctica 3
}
```

## Ejercicio 3

Crea la interfaz mínima, y haz que se muestre la información del sistema en la ventana gráfica: vesión de node, de Chrome, la ip....

Las vesiones las encontrarás en el atributo ```process.versions```. Busca en la documentación de node cómo obtener las versiones pedidas
La dirección IP de tu máquina la obtienes con el paquete "ip", llamando al método ```ip.address()```. Deberás instalar el paquete correspondiente e importarlo en tu aplicación

Impleméntalo primero en el proceso pricipal, y muestra la información en la consola, para comprobar que funcione. Una vez que lo tengas controlado, piensa en cómo incluirlo en tu interfaz gráfica. Hay dos enfoques: uno es hacerlo directamente desde el proceso de renderizado. La otra es obtener la info en el proceso principal y comunicárselo al de renderizado mendiante mensajes

## Ejercicio 4

Implementa los mecanismos de comunicación entre proceso principal y proceso de renderizado, para que en la interfaz gráfica aparezcan el número de usuarios conectados y los mensajes de los clientes del chat

## Ejercicio 5

Implementa los mecanismos de comunicación para que el proceso de renderizado le comunique al proceso principal que se ha pulsado el botón de enviar un mensaje de test

## Ejercicio 6

Ya lo tienes todo listo. Haz los retoques finales e implementa las mejoras optativas si quieres subir nota