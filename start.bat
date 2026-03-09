@echo off
echo Starting Resume to Portfolio Website Generator...
echo.
set "LAN_IP="
for /f %%i in ('powershell -NoProfile -Command "(Get-NetIPAddress -AddressFamily IPv4 ^| Where-Object { $_.IPAddress -match '^(10\\.|192\\.168\\.|172\\.(1[6-9]|2\\d|3[0-1])\\.)' } ^| Select-Object -First 1 -ExpandProperty IPAddress)"') do set "LAN_IP=%%i"
echo Frontend will be available at: http://localhost:3000
if not "%LAN_IP%"=="" echo Frontend (LAN) may be available at: http://%LAN_IP%:3000
echo Backend API will be available at: http://localhost:8000
if not "%LAN_IP%"=="" echo Backend API (LAN) may be available at: http://%LAN_IP%:8000
echo API Docs will be available at: http://localhost:8000/docs
if not "%LAN_IP%"=="" echo API Docs (LAN) may be available at: http://%LAN_IP%:8000/docs
echo.
echo Press Ctrl+C to stop all servers
echo.

start "Frontend Server" cmd /k "cd frontend && npm run dev"
start "Backend Server" cmd /k "cd backend && ..\.venv\Scripts\python.exe main.py"

echo Both servers are starting in separate windows...
