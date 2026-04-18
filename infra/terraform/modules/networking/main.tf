resource "digitalocean_vpc" "main" {
  name     = "${var.project_name}-${var.environment}"
  region   = var.region
  ip_range = var.vpc_ip_range
}

resource "digitalocean_firewall" "k8s" {
  name = "${var.project_name}-${var.environment}-fw"

  # Allow HTTP/HTTPS inbound
  inbound_rule {
    protocol         = "tcp"
    port_range       = "80"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  inbound_rule {
    protocol         = "tcp"
    port_range       = "443"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  # Allow all intra-VPC traffic
  inbound_rule {
    protocol         = "tcp"
    port_range       = "1-65535"
    source_addresses = [var.vpc_ip_range]
  }

  inbound_rule {
    protocol         = "udp"
    port_range       = "1-65535"
    source_addresses = [var.vpc_ip_range]
  }

  # Allow all outbound
  outbound_rule {
    protocol              = "tcp"
    port_range            = "1-65535"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }

  outbound_rule {
    protocol              = "udp"
    port_range            = "1-65535"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }

  outbound_rule {
    protocol              = "icmp"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }
}
