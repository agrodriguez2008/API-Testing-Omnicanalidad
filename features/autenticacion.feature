# language: es
# Nota: esta API es publica, de practica (dummyjson.com) — se usa como
# ejemplo de metodologia, con lenguaje de banco, mientras se define el
# acceso a las APIs reales de Omnicanalidad.
@smoke
Característica:
  Como sistema que consume los servicios del banco
  quiero iniciar sesion y obtener un token de acceso
  para poder usarlo en las llamadas protegidas de los demas servicios

  @critical
  Escenario: Obtener token de acceso - Precondicion para los demas casos
    Cuando inicio sesion con el usuario de prueba
    Entonces obtengo un token de acceso valido

  Escenario: Consultar el perfil del cliente autenticado usando el token
    Dado que inicie sesion con el usuario de prueba
    Cuando consulto mi perfil usando ese token
    Entonces veo los datos del usuario de prueba

  @negativo
  Escenario: Prueba negativa - No se puede iniciar sesion con contraseña incorrecta
    Cuando intento iniciar sesion con el usuario de prueba y una contraseña incorrecta
    Entonces el sistema rechaza el acceso por credenciales invalidas
