param([string]$BackupRoot = 'backups')
$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
docker volume inspect margem_ifood99_data *> $null
if ($LASTEXITCODE -ne 0) { throw 'Volume de dados não encontrado. Não foi criado backup vazio.' }
$backupParent = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot $BackupRoot))
New-Item -ItemType Directory -Force -Path $backupParent | Out-Null
$destination = Join-Path $backupParent ('docker-' + (Get-Date -Format 'yyyyMMdd-HHmmss-fff'))
New-Item -ItemType Directory -Path $destination | Out-Null
$wasRunning = @(docker compose ps --status running -q app).Count -gt 0
try {
    if ($wasRunning) {
        docker compose stop app
        if ($LASTEXITCODE -ne 0) { throw 'Não foi possível pausar o aplicativo; backup cancelado.' }
    }
    docker run --rm --network none --user 0 --mount 'type=volume,source=margem_ifood99_data,target=/app/data,readonly' --mount "type=bind,source=$destination,target=/backup" margem-ifood99:local node scripts/data-tools.mjs export /app/data /backup
    if ($LASTEXITCODE -ne 0) { throw 'Falha ao copiar ou verificar os dados; consulte a saída anterior.' }
    Write-Output "Backup completo e validado: $destination"
} finally {
    if ($wasRunning) {
        docker compose start app
        if ($LASTEXITCODE -ne 0) { Write-Warning 'Reinicie o aplicativo com INICIAR.bat.' }
    }
}
