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
  project_name = local.common.locals.project
  environment  = local.env.locals.env_name
  region       = local.common.locals.region
}
