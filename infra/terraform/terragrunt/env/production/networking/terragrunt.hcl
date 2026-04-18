include "root" {
  path = find_in_parent_folders()
}

locals {
  common = read_terragrunt_config(find_in_parent_folders("common.hcl"))
  env    = read_terragrunt_config(find_in_parent_folders("env.hcl"))
}

terraform {
  source = "${get_terragrunt_dir()}/../../../../modules/networking"
}

inputs = {
  vpc_name        = "${local.env.locals.cluster_name}-vpc"
  region          = local.common.locals.region
  vpc_description = "VPC for ${local.env.locals.env_name} environment"
  firewall_name   = "${local.env.locals.cluster_name}-firewall"
}
