variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "project_name" {
  type    = string
  default = "mcp-ops"
}

variable "ecr_repository" {
  type    = string
  default = "mcp-ops-server"
}

variable "db_instance_class" {
  type    = string
  default = "db.t4g.micro"
}
