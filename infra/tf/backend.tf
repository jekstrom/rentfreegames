terraform {
    backend "azurerm" {
        resource_group_name  = "tfstate"
        storage_account_name = "rentfreetfstate3aq66"
        container_name       = "tfstate"
        key                  = "terraform.tfstate"
    }
}
