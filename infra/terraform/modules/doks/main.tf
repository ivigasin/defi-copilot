data "digitalocean_kubernetes_versions" "available" {
  version_prefix = var.k8s_version != "" ? var.k8s_version : null
}

resource "digitalocean_kubernetes_cluster" "main" {
  name          = var.cluster_name
  region        = var.region
  version       = data.digitalocean_kubernetes_versions.available.latest_version
  vpc_uuid      = var.vpc_id
  auto_upgrade  = var.auto_upgrade
  surge_upgrade = var.surge_upgrade

  maintenance_policy {
    start_time = "04:00"
    day        = "sunday"
  }

  node_pool {
    name       = var.node_pool_name
    size       = var.node_size
    node_count = var.min_nodes > 0 ? null : var.node_count
    auto_scale = var.min_nodes > 0
    min_nodes  = var.min_nodes > 0 ? var.min_nodes : null
    max_nodes  = var.max_nodes > 0 ? var.max_nodes : null
  }
}

# Integrate DOCR with the cluster so nodes can pull images
resource "digitalocean_container_registry_docker_credentials" "main" {
  count          = var.registry_name != "" ? 1 : 0
  registry_name  = var.registry_name
  write          = false
}
