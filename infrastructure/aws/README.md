# AWS task definition notes

`task-definition.json` is a **template** consumed by `.github/workflows/deploy.yml`.

After `terraform apply`, replace:

| Placeholder | Source |
|-------------|--------|
| `REPLACE_WITH_EXECUTION_ROLE_ARN` | IAM role `${project}-ecs-exec` |
| `REPLACE_WITH_TASK_ROLE_ARN` | IAM role `${project}-ecs-task` |
| `REPLACE_WITH_SECRET_ARN` | `terraform output -raw secrets_manager_arn` |
| `REPLACE_WITH_ECR_IMAGE` | Overwritten by the deploy workflow |

GitHub repository configuration:

- **Secret** `AWS_ROLE_ARN` — OIDC role that can push ECR + update ECS
- **Vars** `AWS_REGION`, `ECR_REPOSITORY`, `ECS_CLUSTER`, `ECS_SERVICE`

Cluster/service names default to `mcp-ops` / `mcp-ops-server` (match Terraform `project_name`).
