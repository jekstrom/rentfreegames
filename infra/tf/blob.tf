resource "azurerm_storage_account" "storage_account" {
  name                     = "rfgstoracc"
  location            = azurerm_resource_group.rentfreegames.location
  resource_group_name = azurerm_resource_group.rentfreegames.name
  account_tier             = "Standard"
  account_replication_type = "LRS"
}

resource "azurerm_storage_container" "storage_container" {
  name                  = "content"
  storage_account_name  = azurerm_storage_account.storage_account.name
  container_access_type = "blob"
}
