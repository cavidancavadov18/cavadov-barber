# Background watchdog: keep Next.js + the CURRENT pinned tunnel URL alive.
# Never restarts cloudflared while the pinned URL returns 200.
$ErrorActionPreference = "Continue"
$script = "C:\Users\Cavadov\Desktop\BARBER-shop\scripts\keep-tunnel-alive.ps1"
$lock = Join-Path $env:TEMP "cavadov-tunnel-watch.lock"

# Single instance
if (Test-Path $lock) {
  $old = Get-Content $lock -ErrorAction SilentlyContinue
  if ($old -and (Get-Process -Id ([int]$old) -ErrorAction SilentlyContinue)) {
    exit 0
  }
}
Set-Content -Path $lock -Value $PID -Encoding ascii

# Reduce sleep risk while sharing the link
try {
  & powercfg /change standby-timeout-ac 0 | Out-Null
  & powercfg /change standby-timeout-dc 0 | Out-Null
  & powercfg /change monitor-timeout-ac 30 | Out-Null
} catch {}

while ($true) {
  try {
    & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $script | Out-Null
  } catch {}
  Start-Sleep -Seconds 60
}
