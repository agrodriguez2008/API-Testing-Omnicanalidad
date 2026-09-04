@ui @login
Feature: Login en Sauce Demo
  Como comprador de Swag Labs
  quiero iniciar sesión
  para poder ver el catálogo de productos

  @smoke
  Scenario: Login exitoso con usuario válido
    Given que estoy en la página de login
    When ingreso el usuario "standard_user" y la contraseña "secret_sauce"
    Then debería ver la página de productos

  @negative
  Scenario: Usuario bloqueado es rechazado
    Given que estoy en la página de login
    When ingreso el usuario "locked_out_user" y la contraseña "secret_sauce"
    Then veo el error "Epic sadface: Sorry, this user has been locked out."
