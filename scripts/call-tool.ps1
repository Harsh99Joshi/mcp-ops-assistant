# Call an MCP tool with JSON args (PowerShell only — do not run from cmd.exe).
#
# From cmd.exe use:  scripts\call-tool.cmd  (see that file for MCP_TOOL_ARGS)
#
# Usage:
#   .\scripts\call-tool.ps1 search_documents '{"query":"ECS"}'
#   .\scripts\call-tool.ps1 get_system_info '{}'
#   .\scripts\call-tool.ps1 query_database '{"sql":"SELECT name, status FROM services","limit":10}'

param(
  [Parameter(Mandatory = $true, Position = 0)]
  [string]$Tool,

  [Parameter(Mandatory = $true, Position = 1)]
  [string]$Json
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$Cli = Join-Path $Root "apps\mcp-client\dist\cli.js"

if (-not (Test-Path $Cli)) {
  Write-Error "Client not built. Run: .\pnpm.cmd build"
}

& node $Cli call-tool $Tool $Json
