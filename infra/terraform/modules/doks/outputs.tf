output "cluster_id" {
  description = "Kubernetes cluster ID"
  value       = digitalocean_kubernetes_cluster.main.id
}

output "cluster_name" {
  description = "Kubernetes cluster name"
  value       = digitalocean_kubernetes_cluster.main.name
}

output "cluster_endpoint" {
  description = "Kubernetes API server endpoint"
  value       = digitalocean_kubernetes_cluster.main.endpoint
  sensitive   = true
}

output "cluster_token" {
  description = "Kubernetes cluster token"
  value       = digitalocean_kubernetes_cluster.main.kube_config[0].token
  sensitive   = true
}

output "kubeconfig" {
  description = "Raw kubeconfig for the cluster"
  value       = digitalocean_kubernetes_cluster.main.kube_config[0].raw_config
  sensitive   = true
}

output "cluster_urn" {
  description = "Cluster URN"
  value       = digitalocean_kubernetes_cluster.main.urn
}
