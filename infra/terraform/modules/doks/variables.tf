variable "cluster_name" {
  description = "Kubernetes cluster name"
  type        = string
}

variable "region" {
  description = "DigitalOcean region"
  type        = string
}

variable "k8s_version" {
  description = "Kubernetes version prefix (e.g. 1.32). Empty string uses latest available."
  type        = string
  default     = ""
}

variable "vpc_id" {
  description = "VPC ID for the cluster"
  type        = string
}

variable "node_pool_name" {
  description = "Default node pool name"
  type        = string
  default     = "default"
}

variable "node_size" {
  description = "Droplet size for worker nodes"
  type        = string
  default     = "s-2vcpu-4gb"
}

variable "node_count" {
  description = "Number of worker nodes"
  type        = number
  default     = 2
}

variable "min_nodes" {
  description = "Minimum nodes for autoscaling (0 to disable)"
  type        = number
  default     = 0
}

variable "max_nodes" {
  description = "Maximum nodes for autoscaling"
  type        = number
  default     = 0
}

variable "auto_upgrade" {
  description = "Enable automatic K8s version upgrades"
  type        = bool
  default     = true
}

variable "surge_upgrade" {
  description = "Enable surge upgrades (extra node during upgrade)"
  type        = bool
  default     = true
}

variable "registry_name" {
  description = "DOCR registry name to integrate with the cluster"
  type        = string
  default     = ""
}
