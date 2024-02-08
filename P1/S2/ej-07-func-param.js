//-- Ejemplo de paso de parametros a funciones

//-- Recibe dos parámetros y devuelve su suma
function suma(x,y) {
    //-- devolver la suma
    return x+y;
  }
  
  //-- Recibe un parámetro y lo imprime por la consola
  function mensaje(msg) {
    console.log(msg);
  }
  
  //-- Función que no recibe parametros
  function saluda() {
      mensaje("HOLA!!");
  }
  
  //-- Función que recibe una funcion como parametro y simplemente la llama 
  function call(func) {
    console.log("--> Funcion recibida");
  
    //-- Llamar a la funcion pasada como argumento
    func();
  }
  
  //-- Llamar a suma. Variable a
  let a = suma(2,3);    //-- No imprime nada
  
  //-- Probando la función mensaje
  mensaje("Prueba")
  mensaje(a);   //-- Imprime la suma
  
  //-- Probando la función call
  call(saluda);
  
  //-- Se le pasa como parametro una funcion
  //-- que se define dentro de los parmatros, vez de 
  //-- fuera
  call( () => {
    mensaje("HOLI!!")
  });