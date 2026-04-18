resource "digitalocean_container_registry" "main" {
  name                   = var.name
  subscription_tier_slug = var.subscription_tier
  region                 = var.region
}
