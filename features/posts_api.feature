@api
Feature: API de Posts
  Como consumidor de la API
  quiero consultar y crear publicaciones
  para validar que el servicio responde correctamente

  @smoke
  Scenario: Consultar un post existente
    When pido el post 1
    Then la respuesta tiene status 200
    And el post tiene id 1

  Scenario: Crear un post nuevo
    When creo un post titulado "Demo POC"
    Then la respuesta tiene status 201
