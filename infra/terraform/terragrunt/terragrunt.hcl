# Root terragrunt configuration
# All child modules inherit this config

locals {
  common = read_terragrunt_config(find_in_parent_folders("common.hcl"))
  env    = read_terragrunt_config(find_in_parent_folders("env.hcl"))

  project = local.common.locals.project
  region  = local.common.locals.region
  env_name = local.env.locals.env_name
}

# Remote state on DigitalOcean Spaces (S3-compatible)
# Credentials via env vars:
#   SPACES_ACCESS_KEY_ID     — DigitalOcean Spaces access key
#   SPACES_SECRET_ACCESS_KEY — DigitalOcean Spaces secret key
#   DIGITALOCEAN_TOKEN       — DigitalOcean API token
remote_state {
  backend      = "s3"
  disable_init = false
  config = {
    bucket     = "${local.project}-terraform-state"
    key        = "${local.env_name}/${path_relative_to_include()}/terraform.tfstate"
    region     = "us-east-1" # Required by S3 backend but ignored by Spaces
    endpoint   = "https://ams3.digitaloceanspaces.com"
    access_key = get_env("SPACES_ACCESS_KEY_ID")
    secret_key = get_env("SPACES_SECRET_ACCESS_KEY")

    force_path_style            = false
    skip_credentials_validation = true
    skip_metadata_api_check     = true
    skip_bucket_versioning      = true
    skip_bucket_ssencryption    = true
    skip_bucket_root_access              = true
    skip_bucket_enforced_tls             = true
    skip_bucket_public_access_blocking   = true
  }

  generate = {
    path      = "backend.tf"
    if_exists = "overwrite_terragrunt"
  }
}

# Generate provider configuration
generate "provider" {
  path      = "provider.tf"
  if_exists = "overwrite_terragrunt"
  contents  = <<-EOF
    provider "digitalocean" {
      # Token via DIGITALOCEAN_TOKEN env var
    }
  EOF
}

# Generate terraform version constraints
generate "versions" {
  path      = "versions.tf"
  if_exists = "overwrite_terragrunt"
  contents  = <<-EOF
    terraform {
      required_version = ">= 1.3"

      required_providers {
        digitalocean = {
          source  = "digitalocean/digitalocean"
          version = "~> 2.36"
        }
      }
    }
  EOF
}
