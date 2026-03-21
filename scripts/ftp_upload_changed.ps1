param(
    [string[]]$Files,
    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

$repoRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
Set-Location $repoRoot

$configFile = Join-Path $repoRoot '.env.ftp.local.ps1'
if (Test-Path $configFile) {
    . $configFile
}

$ftpHost = $env:FTP_HOST
$ftpPort = if ($env:FTP_PORT) { $env:FTP_PORT } else { '21' }
$ftpUser = $env:FTP_USER
$ftpPass = $env:FTP_PASS
$ftpBaseDir = $env:FTP_BASE_DIR

if ([string]::IsNullOrWhiteSpace($ftpHost) -or
    [string]::IsNullOrWhiteSpace($ftpUser) -or
    [string]::IsNullOrWhiteSpace($ftpPass)) {
    throw "Missing FTP config. Set FTP_HOST/FTP_USER/FTP_PASS in .env.ftp.local.ps1 or environment variables."
}

function Get-UploadFiles {
    param([string[]]$SelectedFiles)

    if ($SelectedFiles -and $SelectedFiles.Count -gt 0) {
        return $SelectedFiles
    }

    $statusLines = @(git status --porcelain=v1)
    if (-not $statusLines -or ($statusLines.Count -eq 1 -and [string]::IsNullOrWhiteSpace($statusLines[0]))) {
        return @()
    }

    $items = New-Object System.Collections.Generic.List[string]
    foreach ($line in $statusLines) {
        if ([string]::IsNullOrWhiteSpace($line) -or $line.Length -lt 4) {
            continue
        }

        $status = $line.Substring(0, 2)
        $pathText = $line.Substring(3).Trim()

        if ($status.Contains('D')) {
            Write-Warning "Skipping deleted path: $pathText"
            continue
        }

        if ($pathText.Contains(' -> ')) {
            $pathText = ($pathText -split ' -> ', 2)[1].Trim()
        }

        if ([string]::IsNullOrWhiteSpace($pathText)) {
            continue
        }

        $fullPath = Join-Path $repoRoot $pathText
        if (-not (Test-Path $fullPath -PathType Leaf)) {
            Write-Warning "Skipping non-file path: $pathText"
            continue
        }

        [void]$items.Add($pathText)
    }

    return @($items | Select-Object -Unique)
}

function Should-SkipDefaultUpload {
    param([string]$RelativePath)

    $normalized = $RelativePath.Replace('\', '/').Trim()
    $skipExact = @(
        '.gitignore',
        'package.json',
        'package-lock.json',
        'playwright.config.js',
        'requirements.txt'
    )
    $skipPrefixes = @(
        'article_management/sql/',
        'docs/',
        'scripts/',
        'tests/'
    )

    if ($skipExact -contains $normalized) {
        return $true
    }

    foreach ($prefix in $skipPrefixes) {
        if ($normalized.StartsWith($prefix, [System.StringComparison]::OrdinalIgnoreCase)) {
            return $true
        }
    }

    return $false
}

function Get-FtpUrl {
    param([string]$RelativePath)

    $normalizedPath = $RelativePath.Replace('\', '/').TrimStart('/')
    $normalizedBase = [string]$ftpBaseDir
    $normalizedBase = $normalizedBase.Replace('\', '/').Trim('/')

    if (-not [string]::IsNullOrWhiteSpace($normalizedBase)) {
        return "ftp://${ftpHost}:${ftpPort}/${normalizedBase}/${normalizedPath}"
    }

    return "ftp://${ftpHost}:${ftpPort}/${normalizedPath}"
}

$uploadFiles = @(Get-UploadFiles -SelectedFiles $Files)
$uploadFiles = @($uploadFiles | Where-Object { -not (Should-SkipDefaultUpload $_) })
if (-not $uploadFiles -or $uploadFiles.Count -eq 0) {
    Write-Host 'No changed files to upload.'
    exit 0
}

Write-Host ("Preparing to upload {0} file(s)." -f $uploadFiles.Count)

foreach ($file in $uploadFiles) {
    $localPath = Join-Path $repoRoot $file
    $url = Get-FtpUrl -RelativePath $file
    $remoteLabel = $file.Replace('\', '/')

    if ($DryRun) {
        Write-Host ("[dry-run] {0}" -f $remoteLabel)
        continue
    }

    Write-Host ("Uploading {0}" -f $remoteLabel)
    & curl.exe --fail --show-error --silent --ftp-pasv --user "${ftpUser}:${ftpPass}" --ftp-create-dirs -T $localPath $url | Out-Null
}

if ($DryRun) {
    Write-Host 'Dry run complete.'
} else {
    Write-Host 'Upload complete.'
}
