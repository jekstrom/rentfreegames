resource "azurerm_redis_cache" "cache" {
  name                = "rentfreegames-cache"
  location            = azurerm_resource_group.rentfreegames.location
  resource_group_name = azurerm_resource_group.rentfreegames.name
  capacity            = 0
  family              = "C"
  sku_name            = "Basic"
  enable_non_ssl_port = false
  minimum_tls_version = "1.2"

  redis_configuration {
  }
}