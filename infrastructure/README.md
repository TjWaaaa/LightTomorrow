## Infrastructure

### Getting started

#### 1. Setup Terraform

Use GitLab as backend configuration to save the terraform state.

```sh
export GITLAB_ACCESS_TOKEN=
terraform init \
    -backend-config="address=https://gitlab.mi.hdm-stuttgart.de/api/v4/projects/9068/terraform/state/default" \
    -backend-config="lock_address=https://gitlab.mi.hdm-stuttgart.de/api/v4/projects/9068/terraform/state/default/lock" \
    -backend-config="unlock_address=https://gitlab.mi.hdm-stuttgart.de/api/v4/projects/9068/terraform/state/default/lock" \
    -backend-config="username=$GITLAB_USERNAME" \
    -backend-config="password=$GITLAB_ACCESS_TOKEN" \
    -backend-config="lock_method=POST" \
    -backend-config="unlock_method=DELETE" \
    -backend-config="retry_wait_min=5"
```

#### 2. Run terraform COMMAND

Repalce `COMMAND` with the terraform command you would like to run e.g.: `plan` or `apply`

```sh
export AWS_ACCESS_KEY_ID=
export AWS_DEFAULT_REGION=
export AWS_SECRET_ACCESS_KEY=
terraform COMMAND
```
