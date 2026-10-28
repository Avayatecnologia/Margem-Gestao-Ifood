@echo off
cd /d "%~dp0"
powershell -NoProfile -File "%~dp0BACKUP_DOCKER.ps1"
pause
