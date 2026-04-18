include "root" {
  path = find_in_parent_folders()
}

locals {
  common = read_terragrunt_config(find_in_parent_folders("common.hcl"))
  env    = read_terragrunt_config(find_in_parent_folders("env.hcl"))
}

terraform {
  source = "${get_terragrunt_dir()}/../../../../modules/redis"
}

dependency "networking" {
  config_path = "../networking"

  mock_outputs = {
    vpc_id = "mock-vpc-id"
  }
}

inputs = {
  cluster_name         = local.env.locals.redis_cluster_name
  region               = local.common.locals.region
  size                 = local.env.locals.redis_size
  vpc_id               = dependency.networking.outputs.vpc_id
}
