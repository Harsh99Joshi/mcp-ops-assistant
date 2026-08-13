output "alb_url" {
  value       = "http://${aws_lb.main.dns_name}"
  description = "Public ALB base URL (MCP at /mcp, health at /health)"
}

output "mcp_url" {
  value = "http://${aws_lb.main.dns_name}/mcp"
}

output "ecr_repository_url" {
  value = aws_ecr_repository.server.repository_url
}

output "ecs_cluster_name" {
  value = aws_ecs_cluster.main.name
}

output "ecs_service_name" {
  value = aws_ecs_service.server.name
}

output "secrets_manager_arn" {
  value = aws_secretsmanager_secret.app.arn
}

output "cloudwatch_log_group" {
  value = aws_cloudwatch_log_group.ecs.name
}

output "rds_endpoint" {
  value = aws_db_instance.postgres.address
}
