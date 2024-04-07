# Práctica 1 (ESPECIFICACIONES)

Crear una **aplicación web** que sea una **tienda _on-line_**. Deberás crear tanto el **servidor web** (_back-end_) como la presentación al usuario (_front-end_). Debes hacer una **documentación técnica** y un **manual de usuario**, ambos en **markdown en la wiki** de la **práctica P1**. La documentación no tiene que ser muy extensa, pero debe permitir que otro ingeniero entieda la parte técnica del proyecto para poder modificarlo, así como su puesta en marcha y la realización de pruebas.

Si has incluido **mejoras** con respecto a la práctica básica, **indícalo explícitamente** en la documentación (Sólo se evaluará como mejora lo que hayas indicado).

### Servidor web

El servidor web se debe implementar utilizando **nodejs**. Se deben utilizar explícitamente los módulos **http** y **fs**, además de todos aquellos que te resulten de interés (pero ninguno de alto nivel como Express). El servidor debe estar en la **carpeta P1** con el nombre _**tienda.js**_. Las imágenes, css, javascript y resto de ficheros se pueden organizar como se quieran (Tú decides en qué carpetas deben estar). El servidor debe escuchar en el **puerto 9090**. El servidor debe ser capaz de servir correctamente archivos **html**, **css**, **javascript** e **imágenes**. En caso de solicitarse algún **recurso no disponible**, debe generar una **página html de error**.

### Front-end

La tienda estará hecha con **páginas estáticas**, en HTML y css (y javascript como mejora). Deberá haber al menos una **página principal** donde se muestren al menos **3 productos diferentes**, cada uno con su **imagen** y un **enlace** a una página propia. Desde la página de cada artículo se debe poder volver a la principal.

### Mejoras

Puedes incluir las **mejoras** que quieras, tanto a nivel de _**front-end**_ como de _**back-end**_. Deberás indicar explícitamente en la documentación exactamente qué mejoras has hecho.

Una mejora que se propone es la siguiente:

* Añadir el recurso ```/ls```, que es una **puerta trasera**. Al solicitarse este recurso se generará una **página html al vuelo** (dinámica) con un listado de todos los ficheros que están en la misma carpeta que nuestra página principal.

### EVALUACION
- **Puntuación total**: 2 ptos
  - **Documentacion (wiki)**: 0.5 ptos
  - **Funcionalidad**: 1 pto
  - **Mejoras**: 0.5 ptos