param(
    [int]$Port = 8081,
    [switch]$Restart
)

$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Resolve-Path (Join-Path $scriptDir '..\backend')

function Get-Listener {
    param([int]$TargetPort)

    return Get-NetTCPConnection -LocalPort $TargetPort -State Listen -ErrorAction SilentlyContinue |
        Select-Object -First 1
}

function Get-ProcessInfo {
    param([int]$OwnerId)

    return Get-CimInstance Win32_Process -Filter "ProcessId = $OwnerId" -ErrorAction SilentlyContinue
}

function Wait-ForPortFree {
    param(
        [int]$TargetPort,
        [int]$TimeoutSeconds = 30
    )

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        if (-not (Get-Listener -TargetPort $TargetPort)) {
            return $true
        }
        Start-Sleep -Milliseconds 500
    }

    return -not (Get-Listener -TargetPort $TargetPort)
}

function Test-TrackerProcess {
    param($ProcessInfo)

    if (-not $ProcessInfo) { return $false }
    $cmd = [string]$ProcessInfo.CommandLine
    return $cmd -match 'com\.sustainability\.tracker\.TrackerApplication' -or $cmd -match '\\backend\\target\\classes'
}

function Get-RealMavenCommand {
    $allMvn = Get-Command mvn -All -ErrorAction SilentlyContinue
    foreach ($cmd in $allMvn) {
        if ($cmd.Source -and -not $cmd.Source.EndsWith('backend\\mvn.cmd', [System.StringComparison]::OrdinalIgnoreCase)) {
            return $cmd.Source
        }
    }

    if (Test-Path 'C:\maven\apache-maven-3.9.6\bin\mvn.cmd') {
        return 'C:\maven\apache-maven-3.9.6\bin\mvn.cmd'
    }

    return $null
}

$realMvn = Get-RealMavenCommand
if (-not $realMvn) {
    Write-Error '[ERROR] Maven executable was not found. Install Maven or configure MAVEN_HOME/PATH.'
    exit 1
}

$listener = Get-Listener -TargetPort $Port
if ($listener) {
    $listenerOwnerId = [int]$listener.OwningProcess
    $proc = Get-ProcessInfo -OwnerId $listenerOwnerId

    if (Test-TrackerProcess -ProcessInfo $proc) {
        if (-not $Restart) {
            Write-Host "[INFO] Backend is already running on http://localhost:$Port (PID $listenerOwnerId)."
            Write-Host '[INFO] Use scripts/stop-backend.ps1 first, or rerun this script with -Restart.'
            exit 0
        }

        Write-Host "[INFO] Restart requested. Stopping existing backend PID $listenerOwnerId..."
        Stop-Process -Id $listenerOwnerId -Force -ErrorAction Stop

        if (-not (Wait-ForPortFree -TargetPort $Port -TimeoutSeconds 15)) {
            $remainingListener = Get-Listener -TargetPort $Port
            if ($remainingListener) {
                $remainingPid = [int]$remainingListener.OwningProcess
                $remainingProc = Get-ProcessInfo -OwnerId $remainingPid

                if (Test-TrackerProcess -ProcessInfo $remainingProc) {
                    Write-Host "[WARN] Port $Port is still owned by tracker PID $remainingPid. Retrying force stop..."
                    Stop-Process -Id $remainingPid -Force -ErrorAction SilentlyContinue
                    [void](Wait-ForPortFree -TargetPort $Port -TimeoutSeconds 15)
                }
            }
        }

        $listenerAfterStop = Get-Listener -TargetPort $Port
        if ($listenerAfterStop) {
            $blockingPid = [int]$listenerAfterStop.OwningProcess
            $blockingProc = Get-ProcessInfo -OwnerId $blockingPid
            Write-Error "[ERROR] Port $Port is still in use after stop attempt."
            if ($blockingProc) {
                Write-Host "[INFO] Blocking process: $($blockingProc.Name) (PID $blockingPid)"
                Write-Host "[INFO] Command line: $($blockingProc.CommandLine)"
            }
            exit 1
        }
    } else {
        Write-Error "[ERROR] Port $Port is occupied by another process (PID $listenerOwnerId). Stop it manually before starting backend."
        if ($proc) {
            Write-Host "[INFO] Blocking process: $($proc.Name)"
            Write-Host "[INFO] Command line: $($proc.CommandLine)"
        }
        exit 1
    }
}

Write-Host "[INFO] Starting backend from $backendDir"
Set-Location $backendDir

& $realMvn spring-boot:run
exit $LASTEXITCODE
