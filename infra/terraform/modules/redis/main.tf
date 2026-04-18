resource "digitalocean_database_cluster" "redis" {
  name                 = var.cluster_name
  engine               = "valkey"
  version              = var.engine_version
  size                 = var.size
  region               = var.region
  node_count           = var.node_count
  private_network_uuid = var.vpc_id
  eviction_policy      = var.eviction_policy
}
