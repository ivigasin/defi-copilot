include "root" {
  path = find_in_parent_folders()
}

locals {
  common = read_terragrunt_config(find_in_parent_folders("common.hcl"))
  env    = read_terragrunt_config(find_in_parent_folders("env.hcl"))
}

terraform {
  source = "${get_terragrunt_dir()}/../../../../modules/database"
}

dependency "networking" {
  config_path = "../networking"

  mock_outputs = {
    vpc_id = "mock-vpc-id"
  }
}

dependency "doks" {
  config_path = "../doks"

  mock_outputs = {
    cluster_id = "mock-cluster-id"
  }
}

inputs = {
  cluster_name       = local.env.locals.db_cluster_name
  region             = local.common.locals.region
  node_count         = local.env.locals.db_node_count
  size               = local.env.locals.db_size
  db_name            = "defi_copilot"
  db_user            = "defi_app"
  private_network_uuid = dependency.networking.outputs.vpc_id
}
