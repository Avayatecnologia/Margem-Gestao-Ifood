# Operação no Docker

## Uso diário

1. Abra o Docker Desktop e aguarde o mecanismo ficar pronto.
2. Execute **INICIAR.bat** nesta pasta.
3. Acesse **http://127.0.0.1:3333/**.

O programa fica em segundo plano. Fechar o navegador ou o iniciador não encerra o container. Para pausar, execute **PARAR.bat**. O reinício automático depende de o Docker Desktop estar funcionando.

Em uma instalação nova sem dados anteriores, crie explicitamente o volume com `docker volume create margem_ifood99_data`, depois execute `docker compose up -d --build --wait app`. Para migração/recuperação, importe o backup no volume vazio antes de iniciar. O iniciador recusa começar se o volume estiver ausente, para evitar confundir um banco vazio com os dados anteriores.

## Onde estão os dados

O serviço `app` do projeto Compose `margem-ifood99` usa o volume persistente **margem_ifood99_data**, montado em `/app/data`. Ele contém `gestao.sqlite`, `empresas.sqlite`, `companies/<id>/gestao.sqlite` e as cópias auxiliares existentes. SQLite continua sendo o banco; Docker mudou a forma de executar e armazenar a aplicação.

No Docker Desktop, consulte a área Volumes para localizar esse volume. A pasta `data` original do projeto foi preservada como cópia anterior à migração e **não é mais a base em uso**. Não execute o modo local em paralelo apontando para dados antigos, nem substitua o volume por essa pasta sem conferir um backup atualizado.

## Backups

- **Por estabelecimento:** use Dados e backup no aplicativo, como antes.
- **Toda a carteira:** execute **BACKUP_DOCKER.bat**, ou `powershell -NoProfile -File .\BACKUP_DOCKER.ps1` nesta pasta. O procedimento pausa brevemente o serviço, copia todos os bancos e o cadastro central para uma nova pasta em `backups`, verifica a integridade e reinicia o serviço se ele estava em execução.
- **Código:** deve ser versionado no GitHub, separado dos bancos e backups dos clientes.

Cada backup completo contém `data/` e `manifest.json`, com contagens, hashes dos registros e arquivos. Guarde uma cópia fora deste computador. A existência de um volume persistente não substitui um backup.

O backup inicial antes da migração também inclui a pasta `codigo/`. Os backups regulares do Docker cobrem os dados; o código permanece no repositório Git.

## Verificações e atualização

Na pasta do projeto:

```powershell
docker compose ps
docker compose logs --tail 50 app
docker compose up -d --build --wait app
```

Faça backup antes de atualizar. A reconstrução da imagem executa os testes e o build; a aplicação usa o mesmo volume depois. O estado esperado do serviço é **healthy**.

O endereço continua local: a porta do computador é publicada somente em `127.0.0.1`. O processo no container escuta em `0.0.0.0` internamente para permitir esse encaminhamento. O sistema ainda não tem autenticação ou permissões por operador para exposição pública.

## Recuperação em outro volume

Não sobrescreva um volume existente para testar um backup. Crie um novo volume, importe a cópia e valide em outra porta antes de alterar a execução principal. Exemplo técnico, substituindo o caminho e o nome conforme a recuperação pretendida:

```powershell
docker volume create margem_recuperacao
docker run --rm --network none --user 0 --env DATA_DIR=/app/data --mount "type=volume,source=margem_recuperacao,target=/app/data" --mount "type=bind,source=D:\CAMINHO\DO\BACKUP\data,target=/restore,readonly" margem-ifood99:local node scripts/data-tools.mjs import /restore /app/data
docker run -d --name margem-recuperacao --init --read-only --tmpfs /tmp --publish 127.0.0.1:3334:3333 --mount "type=volume,source=margem_recuperacao,target=/app/data" margem-ifood99:local
```

O importador recusa destinos não vazios. O endereço de teste será `http://127.0.0.1:3334/`. O manifesto permite conferir que os registros são iguais à origem. Em recuperação definitiva, configure o volume pretendido no Compose e mantenha uma cópia do volume anterior até validar a troca.

## Voltar ao modo local

1. Faça backup completo e atual do Docker.
2. Pare o serviço Docker.
3. Copie a pasta `data/` desse backup para uma pasta nova de recuperação; não use a cópia anterior à migração como se estivesse atualizada.
4. Com Node.js 24 ou superior, execute `npm ci`, `npm run build`, configure `DATA_DIR` para a pasta recuperada e execute `npm start`.
5. Confira clientes, produtos, planos e vendas antes de voltar a operar.

## GitHub

O repositório deve conter código, Dockerfile, Compose, testes, manuais e modelos sem dados reais. As pastas `data`, `backups`, evidências locais, arquivos SQLite e arquivos de ambiente com credenciais estão excluídos do Git e do contexto de build Docker. Não envie o backup dos clientes ao GitHub como parte da cópia do código.

Para publicar, é necessário repositório de destino e autenticação autorizada na conta. Credenciais não devem ser colocadas em arquivos do projeto.
