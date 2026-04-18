# Production environment variables

locals {
  env_name = "production"

  # DOKS
  cluster_name = "defi-copilot-prod"
  node_size    = "s-4vcpu-8gb"
  node_count   = 3
  min_nodes    = 3
  max_nodes    = 5

  # Database
  db_cluster_name = "defi-copilot-db-prod"
  db_size         = "db-s-2vcpu-4gb"
  db_node_count   = 2 # HA standby

  # Redis
  redis_cluster_name = "defi-copilot-redis-prod"
  redis_size         = "db-s-1vcpu-2gb"

  # DNS
  app_subdomain = "app"
  api_subdomain = "api"
}
