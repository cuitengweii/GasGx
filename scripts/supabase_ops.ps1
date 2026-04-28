param(
    [Parameter(Position = 0)]
    [ValidateSet('check', 'auth-email', 'deploy-function')]
    [string]$Command = 'check',

    [Parameter(Position = 1)]
    [ValidateSet('site-chat', 'auth-telegram', 'quote-translate')]
    [string]$FunctionName
)

$ErrorActionPreference = 'Stop'

$defaultProjectRef = 'mkpcliytqudclkwtewru'
$repoRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$supabaseCli = Join-Path $repoRoot 'tools\bin\supabase\supabase.exe'
$emailTemplateScript = Join-Path $repoRoot 'scripts\update_supabase_auth_email_templates.mjs'

Set-Location $repoRoot

function Import-UserSupabaseEnvironment {
    $userToken = [Environment]::GetEnvironmentVariable('SUPABASE_ACCESS_TOKEN', 'User')
    if ([string]::IsNullOrWhiteSpace($env:SUPABASE_ACCESS_TOKEN) -and -not [string]::IsNullOrWhiteSpace($userToken)) {
        $env:SUPABASE_ACCESS_TOKEN = $userToken
    }

    $userProjectRef = [Environment]::GetEnvironmentVariable('SUPABASE_PROJECT_REF', 'User')
    if ([string]::IsNullOrWhiteSpace($env:SUPABASE_PROJECT_REF) -and -not [string]::IsNullOrWhiteSpace($userProjectRef)) {
        $env:SUPABASE_PROJECT_REF = $userProjectRef
    }

    if ([string]::IsNullOrWhiteSpace($env:SUPABASE_PROJECT_REF)) {
        $env:SUPABASE_PROJECT_REF = $defaultProjectRef
    }
}

function Test-RequiredSupabaseState {
    if (-not (Test-Path $supabaseCli -PathType Leaf)) {
        throw "Supabase CLI not found: $supabaseCli"
    }

    if ([string]::IsNullOrWhiteSpace($env:SUPABASE_PROJECT_REF)) {
        throw 'Missing SUPABASE_PROJECT_REF.'
    }

    if ([string]::IsNullOrWhiteSpace($env:SUPABASE_ACCESS_TOKEN)) {
        throw 'Missing SUPABASE_ACCESS_TOKEN. Set it as a Windows User environment variable.'
    }
}

function Invoke-SupabaseCheck {
    $cliStatus = if (Test-Path $supabaseCli -PathType Leaf) { 'present' } else { 'missing' }
    $tokenStatus = if ([string]::IsNullOrWhiteSpace($env:SUPABASE_ACCESS_TOKEN)) { 'missing' } else { 'present' }
    $projectRef = if ([string]::IsNullOrWhiteSpace($env:SUPABASE_PROJECT_REF)) { $defaultProjectRef } else { $env:SUPABASE_PROJECT_REF }

    Write-Host "Supabase CLI: $cliStatus"
    if ($cliStatus -eq 'present') {
        & $supabaseCli --version
    }
    Write-Host "Project ref: $projectRef"
    Write-Host "SUPABASE_ACCESS_TOKEN: $tokenStatus"
}

function Invoke-AuthEmailSync {
    Test-RequiredSupabaseState

    if (-not (Test-Path $emailTemplateScript -PathType Leaf)) {
        throw "Auth email template sync script not found: $emailTemplateScript"
    }

    Write-Host "Syncing Supabase Auth email templates for project $env:SUPABASE_PROJECT_REF"
    & node $emailTemplateScript
}

function Invoke-FunctionDeploy {
    param([string]$Name)

    if ([string]::IsNullOrWhiteSpace($Name)) {
        throw 'Missing function name. Use: scripts\supabase_ops.ps1 deploy-function site-chat'
    }

    Test-RequiredSupabaseState

    Write-Host "Deploying Supabase function '$Name' to project $env:SUPABASE_PROJECT_REF"
    & $supabaseCli functions deploy $Name --project-ref $env:SUPABASE_PROJECT_REF --no-verify-jwt
}

try {
    Import-UserSupabaseEnvironment

    switch ($Command) {
        'check' {
            Invoke-SupabaseCheck
        }
        'auth-email' {
            Invoke-AuthEmailSync
        }
        'deploy-function' {
            Invoke-FunctionDeploy -Name $FunctionName
        }
    }
} catch {
    [Console]::Error.WriteLine($_.Exception.Message)
    exit 1
}
