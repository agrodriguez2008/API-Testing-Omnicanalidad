# language: es
# Nota: esta API es pública, de práctica (dummyjson.com) — se usa como
# ejemplo de metodología, con lenguaje de banco, mientras se define el
# acceso a las APIs reales de Omnicanalidad.
@smoke
Característica:
  Como sistema que consume los servicios del banco
  quiero iniciar sesión y encadenar los datos entre servicios
  para validar que el token de acceso y los datos de cliente funcionan
  correctamente entre los distintos servicios

  @critical
  Escenario: Auth - Consulta de cliente - Precondición: obtener token
    Cuando inicio sesión con el usuario "emilys" y la contraseña "emilyspass"
    Entonces obtengo un token de acceso válido

  Escenario: Auth - Consulta de cliente - Consulta de perfil para extraer datos con token extraído
    Dado que inicié sesión con el usuario "emilys" y la contraseña "emilyspass"
    Cuando consulto mi perfil usando ese token
    Entonces veo los datos del usuario "emilys"

  Escenario: Crear una cuenta existente con perfil obtenido en escenario 2
    Dado que inicié sesión con el usuario "emilys" y la contraseña "emilyspass"
    Y que existe un cliente registrado en el banco
    Cuando creo la cuenta "Apertura de cuenta - POC Omnicanalidad" para ese cliente
    Entonces la cuenta queda creada para el mismo cliente

  @negativo
  Escenario: Prueba negativa - No se puede iniciar sesión con contraseña incorrecta
    Cuando intento iniciar sesión con el usuario "emilys" y la contraseña incorrecta "clave-incorrecta"
    Entonces el sistema rechaza el acceso por credenciales inválidas

  Escenario: Eliminar cuenta creada en paso 3 - evitar creación de múltiple data dummy
    Dado que inicié sesión con el usuario "emilys" y la contraseña "emilyspass"
    Y que existe una cuenta registrada en el banco
    Cuando busco esa cuenta y la elimino
    Entonces la cuenta queda marcada como eliminada
    # Nota importante sobre el nombre de este escenario: dummyjson.com (la
    # API pública de práctica) no guarda de verdad lo que crea el escenario
    # 3 — el POST solo simula la respuesta, el id que devuelve no existe de
    # verdad del lado del servidor. Por eso este caso NO puede buscar ni
    # eliminar literalmente esa cuenta: usa una cuenta que sí existe en el
    # banco. Es, de hecho, la misma idea detrás del nombre del escenario —
    # reutilizar una cuenta existente en vez de crear una nueva solo para
    # borrarla es exactamente lo que evita acumular data dummy de más. En
    # Omnicanalidad, con datos que sí persisten, este mismo caso sí podría
    # encadenarse literalmente con la cuenta creada en el escenario 3.
    Y vuelvo a consultarla para dejar evidencia de la validación

  Escenario: Buscar una cuenta existente en la base de datos
    Dado que inicié sesión con el usuario "emilys" y la contraseña "emilyspass"
    Cuando busco una cuenta existente en la base de datos
    Entonces encuentro la cuenta y veo sus datos completos
