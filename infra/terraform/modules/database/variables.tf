variable "cluster_name" {
  description = "Database cluster name"
  type        = string
}

variable "region" {
  description = "DigitalOcean region"
  type        = string
}

variable "engine_version" {
  description = "PostgreSQL major version"
  type        = string
  default     = "16"
}

variable "size" {
  description = "Droplet size for database nodes"
  type        = string
  default     = "db-s-1vcpu-1gb"
}

variable "node_count" {
  description = "Number of database nodes (2+ for HA standby)"
  type        = number
  default     = 1
}

variable "vpc_id" {
  description = "VPC ID for private networking"
  type        = string
}

variable "db_name" {
  description = "Default database name"
  type        = string
  default     = "defi_copilot"
}

variable "db_user" {
  description = "Default database user"
  type        = string
  default     = "defi"
}

variable "allowed_ip_ranges" {
  description = "Trusted IP ranges for firewall (CIDR)"
  type        = list(string)
  default     = []
}
