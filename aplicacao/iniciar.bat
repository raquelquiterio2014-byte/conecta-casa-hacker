@echo off
cd /d "%~dp0"
where py >nul 2>&1
if errorlevel 1 (
  python servidor.py
) else (
  py -3 servidor.py
)
pause
