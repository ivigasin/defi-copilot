output "cluster_id" {
  description = "Database cluster ID"
  value       = digitalocean_database_cluster.postgres.id
}

output "host" {
  description = "Database host"
  value       = digitalocean_database_cluster.postgres.private_host
}

output "port" {
  description = "Database port"
  value       = digitalocean_database_cluster.postgres.port
}

output "database" {
  description = "Database name"
  value       = digitalocean_database_db.app.name
}

output "user" {
  description = "Database user"
  value       = digitalocean_database_user.app.name
}

output "password" {
  description = "Database password"
  value       = digitalocean_database_user.app.password
  sensitive   = true
}

output "connection_string" {
  description = "Full PostgreSQL connection string (private network)"
  value       = "postgresql://${digitalocean_database_user.app.name}:${digitalocean_database_user.app.password}@${digitalocean_database_cluster.postgres.private_host}:${digitalocean_database_cluster.postgres.port}/${digitalocean_database_db.app.name}?sslmode=require"
  sensitive   = true
}

output "cluster_urn" {
  description = "Database cluster URN"
  value       = digitalocean_database_cluster.postgres.urn
}
