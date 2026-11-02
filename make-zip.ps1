$ErrorActionPreference = 'Stop'

$currentDir = Get-Location
$staging = Join-Path $env:TEMP 'geet-enterprise-deploy'

Write-Host "Creating staging directory at $staging..."
if (Test-Path $staging) {
    Remove-Item -Recurse -Force $staging
}
New-Item -ItemType Directory -Path $staging | Out-Null

# Copy root files
$rootFiles = @('app.js', 'server.js', 'package.json', '.htaccess', '.env', 'DEPLOYMENT_HPANEL.md', 'README.md', '.gitignore')
foreach ($f in $rootFiles) {
    $srcPath = Join-Path $currentDir $f
    if (Test-Path $srcPath) {
        Copy-Item -Path $srcPath -Destination $staging -Force
    }
}

# Copy server (excluding node_modules, database.sqlite)
$serverStaging = Join-Path $staging 'server'
New-Item -ItemType Directory -Path $serverStaging | Out-Null
$serverItems = Get-ChildItem (Join-Path $currentDir 'server') | Where-Object { $_.Name -notin @('node_modules', 'database.sqlite') }
foreach ($item in $serverItems) {
    Copy-Item -Path $item.FullName -Destination $serverStaging -Recurse -Force
}

# Copy client (excluding node_modules, dist)
$clientStaging = Join-Path $staging 'client'
New-Item -ItemType Directory -Path $clientStaging | Out-Null
$clientItems = Get-ChildItem (Join-Path $currentDir 'client') | Where-Object { $_.Name -notin @('node_modules', 'dist') }
foreach ($item in $clientItems) {
    Copy-Item -Path $item.FullName -Destination $clientStaging -Recurse -Force
}

# Create zip in root
$zipPath = Join-Path $currentDir 'geet-enterprise-deploy.zip'
if (Test-Path $zipPath) {
    Remove-Item -Force $zipPath
}

Write-Host "Compressing to $zipPath..."
Compress-Archive -Path "$staging\*" -DestinationPath $zipPath -Force

# Also copy directly to the user's Downloads root
$downloadsZip = "C:\Users\piyus\Downloads\geet-enterprise-deploy.zip"
Copy-Item -Path $zipPath -Destination $downloadsZip -Force

$zipItem = Get-Item $zipPath
Write-Host "SUCCESS!"
Write-Host "Archive Path: $($zipItem.FullName)"
Write-Host "Archive Size: $([math]::Round($zipItem.Length / 1MB, 2)) MB ($($zipItem.Length) bytes)"
