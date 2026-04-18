output "cluster_id" {
  description = "Redis cluster ID"
  value       = digitalocean_database_cluster.redis.id
}

output "host" {
  description = "Redis private host"
  value       = digitalocean_database_cluster.redis.private_host
}

output "port" {
  description = "Redis port"
  value       = digitalocean_database_cluster.redis.port
}

output "password" {
  description = "Redis password"
  value       = digitalocean_database_cluster.redis.password
  sensitive   = true
}

output "uri" {
  description = "Full Redis URI (private network)"
  value       = digitalocean_database_cluster.redis.private_uri
  sensitive   = true
}

output "cluster_urn" {
  description = "Redis cluster URN"
  value       = digitalocean_database_cluster.redis.urn
}
