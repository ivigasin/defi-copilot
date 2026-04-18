output "endpoint" {
  description = "Registry endpoint URL"
  value       = digitalocean_container_registry.main.endpoint
}

output "server_url" {
  description = "Registry server URL"
  value       = digitalocean_container_registry.main.server_url
}

output "name" {
  description = "Registry name"
  value       = digitalocean_container_registry.main.name
}
