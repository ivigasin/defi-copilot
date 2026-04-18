include "root" {
  path = find_in_parent_folders()
}

locals {
  common = read_terragrunt_config(find_in_parent_folders("common.hcl"))
}

terraform {
  source = "${get_terragrunt_dir()}/../../../../modules/registry"
}

inputs = {
  registry_name           = "${local.common.locals.project}-registry"
  subscription_tier_slug  = "basic"
}
