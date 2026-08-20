@echo off
setlocal EnableExtensions
cd /d "%~dp0.."

if "%~1"=="" (
  echo Usage: scripts\call-tool.cmd ^<tool-name^> [json-args]
  echo.
  echo CMD cannot pass JSON reliably — set MCP_TOOL_ARGS first:
  echo   set MCP_TOOL_ARGS={"query":"ECS"}
  echo   scripts\call-tool.cmd search_documents
  echo.
  echo   set MCP_TOOL_ARGS={"sql":"SELECT name, status FROM services","limit":10}
  echo   scripts\call-tool.cmd query_database
  echo.
  echo PowerShell users: .\scripts\call-tool.ps1 search_documents '{"query":"ECS"}'
  exit /b 1
)

set "TOOL=%~1"
if not "%~2"=="" set "MCP_TOOL_ARGS=%~2"

if not exist "apps\mcp-client\dist\cli.js" (
  echo Client not built. Run: pnpm.cmd build
  exit /b 1
)

node "apps\mcp-client\dist\cli.js" call-tool %TOOL%
exit /b %ERRORLEVEL%
