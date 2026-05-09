param(
    [int]$Port = 8081
)

$ErrorActionPreference = 'Stop'

function Get-Listener {
    param([int]$TargetPort)

    return Get-NetTCPConnection -LocalPort $TargetPort -State Listen -ErrorAction SilentlyContinue |
        Select-Object -First 1
}

function Get-ProcessInfo {
    param([int]$OwnerId)

    return Get-CimInstance Win32_Process -Filter "ProcessId = $OwnerId" -ErrorAction SilentlyContinue
}

function Test-TrackerProcess {
    param($ProcessInfo)

    if (-not $ProcessInfo) { return $false }
    $cmd = [string]$ProcessInfo.CommandLine
    return $cmd -match 'com\.sustainability\.tracker\.TrackerApplication' -or $cmd -match '\\backend\\target\\classes'
}

$listener = Get-Listener -TargetPort $Port
if (-not $listener) {
    Write-Host "[INFO] No process is listening on port $Port. Backend is already stopped."
    exit 0
}

$pidToStop = [int]$listener.OwningProcess
$proc = Get-ProcessInfo -OwnerId $pidToStop

if ($proc -and -not (Test-TrackerProcess -ProcessInfo $proc)) {
    Write-Error "[ERROR] Port $Port is occupied by another process (PID $pidToStop). Refusing to stop it automatically."
    Write-Host "[INFO] Blocking process: $($proc.Name)"
    Write-Host "[INFO] Command line: $($proc.CommandLine)"
    exit 1
}

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
