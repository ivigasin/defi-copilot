include "root" {
  path = find_in_parent_folders()
}

locals {
  common = read_terragrunt_config(find_in_parent_folders("common.hcl"))
  env    = read_terragrunt_config(find_in_parent_folders("env.hcl"))
}

terraform {
  source = "${get_terragrunt_dir()}/../../../../modules/doks"
}

dependency "networking" {
  config_path = "../networking"

  mock_outputs = {
    vpc_id = "mock-vpc-id"
  }
}

dependency "registry" {
  config_path = "../registry"

  mock_outputs = {
    name = "mock-registry"
  }
}

inputs = {
  cluster_name   = local.env.locals.cluster_name
  region         = local.common.locals.region
  vpc_id         = dependency.networking.outputs.vpc_id
  node_size      = local.env.locals.node_size
  node_count     = local.env.locals.node_count
  min_nodes      = local.env.locals.min_nodes
  max_nodes      = local.env.locals.max_nodes
  node_pool_name = "default"
  auto_upgrade   = true
  surge_upgrade  = true
  registry_name  = dependency.registry.outputs.name
}
