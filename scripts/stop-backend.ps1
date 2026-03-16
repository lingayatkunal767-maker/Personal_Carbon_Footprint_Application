param(
    [int]$Port = 8081
)

$ErrorActionPreference = 'Stop'

function Get-Listener {
    param([int]$TargetPort)

    return Get-NetTCPConnection -LocalPort $TargetPort -State Listen -ErrorAction SilentlyContinue |
        Select-Object -First 1
}

$listener = Get-Listener -TargetPort $Port
if (-not $listener) {
    Write-Host "[INFO] No process is listening on port $Port. Backend is already stopped."
    exit 0
}

$pidToStop = [int]$listener.OwningProcess
$proc = Get-CimInstance Win32_Process -Filter "ProcessId = $pidToStop" -ErrorAction SilentlyContinue

if ($proc) {
    Write-Host "[INFO] Stopping process on port $Port"
    Write-Host "       PID: $pidToStop"
    Write-Host "       Name: $($proc.Name)"
} else {
    Write-Host "[INFO] Stopping process on port $Port (PID $pidToStop)"
}

Stop-Process -Id $pidToStop -Force -ErrorAction Stop

for ($i = 0; $i -lt 10; $i++) {
    Start-Sleep -Seconds 1
    if (-not (Get-Listener -TargetPort $Port)) {
        Write-Host "[OK] Port $Port is now free."
        exit 0
    }
}

Write-Error "[ERROR] Port $Port is still in use after stop attempt."
exit 1
