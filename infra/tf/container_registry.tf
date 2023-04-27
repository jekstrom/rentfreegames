resource "azurerm_container_registry" "rfg" {
  name                = "rfgregistry"
  location            = azurerm_resource_group.rentfreegames.location
  resource_group_name = azurerm_resource_group.rentfreegames.name
  sku                 = "Basic"
}
