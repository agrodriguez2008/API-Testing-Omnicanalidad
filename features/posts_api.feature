# language: es
# Nota: esta API es pública, de práctica (dummyjson.com) — se usa como
# ejemplo de metodología, con lenguaje de banco, mientras se define el
# acceso a las APIs reales de Omnicanalidad.
@smoke
Característica: Autenticación y consulta de cliente en banca digital
  Como sistema que consume los servicios del banco
  quiero iniciar sesión y encadenar los datos entre servicios
  para validar que el token de acceso y los datos de cliente funcionan
  correctamente entre los distintos servicios

  @critical
  Escenario: Obtener un token de acceso al iniciar sesión
    Cuando inicio sesión con el usuario "emilys" y la contraseña "emilyspass"
    Entonces obtengo un token de acceso válido

  Escenario: Consultar mi perfil con el token obtenido
    Dado que inicié sesión con el usuario "emilys" y la contraseña "emilyspass"
    Cuando consulto mi perfil usando ese token
    Entonces veo los datos del usuario "emilys"

  Escenario: Crear una cuenta para un cliente existente
    Dado que inicié sesión con el usuario "emilys" y la contraseña "emilyspass"
    Y que existe un cliente registrado en el banco
    Cuando creo la cuenta "Apertura de cuenta - POC Omnicanalidad" para ese cliente
    Entonces la cuenta queda creada para el mismo cliente

  @negativo
  Escenario: Rechazar el inicio de sesión con contraseña incorrecta
    Cuando intento iniciar sesión con el usuario "emilys" y la contraseña incorrecta "clave-incorrecta"
    Entonces el sistema rechaza el acceso por credenciales inválidas

  Escenario: Eliminar una cuenta existente
    Dado que inicié sesión con el usuario "emilys" y la contraseña "emilyspass"
    Y que existe una cuenta registrada en el banco
    Cuando busco esa cuenta y la elimino
    Entonces la cuenta queda marcada como eliminada
    # Nota: esta API pública no borra datos de verdad, solo simula el DELETE.
    # Tampoco persiste lo que crea el escenario "Crear una cuenta..." (por
    # eso este caso usa una cuenta que sí existe, no la recién creada). En
    # Omnicanalidad este último paso se haría contra la base de datos real,
    # para confirmar que el registro ya no existe.
    Y vuelvo a consultarla para dejar evidencia de la validación
