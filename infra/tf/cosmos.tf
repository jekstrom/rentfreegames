resource "random_integer" "ri" {
  min = 10000
  max = 99999
}

resource "azurerm_cosmosdb_account" "db" {
  name                = "rfg-cosmos-db-${random_integer.ri.result}"
  location            = azurerm_resource_group.rentfreegames.location
  resource_group_name = azurerm_resource_group.rentfreegames.name
  offer_type          = "Standard"
  kind                = "GlobalDocumentDB"

  enable_automatic_failover = true

  capabilities {
    name = "EnableServerless"
  }

  consistency_policy {
    consistency_level       = "BoundedStaleness"
    max_interval_in_seconds = 300
    max_staleness_prefix    = 100000
  }

  geo_location {
    location          = "westus"
    failover_priority = 0
  }
}
