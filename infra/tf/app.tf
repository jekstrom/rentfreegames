resource "azurerm_service_plan" "rfg" {
  name                = "rfg-plan"
  resource_group_name = azurerm_resource_group.rentfreegames.name
  location            = azurerm_resource_group.rentfreegames.location
  os_type             = "Linux"
  sku_name            = "B1"
}

resource "azurerm_linux_web_app" "rfg" {
  name                = "rfg-app"
  resource_group_name = azurerm_resource_group.rentfreegames.name
  location            = azurerm_resource_group.rentfreegames.location
  service_plan_id     = azurerm_service_plan.rfg.id
  https_only          = true

  site_config {
    application_stack {
      docker_image     = "rfgregistry.azurecr.io/rfg"
      docker_image_tag = "32"
    }
  }

  identity {
    type = "SystemAssigned"
  }

  lifecycle {
    ignore_changes = [
      app_settings
    ]
  }
}

# resource "azurerm_role_assignment" "rfg_role_assignment" {
#   role_definition_name = "AcrPull"
#   scope                = azurerm_container_registry.rfg.id
#   principal_id         = azurerm_linux_web_app.rfg.identity[0].principal_id
# }
