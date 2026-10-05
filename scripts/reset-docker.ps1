$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

Write-Warning "This removes the AssetIQ Docker database volume. The next startup will re-import docker/mysql/init/*.sql."
$answer = Read-Host "Type RESET to continue"

if ($answer -ne "RESET") {
    Write-Host "Cancelled."
    exit 0
}

docker compose --env-file .env.docker down -v
Write-Host "Docker containers and database volume removed." -ForegroundColor Green
