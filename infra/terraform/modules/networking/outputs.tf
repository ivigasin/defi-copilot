output "vpc_id" {
  description = "ID of the VPC"
  value       = digitalocean_vpc.main.id
}

output "vpc_urn" {
  description = "URN of the VPC"
  value       = digitalocean_vpc.main.urn
}

output "firewall_id" {
  description = "ID of the firewall"
  value       = digitalocean_firewall.k8s.id
}
