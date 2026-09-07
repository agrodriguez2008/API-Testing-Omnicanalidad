# language: es
# Nota: esta API es publica, de practica (dummyjson.com) — se usa como
# ejemplo de metodologia, con lenguaje de banco, mientras se define el
# acceso a las APIs reales de Omnicanalidad. El login es una precondicion
# de cada escenario (ver autenticacion.feature para los casos que prueban
# el login en si).
@smoke
Característica:
  Como sistema que consume los servicios del banco
  quiero crear, buscar y eliminar cuentas usando el token de acceso
  para validar que los datos se encadenan correctamente entre servicios

  Escenario: Crear una cuenta para un cliente existente
    Dado que inicie sesion con el usuario de prueba
    Y que existe un cliente registrado en el banco
    Cuando creo la cuenta "Apertura de cuenta - POC Omnicanalidad" para ese cliente
    Entonces la cuenta queda creada para el mismo cliente

  Escenario: Eliminar una cuenta existente - evitar creacion de multiple data dummy
    Dado que inicie sesion con el usuario de prueba
    Y que existe una cuenta registrada en el banco
    Cuando busco esa cuenta y la elimino
    Entonces la cuenta queda marcada como eliminada
    # Nota importante sobre el nombre de este escenario: dummyjson.com (la
    # API publica de practica) no guarda de verdad lo que crea el escenario
    # "Crear una cuenta para un cliente existente" — el POST solo simula la
    # respuesta, el id que devuelve no existe de verdad del lado del
    # servidor. Por eso este caso NO puede buscar ni eliminar literalmente
    # esa cuenta: usa una cuenta que si existe en el banco. Es, de hecho, la
    # misma idea detras del nombre del escenario — reutilizar una cuenta
    # existente en vez de crear una nueva solo para borrarla es exactamente
    # lo que evita acumular data dummy de mas. En Omnicanalidad, con datos
    # que si persisten, este mismo caso si podria encadenarse literalmente
    # con la cuenta creada en el escenario de arriba.
    Y vuelvo a consultarla para dejar evidencia de la validacion

  Escenario: Buscar una cuenta existente en la base de datos
    Dado que inicie sesion con el usuario de prueba
    Cuando busco una cuenta existente en la base de datos
    Entonces encuentro la cuenta y veo sus datos completos
    # Nota: el paso "Cuando" deja ver primero un SELECT (SQL) armado para
    # representar el ingreso a la base de datos del banco, y despues trae el
    # dato real de la API. dummyjson.com no tiene una base de datos SQL real
    # detras -- ver el detalle en el adjunto del reporte y en
    # `buscarEnBaseDeDatos` (posts.service.ts). En Omnicanalidad este mismo
    # paso consultaria la base de datos real.
