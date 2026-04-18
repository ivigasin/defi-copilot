variable "name" {
  description = "Container registry name"
  type        = string
}

variable "subscription_tier" {
  description = "DOCR subscription tier (starter, basic, professional)"
  type        = string
  default     = "basic"
}

variable "region" {
  description = "Registry region"
  type        = string
}
