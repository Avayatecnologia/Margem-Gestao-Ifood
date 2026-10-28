# Margem — precificação de delivery

Aplicativo local em português, com React/TypeScript, Fastify, SQLite nativo do Node e Decimal.js. Permite gerenciar múltiplos estabelecimentos com dados isolados. Não exige conta ou API de plataforma.

## Empresas e resultados por cliente

Há bases iFood com fonte e data em **Planos e taxas → Adicionar bases iFood nesta empresa**, incluindo entrega própria/parceira e frete grátis ao consumidor. A inclusão é idempotente, não substitui contratos ou preços, e cria mensalidades somente como despesas inativas. Consulte [referências e hipóteses](REFERENCIAS_IFOOD.md), especialmente a divergência pública de 3,2%/3,5% para pagamento online. Frete grátis mantém as comissões; custo de entrega precisa ser informado. Não há atualização automática pela internet das taxas ou dos contratos.

Em **Empresas**, cadastre ou altere nome, razão social, documento, responsável, contato e situação. Escolha o estabelecimento no seletor lateral ou no botão Acessar. Todos os cadastros, custos, vendas, preços, importações, backups e relatórios passam a pertencer à empresa selecionada. Trocar de empresa limpa os formulários e resultados em tela; cada aba guarda sua seleção separadamente.

Em **Resultados por empresa**, consulte o mesmo período para todos os clientes: receita, taxas, custos variáveis, contribuição, despesas fixas, resultado operacional e margem operacional. Há exportação CSV e opção de incluir arquivadas. Valores esperados continuam identificados. Isso é o resultado do estabelecimento, não o lucro de seus honorários de gestão.

O estabelecimento original mantém o banco `data/gestao.sqlite`, sem movimentação ou alteração dos pedidos anteriores. O cadastro central fica em `data/empresas.sqlite`; novas empresas têm bancos em `data/companies/<id>/gestao.sqlite`. A seleção é explícita em cada requisição, sem variável global de empresa ativa no servidor. Não há autenticação ou separação de permissões de operadores: é uma ferramenta local para o gestor autorizado a acessar todos os clientes.

O backup da tela é **por empresa** e identifica a origem. Não pode ser restaurado em outra empresa. Faça backup de cada estabelecimento; para conservar também o cadastro central e a estrutura completa ao trocar de computador, encerre o servidor e copie a pasta DATA_DIR inteira. Arquivos antigos sem identificação de empresa são restaurados somente no destino selecionado após confirmação. Empresas arquivadas permitem consulta, mas bloqueiam gravações até serem reativadas. Mantenha ao menos uma empresa ativa.

## Documentação para o usuário

- [Manual completo com 28 capítulos](MANUAL_DO_USUARIO.md): campos, parâmetros, cálculos, rotinas e solução de problemas.
- [Manual para leitura e impressão no navegador](MANUAL_DO_USUARIO.html): índice lateral navegável; abra o arquivo no navegador e use Ctrl+P para imprimir.
- [Guia rápido do primeiro cadastro](GUIA_DE_USO.md).

## Iniciar no Windows

**Operação principal no Docker:** abra o Docker Desktop, execute **INICIAR.bat** e acesse **http://127.0.0.1:3333/**. Para encerrar, use **PARAR.bat**. O iniciador pode ser fechado sem interromper o sistema. Consulte [Operação no Docker](DOCKER_OPERACAO.md) para dados, backup, atualização e recuperação.

O banco ativo fica no volume `margem_ifood99_data`, em `/app/data` no container. A pasta `data` do projeto foi preservada como cópia anterior à migração; não recebe novos lançamentos depois da troca. Execute **BACKUP_DOCKER.bat** para copiar a carteira completa para `backups` com validação de integridade.

**Modo local para desenvolvimento/recuperação:** requer Node.js 24 ou superior. Use uma cópia atualizada e separada de dados, definida por DATA_DIR, com o Docker parado para evitar conflito de porta. Nesta pasta:

```powershell
npm ci
npm run build
npm start
```

No modo local, fechar o terminal encerra o servidor. Para desenvolvimento: `npm run dev` e http://127.0.0.1:5173.

## Dados e recuperação

No Docker, use o volume e os procedimentos de DOCKER_OPERACAO.md. Os caminhos `data/gestao.sqlite`, `data/empresas.sqlite` e `data/companies` descritos para o modo local correspondem a `/app/data` no container. Histórico na tabela history; migração inicial registrada em migrations. SQLite usa WAL; não copie só o arquivo principal enquanto estiver aberto. Prefira o backup JSON por empresa ou o backup completo com pausa do serviço.

Para mudar o local: `$env:DATA_DIR='D:\MeusDados\Margem'` antes de iniciar. PORT altera a porta (padrão 3333). O arquivo .env.example documenta opções; .env não é carregado automaticamente. O servidor aceita apenas conexões locais. Não há login multiusuário nem hospedagem pública.

## Demonstração isolada

`npm run demo` cria somente `data/demo`. Depois, no PowerShell:

```powershell
$env:DATA_DIR='data/demo'
npm start
```

Para voltar aos seus dados: encerre o servidor, execute `Remove-Item Env:DATA_DIR` e reinicie. Valores da demonstração são fictícios, não taxas vigentes. Reexecutar a carga não apaga dados anteriores.

## Validação

`npm run check`, `npm test`, `npm run build`. Os testes usam pastas temporárias isoladas. Ver PLAN.md para resultados e limites verificados.

## Premissas e limites

- Margem de contribuição = receita menos taxas e custos variáveis. Resultado operacional = contribuição do período menos despesas fixas; rateio unitário não é descontado novamente.
- Despesas fixas são integrais por mês abrangido, mesmo em filtros de poucos dias. Condições contratuais de mensalidade são observações: cadastre apenas despesas efetivamente aplicáveis e ajuste sua vigência.
- Ajustes são atribuídos à venda de origem e considerados até a data final do relatório; não se trata de fluxo de caixa por data de estorno.
- Tributos são regras informadas pelo usuário, sem enquadramento fiscal automático. Não há emissão fiscal, estoque, integração com plataformas ou publicação automática de preços.
- Preços automáticos têm teto de R$ 1 milhão e não são calculados para regras com degraus; nesse caso, use simulação manual nas fronteiras. Cada regra arredonda em centavos, metade para cima. Recebível considera todas as regras anteriores; use a ordem do contrato.
- A regra percentual é aplicada à base total do pedido. Escopo por unidade é usado para valores fixos; bases não podem conter fórmulas livres. Frete de terceiros nunca é receita própria.
- Custo por pedido no produto é cobrado uma vez para cada produto distinto presente. Não repita o mesmo produto em duas linhas: consolide a quantidade. Use taxa do plano para um custo global do pedido.
- Pedidos e planos preservam fotografias. Novos planos podem usar nomes de versão distintos; versões do mesmo nome exigem vigências sem sobreposição. Planos antigos continuam disponíveis para pedidos históricos.
- Categorias/fornecedores são cadastros auxiliares; exclusão é feita por arquivamento. Renomear uma categoria não altera retroativamente o texto já associado aos produtos.
- Importações aceitam no máximo 5.000 linhas / 20 MB, validam o lote e não sobrescrevem cadastros. Consultas e relatórios são adequados a operação local de pequeno estabelecimento.

## Organização técnica

`shared/finance.ts`: motor financeiro puro. `shared/schema.ts`: contratos validados compartilhados. `server/store.ts`: persistência, histórico e relatórios. `server/app.ts`: API e arquivos estáticos. `src/main.tsx`: interface. `tests`: referências numéricas e fluxo integrado. O banco armazena documentos tipados com índices primários e histórico, em vez de uma tabela por atributo; referências são validadas no domínio dentro das transações.

Dependências fixadas em package-lock.json. SQLite nativo evita compilação de módulos no Windows. Não há imagens, fontes ou serviços externos necessários à interface.
# Ajuste de compatibilidade

O compilador TypeScript 7 e executáveis nativos do esbuild não concluíram a execução nesta máquina. A implementação usa TypeScript 5.9.3, esbuild em WebAssembly (mesma API) e execução TypeScript nativa do Node 24 nos testes/desenvolvimento. Vite 7.3.7 e esbuild-wasm 0.28.2 foram selecionados com auditoria de dependências sem alertas no momento da entrega. As versões efetivas e suas integrações estão travadas no package-lock.json.
