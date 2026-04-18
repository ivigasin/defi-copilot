variable "cluster_name" {
  description = "Redis cluster name"
  type        = string
}

variable "region" {
  description = "DigitalOcean region"
  type        = string
}

variable "size" {
  description = "Droplet size for Redis nodes"
  type        = string
  default     = "db-s-1vcpu-1gb"
}

variable "node_count" {
  description = "Number of Redis nodes"
  type        = number
  default     = 1
}

variable "vpc_id" {
  description = "VPC ID for private networking"
  type        = string
}

variable "eviction_policy" {
  description = "Redis eviction policy"
  type        = string
  default     = "noeviction"
}

variable "engine_version" {
  description = "Valkey major version"
  type        = string
  default     = "8"
}
