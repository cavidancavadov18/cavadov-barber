# Keep ONE Cloudflare quick-tunnel URL alive as long as possible.
# CRITICAL: never kill/restart cloudflared while the pinned URL still returns 200
# (restarting always gets a NEW random trycloudflare hostname).
$ErrorActionPreference = "Continue"
$Root = "C:\Users\Cavadov\Desktop\BARBER-shop"
$urlFile = Join-Path $Root "public-tunnel-url.txt"
$cf = Join-Path $env:LOCALAPPDATA "cloudflared\cloudflared.exe"
$log = Join-Path $env:TEMP "cloudflared-out.log"
Set-Location $Root

function Test-Local {
  try {
    $r = Invoke-WebRequest -Uri "http://localhost:3000/az" -UseBasicParsing -TimeoutSec 4
    return $r.StatusCode -eq 200
  } catch { return $false }
}

function Test-Url([string]$url) {
  if (-not $url) { return $false }
  try {
    $code = & curl.exe -s -o NUL -w "%{http_code}" --max-time 20 $url
    return ($code -eq "200")
  } catch { return $false }
}

function Get-PinnedUrl {
  if (Test-Path $urlFile) {
    return ((Get-Content $urlFile -Raw).Trim())
  }
  return $null
}

function Ensure-Next {
  if (Test-Local) { return $true }
  Write-Host "Starting Next.js..."
  Start-Process -FilePath "npm" -ArgumentList "run","dev" -WorkingDirectory $Root -WindowStyle Hidden
  $deadline = (Get-Date).AddSeconds(50)
  do {
    Start-Sleep -Seconds 3
    if (Test-Local) { return $true }
  } while ((Get-Date) -lt $deadline)
  return $false
}

if (-not (Ensure-Next)) {
  Write-Host "Next.js failed to start"
  exit 1
}

$pinned = Get-PinnedUrl
$cfProc = Get-Process -Name cloudflared -ErrorAction SilentlyContinue

# 1) Pinned URL still works -> do NOTHING (keeps same hostname)
if ($pinned -and (Test-Url $pinned)) {
  Write-Host "Pinned URL still alive (keeping process): $pinned"
  exit 0
}

# 2) cloudflared running but pinned URL dead -> process is zombie; must replace
if ($cfProc) {
  Write-Host "cloudflared running but URL dead - replacing (hostname cannot be reused)"
  $cfProc | Stop-Process -Force -ErrorAction SilentlyContinue
  Start-Sleep -Seconds 2
}

if (-not (Test-Path $cf)) {
  Write-Host "cloudflared missing"
  exit 1
}

Write-Host "Starting Cloudflare quick tunnel..."
Remove-Item $log -Force -ErrorAction SilentlyContinue
Start-Process -FilePath $cf -ArgumentList @(
  "tunnel","--url","http://localhost:3000","--no-autoupdate","--protocol","http2"
) -RedirectStandardError $log -WindowStyle Hidden

$deadline = (Get-Date).AddSeconds(45)
do {
  Start-Sleep -Seconds 3
  if (-not (Test-Path $log)) { continue }
  $m = Select-String -Path $log -Pattern "https://[a-z0-9-]+\.trycloudflare\.com" | Select-Object -Last 1
  if (-not $m) { continue }
  $base = $m.Matches.Value
  $url = "$base/az"
  if (Test-Url $url) {
    Set-Content -Path $urlFile -Value $url -Encoding utf8
    Write-Host "Public URL: $url"
    Write-Host "KEEP THIS PROCESS ALIVE - do not restart cloudflared or the link changes."
    exit 0
  }
} while ((Get-Date) -lt $deadline)

Write-Host "Tunnel started but health check pending"
if (Test-Path $log) { Get-Content $log -Tail 25 }
exit 1
