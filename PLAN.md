# Plano de implementação e validação

- [x] Motor decimal: custos, receitas, taxas, rateios e preços; casos de referência testados.
- [x] API local, SQLite, validação compartilhada, histórico e fotografias de vendas.
- [x] Interface conectada: cadastros, ficha técnica/combos, planos, preços e simulador.
- [x] Pedidos, ajustes, conferência de taxas, conciliação, painel e relatórios.
- [x] CSV com mapeamento/prévia e transação; backup validado e restauração com cópia prévia.
- [x] Demonstração isolada, modelos CSV e guia Windows.
- [x] Verificação de tipos, build e 12 testes automatizados aprovados.
- [x] Auditoria de dependências: zero vulnerabilidades reportadas.
- [x] Conferência visual nesta evolução: cadastro e alteração de empresas, troca de cliente, produto isolado e resultados consolidados em base temporária. As demais telas não foram integralmente revistas visualmente.

## Evidências

Testes cobrem rendimento e conversões; margem e preço com/sem rateio; desconto da loja e subsídio total/parcial; taxa única por pedido; rateio de resíduos; antecipação sobre recebível; arredondamento comercial; regras condicionais; custo ausente/zero; receita zero; ciclos; data inválida; CRUD persistido; alteração de insumo sem alterar venda antiga; relatório sem dupla dedução; estorno com custo retido; duplicidade de CSV; reinício do banco; backup/restauração; rejeição de backup inconsistente; preço por canal e conferência posterior preservando fotografia original.

A aplicação compilada é servida localmente, sem integração com plataformas. A demonstração tem cinco produtos e dois planos fictícios em data/demo. Base de operação real permanece sem produtos/vendas demonstrativos.

## Decisões e limites

SQLite nativo Node 24; documentos tipados e histórico em tabelas com transações, validação de referências no domínio. TypeScript 5.9 e esbuild-wasm para compatibilidade Windows, versões travadas. As condições e limites gerenciais estão no README: despesas integrais por mês, ajustes atribuídos à venda de origem, nenhuma inferência fiscal, plano com degraus exige simulação manual e publicação de preços é manual.

A conferência visual das novas rotinas foi concluída em base temporária separada. Evidência: evidencias/resultados-por-empresa-teste.png, com dados fictícios. Não foram criadas empresas demonstrativas na base real.

## Evolução: múltiplos estabelecimentos

- [x] Cadastro central de empresas e bancos separados sem mover o banco original.
- [x] Seleção explícita de empresa por requisição, inclusive CSV, backup e histórico.
- [x] Interface de cadastro/alteração, seletor e visão consolidada por cliente.
- [x] Testes de isolamento, migração, comparativo e backup por empresa: 12 testes aprovados no conjunto.
- [x] Manual atualizado para 26 capítulos, build aprovado e sistema reiniciado com backup prévio.

Resultado de cada cliente significa resultado operacional do estabelecimento. Honorários da gestão não são calculados nesta evolução.

Validação manual adicional: criar Restaurante A em base temporária; salvar produto exclusivo de R$ 10,50; alternar para empresa original e verificar ausência do produto; alterar o nome do cliente; consultar venda fictícia de R$ 30, taxas de R$ 6 e despesas de R$ 5, obtendo contribuição de R$ 13,50 e resultado de R$ 8,50.

## Evolução: referências iFood

- [x] Consulta a fontes oficiais, com divergência explícita de pagamento online entre publicações.
- [x] Quatro modelos por empresa, com proveniência e variantes de frete grátis.
- [x] Inclusão idempotente, sem substituir contratos ou preços; mensalidades como despesas inativas.
- [x] Custo de entrega explícito para entrega própria/frete grátis; comissão preservada.
- [x] 13 testes aprovados, incluindo pagamento fora do app, frete grátis, persistência e isolamento.
- [x] Build e tipos aprovados.
- [x] Inclusão no estabelecimento original: 4 planos e 2 modelos de mensalidade inativos; servidor reiniciado e dados conferidos pela API.

Referências iFood incluídas após backup prévio em data/backups. Produtos, preços e vendas preservados. A API foi validada com 13 testes; a inspeção de navegador nesta etapa não foi concluída porque a conexão de automação estava indisponível. Fonte e hipóteses registradas em REFERENCIAS_IFOOD.md e no capítulo 27 do manual.

## Migração para Docker — 28/10/2026

- [x] Backup offline completo antes de alterar a operação, com código, cadastro central, três bancos e manifesto de integridade.
- [x] Imagem Node 24 fixada por digest, build em etapas e execução sem dados de clientes embutidos.
- [x] 14 testes aprovados dentro do Docker, incluindo backup, restauração, isolamento e cálculos.
- [x] Validação em porta separada com cópia de dados e persistência após reinício.
- [x] Backup final dos dados mais recentes antes da troca para volume persistente externo.
- [x] Aplicação principal saudável em 127.0.0.1:3333, usuário não privilegiado, diretório da aplicação somente leitura e dados em margem_ifood99_data.
- [x] Igualdade dos dados por API antes/depois da troca e verificação de contagens/hashes dos registros.
- [x] Backup completo do volume testado, verificado no Windows e restaurado em volume separado com integridade confirmada.
- [x] Iniciador, parada, backup e manual atualizados; dados e credenciais excluídos do Git/contexto Docker.
- [x] Código, Docker, testes e manuais publicados em https://github.com/Avayatecnologia/Margem-Gestao-Ifood, branch main. Bancos, backups e credenciais excluídos.

A exportação do Docker copia os arquivos com o serviço pausado e verifica os bancos na cópia gravável, para suportar o WAL do SQLite sem criar arquivos no volume de origem somente leitura. O aplicativo é retomado mesmo em caso de falha de exportação. A rotina foi retestada após esse ajuste.
