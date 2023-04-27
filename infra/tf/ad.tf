# This isn't supported in Terraform :(
# https://github.com/hashicorp/terraform-provider-azuread/issues/175

# resource "azurerm_aadb2c_directory" "tenant" {
#   country_code            = "US"
#   data_residency_location = "United States"
#   display_name            = "rentfreegames"
#   domain_name             = "rentfreegames-ad.onmicrosoft.com"
#   resource_group_name     = azurerm_resource_group.rentfreegames.name
#   sku_name                = "PremiumP1"
# }

#data "azuread_client_config" "current" {}

# provider "azuread" {
#   alias     = "rfg"
#   tenant_id = azurerm_aadb2c_directory.tenant.id
# }

# resource "azuread_application" "app" {
#   display_name = "rentfreegames"
#   #identifier_uris  = ["http://app.localhost"]
#   logo_image       = filebase64("../../src/rentfreegames/public/images/profile.png")
#   owners           = [data.azuread_client_config.current.object_id]
#   sign_in_audience = "AzureADMyOrg"

#   web {
#     homepage_url  = "http://localhost:3000"
#     logout_url    = "http://localhost:3000/logout"
#     redirect_uris = ["http://localhost:3000/account"]

#     implicit_grant {
#       access_token_issuance_enabled = true
#       id_token_issuance_enabled     = true
#     }
#   }

#   provider = azuread.rfg
  
# }
