# Terraform — MCP Ops on AWS ECS

## What this creates

- VPC (public + private subnets, NAT, IGW)
- Application Load Balancer (HTTP :80) with health check on `/health`
- ECS Fargate cluster + service for `mcp-server`
- ECR repository
- RDS PostgreSQL (`db.t4g.micro` by default)
- Secrets Manager secret (`MCP_SERVER_SECRET`, `DATABASE_URL`)
- CloudWatch log group `/ecs/mcp-ops`

## Cost note

Expect on the order of **tens of USD/month** while running (NAT Gateway + ALB + RDS dominate). Set a billing alarm (e.g. $20) and tear down when idle:

```bash
cd infrastructure/terraform
terraform destroy
```

## Apply

```bash
cd infrastructure/terraform
terraform init
terraform plan
terraform apply
```

After apply:

1. Push an image to the ECR URL from `ecr_repository_url`.
2. Seed RDS (run `infrastructure/docker/init.sql` via a one-off bastion/SSM or `psql` tunnel).
3. Set GitHub secrets/vars: `AWS_ROLE_ARN`, `AWS_REGION`, `ECR_REPOSITORY`, `ECS_CLUSTER`, `ECS_SERVICE`.
4. Update `infrastructure/aws/task-definition.json` role/secret ARNs from Terraform outputs (or rely on Terraform-managed task definition and only use GHA image force-deploy).

## Client against AWS

```bash
export MCP_SERVER_URL="$(terraform output -raw mcp_url)"
export MCP_SERVER_SECRET="$(aws secretsmanager get-secret-value --secret-id mcp-ops/app --query SecretString --output text | jq -r .MCP_SERVER_SECRET)"
pnpm --filter @mcp-ops/mcp-client start list-tools
```
