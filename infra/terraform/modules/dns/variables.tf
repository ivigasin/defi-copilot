variable "domain" {
  description = "Root domain name"
  type        = string
}

variable "app_subdomain" {
  description = "Subdomain for the web app"
  type        = string
  default     = "app"
}

variable "api_subdomain" {
  description = "Subdomain for the API"
  type        = string
  default     = "api"
}

variable "load_balancer_ip" {
  description = "Load balancer IP to point DNS records to"
  type        = string
  default     = ""
}
