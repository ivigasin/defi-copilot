variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment name (staging, production)"
  type        = string
}

variable "region" {
  description = "DigitalOcean region"
  type        = string
}

variable "vpc_ip_range" {
  description = "IP range for the VPC"
  type        = string
  default     = "10.10.0.0/16"
}
