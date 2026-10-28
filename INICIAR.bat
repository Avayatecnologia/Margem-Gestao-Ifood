@echo off
cd /d "%~dp0"
docker volume inspect margem_ifood99_data >nul 2>&1
if errorlevel 1 (
 echo Volume de dados nao encontrado. Consulte DOCKER_OPERACAO.md antes de criar uma base nova ou restaurar um backup.
 goto falha
)
docker compose up -d --wait app
if errorlevel 1 goto falha
echo Sistema disponivel em http://127.0.0.1:3333/
echo O sistema continua funcionando mesmo ao fechar esta janela.
:falha
pause
