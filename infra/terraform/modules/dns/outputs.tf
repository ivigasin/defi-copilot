output "domain" {
  description = "Domain name"
  value       = data.data.digitalocean_domain.main.name
}

output "app_fqdn" {
  description = "Fully qualified domain name for the web app"
  value       = var.load_balancer_ip != "" ? "${var.app_subdomain}.${data.digitalocean_domain.main.name}" : ""
}

output "api_fqdn" {
  description = "Fully qualified domain name for the API"
  value       = var.load_balancer_ip != "" ? "${var.api_subdomain}.${data.digitalocean_domain.main.name}" : ""
}
