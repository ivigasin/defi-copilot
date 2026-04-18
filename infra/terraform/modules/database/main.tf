resource "digitalocean_database_cluster" "postgres" {
  name                 = var.cluster_name
  engine               = "pg"
  version              = var.engine_version
  size                 = var.size
  region               = var.region
  node_count           = var.node_count
  private_network_uuid = var.vpc_id
}

resource "digitalocean_database_db" "app" {
  cluster_id = digitalocean_database_cluster.postgres.id
  name       = var.db_name
}

resource "digitalocean_database_user" "app" {
  cluster_id = digitalocean_database_cluster.postgres.id
  name       = var.db_user
}

resource "digitalocean_database_firewall" "restrict" {
  count      = length(var.allowed_ip_ranges) > 0 ? 1 : 0
  cluster_id = digitalocean_database_cluster.postgres.id

  dynamic "rule" {
    for_each = var.allowed_ip_ranges
    content {
      type  = "ip_addr"
      value = rule.value
    }
  }
}
