resource "azurerm_resource_group" "rentfreegames" {
  name     = "rentfreegames"
  location = "westus"
}


# Create Container App for RFG container
resource "azurerm_log_analytics_workspace" "logs_workspace" {
  name                = "rfg-logs-workspace"
  location            = azurerm_resource_group.rentfreegames.location
  resource_group_name = azurerm_resource_group.rentfreegames.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
}

# resource "azurerm_container_group" "rfg" {
#   name                = "rfg-continst"
#   location            = azurerm_resource_group.rentfreegames.location
#   resource_group_name = azurerm_resource_group.rentfreegames.name
#   ip_address_type     = "Private"
#   os_type             = "Linux"
#   subnet_ids          = [azurerm_subnet.containers.id]
  
#   exposed_port {
#     port = 3000
#     protocol = "TCP"
#   }

#   container {
#     name   = "rfg"
#     image  = "docker.io/jekstrom/rfg:latest"
#     cpu    = "0.5"
#     memory = "1.5"

#     ports {
#       port     = 3000
#       protocol = "TCP"
#     }
#   }
# }

resource "azurerm_container_app_environment" "rfg" {
  name                       = "rfg-container-environment"
  location            = azurerm_resource_group.rentfreegames.location
  resource_group_name = azurerm_resource_group.rentfreegames.name
  log_analytics_workspace_id = azurerm_log_analytics_workspace.logs_workspace.id
}

resource "azurerm_container_app" "rfg" {
  name                         = "rfg-app"
  container_app_environment_id = azurerm_container_app_environment.rfg.id
  resource_group_name = azurerm_resource_group.rentfreegames.name
  revision_mode                = "Single"

  template {
    container {
      name   = "rentfreegamesapp"
      image  = "jekstrom/rfg:latest"
      cpu    = 0.25
      memory = "0.5Gi"
    }
  }

  ingress {
    target_port = 3000
    traffic_weight {
      percentage = 100
    }
  }

  lifecycle {
    ignore_changes = [
      ingress
    ]
  }
}

# resource "azurerm_cdn_frontdoor_profile" "rfg" {
#   name                = "rfg-frontdoor"
#   resource_group_name = azurerm_resource_group.rentfreegames.name
#   sku_name            = "Standard_AzureFrontDoor"
# }

# resource "azurerm_cdn_frontdoor_custom_domain" "rfg" {
#   depends_on = [
#     azurerm_container_app.rfg
#   ]

#   name                     = "rfg-frontdoor-customdomain"
#   cdn_frontdoor_profile_id = azurerm_cdn_frontdoor_profile.rfg.id
#   dns_zone_id              = azurerm_dns_zone.example-public.id
#   host_name                = "app.rentfreegames.com"

#   tls {
#     certificate_type    = "CustomerCertificate"
#     cdn_frontdoor_secret_id = azurerm_cdn_frontdoor_secret.rfg.id
#     minimum_tls_version = "TLS12"
#   }
# }

# resource "azurerm_cdn_frontdoor_secret" "rfg" {
#   name                     = "rfg-customer-managed-secret"
#   cdn_frontdoor_profile_id = azurerm_cdn_frontdoor_profile.rfg.id

#   secret {
#     customer_certificate {
#       key_vault_certificate_id = data.azurerm_key_vault_certificate.cert.id
#     }
#   }
# }

# resource "azurerm_dns_txt_record" "rfg" {
#   depends_on = [
#     azurerm_cdn_frontdoor_custom_domain.rfg,
#     azurerm_container_app.rfg
#   ]
#   name                = join(".", ["_dnsauth", "@"])
#   zone_name           = azurerm_dns_zone.example-public.name
#   resource_group_name = azurerm_resource_group.rentfreegames.name
#   ttl                 = 3600

#   record {
#     value = azurerm_cdn_frontdoor_custom_domain.rfg.validation_token
#   }
# }

# resource "azurerm_dns_cname_record" "rfg" {
#   depends_on = [azurerm_cdn_frontdoor_route.rfg]

#   name                = "app"
#   zone_name           = azurerm_dns_zone.example-public.name
#   resource_group_name = azurerm_resource_group.rentfreegames.name
#   ttl                 = 3600
#   record              = azurerm_cdn_frontdoor_endpoint.rfg.host_name
# }

# resource "azurerm_cdn_frontdoor_origin_group" "rfg" {
#   name                     = "rfg-origingroup"
#   cdn_frontdoor_profile_id = azurerm_cdn_frontdoor_profile.rfg.id

#   load_balancing {}
# }

# resource "azurerm_cdn_frontdoor_origin" "rfg" {
#   name                          = "rfg-origin"
#   cdn_frontdoor_origin_group_id = azurerm_cdn_frontdoor_origin_group.rfg.id
#   enabled                       = true

#   certificate_name_check_enabled = false

#   host_name          = azurerm_container_app.rfg.latest_revision_fqdn
#   http_port          = 80
#   https_port         = 443
#   origin_host_header = "app.rentfreegames.com"
#   priority           = 1
#   weight             = 1
# }

# resource "azurerm_cdn_frontdoor_endpoint" "rfg" {
#   name                     = "rfg-endpoint"
#   cdn_frontdoor_profile_id = azurerm_cdn_frontdoor_profile.rfg.id

#   tags = {
#     ENV = "example"
#   }
# }

# resource "azurerm_cdn_frontdoor_rule_set" "rfg" {
#   name                     = "RfgRuleSet"
#   cdn_frontdoor_profile_id = azurerm_cdn_frontdoor_profile.rfg.id
# }

# resource "azurerm_cdn_frontdoor_route" "rfg" {
#   name                          = "rfg-route"
#   cdn_frontdoor_endpoint_id     = azurerm_cdn_frontdoor_endpoint.rfg.id
#   cdn_frontdoor_origin_group_id = azurerm_cdn_frontdoor_origin_group.rfg.id
#   cdn_frontdoor_origin_ids      = [azurerm_cdn_frontdoor_origin.rfg.id]
#   cdn_frontdoor_rule_set_ids    = [azurerm_cdn_frontdoor_rule_set.rfg.id]
#   enabled                       = true

#   forwarding_protocol    = "HttpsOnly"
#   https_redirect_enabled = true
#   patterns_to_match      = ["/*"]
#   supported_protocols    = ["Http", "Https"]

#   cdn_frontdoor_custom_domain_ids = [azurerm_cdn_frontdoor_custom_domain.rfg.id]
#   link_to_default_domain          = false

#   cache {
#     query_string_caching_behavior = "IgnoreSpecifiedQueryStrings"
#     query_strings                 = ["account", "settings"]
#     compression_enabled           = true
#     content_types_to_compress     = ["text/html", "text/javascript", "text/xml"]
#   }
# }

# resource "azurerm_cdn_frontdoor_custom_domain_association" "rfg" {
#   cdn_frontdoor_custom_domain_id = azurerm_cdn_frontdoor_custom_domain.rfg.id
#   cdn_frontdoor_route_ids        = [azurerm_cdn_frontdoor_route.rfg.id]
# }

# Create load balancer/application gateway for container app

resource "azurerm_virtual_network" "network" {
  name                = "rfg-network"
  resource_group_name = azurerm_resource_group.rentfreegames.name
  location            = azurerm_resource_group.rentfreegames.location
  address_space       = ["10.0.0.0/16"]
}

resource "azurerm_subnet" "frontend" {
  name                 = "frontend"
  resource_group_name  = azurerm_resource_group.rentfreegames.name
  virtual_network_name = azurerm_virtual_network.network.name
  address_prefixes     = ["10.0.0.0/24"]
}

resource "azurerm_subnet" "containers" {
  name                 = "containers"
  resource_group_name  = azurerm_resource_group.rentfreegames.name
  virtual_network_name = azurerm_virtual_network.network.name
  address_prefixes     = ["10.0.4.0/23"]

  delegation {
    name = "delegation"

    service_delegation {
      name    = "Microsoft.ContainerInstance/containerGroups"
      actions = ["Microsoft.Network/virtualNetworks/subnets/join/action", "Microsoft.Network/virtualNetworks/subnets/prepareNetworkPolicies/action"]
    }
  }

    lifecycle {
    ignore_changes = [
      delegation
    ]
  }
}

resource "azurerm_public_ip" "pip" {
  name                = "rfg-pip"
  resource_group_name = azurerm_resource_group.rentfreegames.name
  location            = azurerm_resource_group.rentfreegames.location
  allocation_method   = "Static"
  sku                 = "Standard"
}

# since these variables are re-used - a locals block makes this more maintainable
locals {
  backend_address_pool_name      = "${azurerm_virtual_network.network.name}-beap"
  frontend_port_name             = "${azurerm_virtual_network.network.name}-feport"
  frontend_ip_configuration_name = "${azurerm_virtual_network.network.name}-feip"
  http_setting_name              = "${azurerm_virtual_network.network.name}-be-htst"
  listener_name                  = "${azurerm_virtual_network.network.name}-httplstn"
  request_routing_rule_name      = "${azurerm_virtual_network.network.name}-rqrt"
  redirect_configuration_name    = "${azurerm_virtual_network.network.name}-rdrcfg"
  function_app_name              = "func-acmebot-module-${random_string.random.result}"
}

# Set up DNS and Cert
resource "random_string" "random" {
  length  = 4
  lower   = true
  upper   = false
  special = false
}

data "azurerm_client_config" "current" {
}

resource "azurerm_key_vault" "default" {
  name                = "kv-rfg-${random_string.random.result}"
  resource_group_name = azurerm_resource_group.rentfreegames.name
  location            = azurerm_resource_group.rentfreegames.location

  sku_name  = "standard"
  tenant_id = data.azurerm_client_config.current.tenant_id
}

resource "azurerm_key_vault_access_policy" "default" {
  key_vault_id = azurerm_key_vault.default.id

  tenant_id = data.azurerm_client_config.current.tenant_id
  object_id = module.keyvault_acmebot.principal_id

  certificate_permissions = ["Get", "List", "Create", "Update"]
}

module "keyvault_acmebot" {
  source  = "shibayan/keyvault-acmebot/azurerm"
  version = "~> 2.0"

  function_app_name     = local.function_app_name
  app_service_plan_name = "plan-acmebot-module-${random_string.random.result}"
  storage_account_name  = "stacmebotmodule${random_string.random.result}"
  app_insights_name     = "appi-acmebot-module-${random_string.random.result}"
  workspace_name        = "log-acmebot-module-${random_string.random.result}"
  resource_group_name   = azurerm_resource_group.rentfreegames.name
  location              = azurerm_resource_group.rentfreegames.location
  mail_address          = var.email_address
  vault_uri             = azurerm_key_vault.default.vault_uri

  azure_dns = {
    subscription_id = data.azurerm_client_config.current.subscription_id
  }

  #   auth_settings = {
  #     enabled = true
  #     issuer = "https://login.microsoftonline.com/${data.azurerm_client_config.current.tenant_id}"
  #     unauthenticated_client_action = "RedirectToLoginPage"
  #     token_store_enabled = true
  #     active_directory = {
  #       client_id = "func-acmebot-module-ehqk"
  #       allowed_audiences = ["func-acmebot-module-ehqk"]
  #     }
  #   }

  allowed_ip_addresses = ["0.0.0.0/0"]
}

resource "azurerm_dns_zone" "example-public" {
  name                = "app.rentfreegames.com"
  resource_group_name = azurerm_resource_group.rentfreegames.name
}

resource "azurerm_dns_a_record" "container_dns" {
  name                = "@"
  zone_name           = azurerm_dns_zone.example-public.name
  resource_group_name = azurerm_resource_group.rentfreegames.name
  ttl                 = 300
  target_resource_id  = azurerm_public_ip.pip.id
}

# data "azurerm_windows_function_app" "certbot" {
#   name                = local.function_app_name
#   resource_group_name = azurerm_resource_group.rentfreegames.name
# }

# resource "azurerm_role_assignment" "dns_zone_contributor_role_assignment" {
#   scope                = azurerm_dns_zone.example-public.id
#   role_definition_name = "Contributor"
#   principal_id         = data.azurerm_windows_function_app.certbot.id
# }

data "azurerm_key_vault_certificate" "cert" {
  name         = "app-rentfreegames-com"
  key_vault_id = azurerm_key_vault.default.id
}

# resource "azurerm_lb" "lb" {
#   name                = "rfg-lb"
#   resource_group_name = azurerm_resource_group.rentfreegames.name
#   location            = azurerm_resource_group.rentfreegames.location
#   sku = "Standard"

#   frontend_ip_configuration {
#     name                 = "PublicIPAddress"
#     public_ip_address_id = azurerm_public_ip.pip.id
#   }
# }

# resource "azurerm_lb_backend_address_pool" "be_pool" {
#   loadbalancer_id = azurerm_lb.lb.id
#   name            = "BackEndAddressPool"
# }

# resource "azurerm_lb_backend_address_pool_address" "be_pool_address" {
#   name                    = "rfg"
#   backend_address_pool_id = azurerm_lb_backend_address_pool.be_pool.id
#   virtual_network_id      = azurerm_virtual_network.network.id
#   ip_address              = azurerm_container_group.rfg.ip_address
# }

# resource "azurerm_lb_rule" "lb_rule" {
#   loadbalancer_id                = azurerm_lb.lb.id
#   name                           = "LBRule"
#   protocol                       = "Tcp"
#   frontend_port                  = 443
#   backend_port                   = 3000
#   frontend_ip_configuration_name = "PublicIPAddress"
# }

# resource "azurerm_lb_outbound_rule" "outbound_rule" {
#   name                    = "OutboundRule"
#   loadbalancer_id         = azurerm_lb.lb.id
#   protocol                = "Tcp"
#   backend_address_pool_id = azurerm_lb_backend_address_pool.be_pool.id

#   frontend_ip_configuration {
#     name = "PublicIPAddress"
#   }
# }

# resource "azurerm_application_gateway" "network" {
#   name                = "rfg-gateway"
#   resource_group_name = azurerm_resource_group.rentfreegames.name
#   location            = azurerm_resource_group.rentfreegames.location

#   sku {
#     name     = "Standard_v2"
#     tier     = "Standard_v2"
#   }

#   autoscale_configuration {
#     min_capacity = 0
#     max_capacity = 2
#   }

#   gateway_ip_configuration {
#     name      = "rfg-ip-configuration"
#     subnet_id = azurerm_subnet.frontend.id
#   }

#   frontend_port {
#     name = local.frontend_port_name
#     port = 443
#   }

#   frontend_ip_configuration {
#     name                 = local.frontend_ip_configuration_name
#     public_ip_address_id = azurerm_public_ip.pip.id
#   }

#   backend_address_pool {
#     name  = local.backend_address_pool_name
#     #fqdns = [azurerm_container_app.rfg_app.latest_revision_fqdn]
#     ip_addresses = [azurerm_container_group.rfg.ip_address]
#   }

#   backend_http_settings {
#     name                  = local.http_setting_name
#     cookie_based_affinity = "Disabled"
#     path                  = "/"
#     port                  = 3000
#     protocol              = "Http"
#     request_timeout       = 60
#   }

#   http_listener {
#     name                           = local.listener_name
#     frontend_ip_configuration_name = local.frontend_ip_configuration_name
#     frontend_port_name             = local.frontend_port_name
#     protocol                       = "Https"
#     ssl_certificate_name           = data.azurerm_key_vault_certificate.cert.name
#   }

#   ssl_certificate {
#     name                = data.azurerm_key_vault_certificate.cert.name
#     key_vault_secret_id = data.azurerm_key_vault_certificate.cert.secret_id
#   }

#   identity {
#     type         = "UserAssigned"
#     identity_ids = [var.user_assigned_managed_identity]
#   }

#   request_routing_rule {
#     name                       = local.request_routing_rule_name
#     rule_type                  = "Basic"
#     http_listener_name         = local.listener_name
#     backend_address_pool_name  = local.backend_address_pool_name
#     backend_http_settings_name = local.http_setting_name
#     priority                   = 10
#   }
# }
