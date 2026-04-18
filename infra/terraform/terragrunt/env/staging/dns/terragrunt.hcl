include "root" {
  path = find_in_parent_folders()
}

locals {
  common = read_terragrunt_config(find_in_parent_folders("common.hcl"))
  env    = read_terragrunt_config(find_in_parent_folders("env.hcl"))
}

terraform {
  source = "${get_terragrunt_dir()}/../../../../modules/dns"
}

dependency "doks" {
  config_path = "../doks"

  mock_outputs = {
    cluster_id = "mock-cluster-id"
  }
}

inputs = {
  domain           = local.common.locals.domain
  app_subdomain    = local.env.locals.app_subdomain
  api_subdomain    = local.env.locals.api_subdomain
  load_balancer_ip = "" # Set after ingress controller is deployed
}
