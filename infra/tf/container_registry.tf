<<<<<<< HEAD
resource "azurerm_container_registry" "rfg" {
  name                = "rfgregistry"
  location            = azurerm_resource_group.rentfreegames.location
  resource_group_name = azurerm_resource_group.rentfreegames.name
  sku                 = "Basic"
}
=======
resource "azurerm_container_registry" "rfg" {
  name                = "rfgregistry"
  location            = azurerm_resource_group.rentfreegames.location
  resource_group_name = azurerm_resource_group.rentfreegames.name
  sku                 = "Basic"
}
>>>>>>> e38650918cb843a88d6d4612afe3c1d187012999
