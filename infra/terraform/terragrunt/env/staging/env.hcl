# Staging environment variables

locals {
  env_name = "staging"

  # DOKS
  cluster_name = "defi-copilot-staging"
  node_size    = "s-2vcpu-4gb"
  node_count   = 2
  min_nodes    = 0
  max_nodes    = 0

  # Database
  db_cluster_name = "defi-copilot-db-staging"
  db_size         = "db-s-1vcpu-1gb"
  db_node_count   = 1

  # Redis
  redis_cluster_name = "defi-copilot-redis-staging"
  redis_size         = "db-s-1vcpu-1gb"

  # DNS — subdomains relative to vigasin.com → app.defi.vigasin.com, api.defi.vigasin.com
  app_subdomain = "app.defi"
  api_subdomain = "api.defi"
}
