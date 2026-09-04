# language: es
# Nota: esta API es pública, de práctica (dummyjson.com) — se usa como
# ejemplo de metodología, con lenguaje de banco, mientras se define el
# acceso a las APIs reales de Omnicanalidad.
@api @smoke
Característica: Autenticación y consulta de cliente en banca digital
  Como sistema que consume los servicios del banco
  quiero iniciar sesión y encadenar los datos entre servicios
  para validar que el token de acceso y los datos de cliente funcionan
  correctamente entre los distintos servicios

  @critical
  Escenario: Iniciar sesión en la banca en línea y obtener un token de acceso
    Cuando inicio sesión con el usuario "emilys" y la contraseña "emilyspass"
    Entonces obtengo un token de acceso válido

  Escenario: Usar el token para consultar mi perfil de cliente
    Dado que inicié sesión con el usuario "emilys" y la contraseña "emilyspass"
    Cuando consulto mi perfil usando ese token
    Entonces veo los datos del usuario "emilys"

  Escenario: Consultar un cliente existente y registrar una solicitud a su nombre
    Dado que existe el cliente número 1
    Cuando registro una solicitud titulada "Apertura de cuenta - POC Omnicanalidad" para ese cliente
    Entonces la solicitud queda registrada con el mismo cliente
