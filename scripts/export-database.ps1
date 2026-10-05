param(
    [string]$MySqlDump = "D:\xampp\mysql\bin\mysqldump.exe",
    [string]$Database = "belarc_assets",
    [string]$DatabaseUser = "root",
    [string]$DatabasePassword = "",
    [string]$DatabaseHost = "127.0.0.1",
    [int]$DatabasePort = 3306
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $MySqlDump)) {
    throw "mysqldump was not found at '$MySqlDump'. Pass -MySqlDump with the correct path."
}

$projectRoot = Split-Path -Parent $PSScriptRoot
$targetDirectory = Join-Path $projectRoot "docker\mysql\init"
$targetFile = Join-Path $targetDirectory "01-assetiq-data.sql"

New-Item -ItemType Directory -Force -Path $targetDirectory | Out-Null

$arguments = @(
    "--host=$DatabaseHost",
    "--port=$DatabasePort",
    "--user=$DatabaseUser",
    "--single-transaction",
    "--skip-lock-tables",
    "--routines",
    "--triggers",
    "--default-character-set=utf8mb4",
    $Database
)

if ($DatabasePassword) {
    $arguments = @("--password=$DatabasePassword") + $arguments
}

Write-Host "Exporting '$Database' to:" -ForegroundColor Cyan
Write-Host "  $targetFile" -ForegroundColor Cyan

$process = Start-Process -FilePath $MySqlDump -ArgumentList $arguments -NoNewWindow -Wait -PassThru -RedirectStandardOutput $targetFile

if ($process.ExitCode -ne 0) {
    if (Test-Path $targetFile) {
        Remove-Item $targetFile -Force
    }
    throw "mysqldump failed with exit code $($process.ExitCode)."
}

if (-not (Test-Path $targetFile) -or (Get-Item $targetFile).Length -eq 0) {
    throw "The database export did not produce a usable SQL file."
}

Write-Host "Database export complete." -ForegroundColor Green
Write-Host "The SQL dump will be imported automatically the first time the Docker database volume is created."
