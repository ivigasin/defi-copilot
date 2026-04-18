resource "digitalocean_domain" "main" {
  name = var.domain
}

resource "digitalocean_record" "app" {
  count  = var.load_balancer_ip != "" ? 1 : 0
  domain = digitalocean_domain.main.id
  type   = "A"
  name   = var.app_subdomain
  value  = var.load_balancer_ip
  ttl    = 300
}

resource "digitalocean_record" "api" {
  count  = var.load_balancer_ip != "" ? 1 : 0
  domain = digitalocean_domain.main.id
  type   = "A"
  name   = var.api_subdomain
  value  = var.load_balancer_ip
  ttl    = 300
}
