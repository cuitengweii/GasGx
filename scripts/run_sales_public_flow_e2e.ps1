param(
    [ValidateSet('formal', 'execution', 'both')]
    [string]$Scope = 'both',
    [string]$AdminEmail = $env:GX_ADMIN_EMAIL,
    [string]$AdminPassword = $env:GX_ADMIN_PASSWORD,
    [string]$CustomerEmail = $env:GX_CUSTOMER_EMAIL
)

$ErrorActionPreference = 'Stop'

function New-CustomerEmail {
    $stamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
    return "codex-sales-e2e-$stamp@example.com"
}

if ([string]::IsNullOrWhiteSpace($AdminEmail)) {
    throw 'Missing admin email. Pass -AdminEmail or set GX_ADMIN_EMAIL.'
}

if ([string]::IsNullOrWhiteSpace($AdminPassword)) {
    throw 'Missing admin password. Pass -AdminPassword or set GX_ADMIN_PASSWORD.'
}

if ([string]::IsNullOrWhiteSpace($CustomerEmail)) {
    $CustomerEmail = New-CustomerEmail
}

$env:GX_ADMIN_EMAIL = $AdminEmail
$env:GX_ADMIN_PASSWORD = $AdminPassword
$env:GX_CUSTOMER_EMAIL = $CustomerEmail

$specs = switch ($Scope) {
    'formal' { @('tests/playwright/sales-formal-backend.spec.ts') }
    'execution' { @('tests/playwright/sales-execution-chain.spec.ts') }
    default { @(
        'tests/playwright/sales-formal-backend.spec.ts',
        'tests/playwright/sales-execution-chain.spec.ts'
    ) }
}

Write-Host "Sales public-flow E2E scope: $Scope"
Write-Host "Using admin email: $AdminEmail"
Write-Host "Using customer email: $CustomerEmail"

& npx playwright test --workers=1 @specs

if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}
