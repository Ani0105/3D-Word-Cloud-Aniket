param(
  [int]$BackendPort = 8000,
  [int]$FrontendPort = 5173
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $root "backend"
$frontendDir = Join-Path $root "frontend"
$venvDir = Join-Path $root ".venv"
$pythonExe = Join-Path $venvDir "Scripts\\python.exe"
$pipExe = Join-Path $venvDir "Scripts\\pip.exe"

Write-Host "Project root: $root"

if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
  throw "Python is required. Install Python 3.10+ and try again."
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  throw "Node.js/npm is required. Install Node.js and try again."
}

if (-not (Test-Path $venvDir)) {
  Write-Host "Creating virtual environment..."
  python -m venv $venvDir
}

Write-Host "Installing backend dependencies..."
& $pythonExe -m pip install --upgrade pip
& $pipExe install -r (Join-Path $backendDir "requirements.txt")

Write-Host "Installing frontend dependencies..."
Push-Location $frontendDir
npm install
Pop-Location

Write-Host "Starting backend at http://localhost:$BackendPort ..."
$backendProcess = Start-Process -FilePath $pythonExe `
  -ArgumentList @("-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "$BackendPort", "--reload") `
  -WorkingDirectory $backendDir `
  -PassThru

Write-Host "Starting frontend at http://localhost:$FrontendPort ..."
$frontendProcess = Start-Process -FilePath "npm.cmd" `
  -ArgumentList @("run", "dev", "--", "--host", "0.0.0.0", "--port", "$FrontendPort") `
  -WorkingDirectory $frontendDir `
  -PassThru

Write-Host ""
Write-Host "Application is starting..."
Write-Host "Frontend: http://localhost:$FrontendPort"
Write-Host "Backend:  http://localhost:$BackendPort/health"
Write-Host "Press Ctrl+C to stop both servers."

try {
  while ($true) {
    Start-Sleep -Seconds 2

    if ($backendProcess.HasExited) {
      throw "Backend process exited unexpectedly."
    }
    if ($frontendProcess.HasExited) {
      throw "Frontend process exited unexpectedly."
    }
  }
}
finally {
  Write-Host ""
  Write-Host "Stopping services..."
  if (-not $backendProcess.HasExited) {
    Stop-Process -Id $backendProcess.Id -Force
  }
  if (-not $frontendProcess.HasExited) {
    Stop-Process -Id $frontendProcess.Id -Force
  }
}
