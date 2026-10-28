# Prompt de implementação — Gestão de Preços iFood e 99

## 1. Missão e forma de execução

Atue como engenheiro de software sênior, especialista em formação de preços para alimentação e designer de produtos. Construa nesta pasta um sistema completo, funcional e em português brasileiro para cadastrar custos, produtos e contratos de plataformas, formar preços e acompanhar o resultado de cada venda.

Este arquivo é a especificação executável do projeto. Implemente o aplicativo: não entregue apenas um plano, protótipo visual ou exemplos de código. Leia as instruções locais e examine o projeto antes de editar. Preserve arquivos existentes. Resolva decisões técnicas rotineiras e documente as premissas. Pergunte apenas quando houver impedimento real que não possa ser resolvido com padrões seguros.

Crie PLAN.md com etapas e critérios de aceite, atualize-o conforme executar e continue até concluir e validar. Se alguma dependência externa impedir uma funcionalidade, conclua tudo que puder localmente e informe a limitação exata. Não declare como testado o que não executou.

## 2. Escopo e premissas

- Aplicação web local para um estabelecimento, utilizável pelo navegador no Windows, responsiva para computador e celular.
- Canais iniciais: iFood, 99 e venda direta; permitir outros canais e múltiplos planos por canal.
- Não presumir qual produto comercial da 99 o usuário contratou: permitir editar o nome do canal e registrar o plano.
- Todos os valores de taxas, tributos e custos são informados pelo usuário a partir de seus contratos e controles. Não apresentar exemplos como taxas oficiais ou vigentes.
- Separar claramente simulação, preço cadastrado, resultado esperado e resultado realizado.
- Sem dependência de API de iFood/99, serviço de IA, conta na nuvem ou assinatura para operar. Vendas manuais e importação CSV são suficientes nesta versão.
- Não construir estoque, emissão fiscal, folha de pagamento ou ERP completo.
- Tributos são parâmetros gerenciais informados pelo usuário; não inferir regime, faixa ou alíquota legal. Explicar isso nas configurações sem interromper o uso.

## 3. Arquitetura

Se não existir base de código, usar React + TypeScript + Vite no frontend, Node.js + TypeScript + Fastify no backend, SQLite persistente e biblioteca decimal para cálculos financeiros. Usar versões estáveis compatíveis disponíveis no momento da implementação e registrar o arquivo de dependências travadas. Pode adaptar bibliotecas se necessário, registrando o motivo no README.

- Servidor e banco locais; não usar localStorage como banco principal.
- Motor financeiro como módulo puro compartilhável, separado de telas e persistência.
- Validação tipada no servidor e no cliente; migrações de banco versionadas, relações e transações.
- Valores monetários sem aritmética binária de ponto flutuante: decimais exatos ou inteiros com escala explícita; quantidades e custos unitários com precisão maior que centavos.
- Scripts para desenvolvimento, build, testes e execução da versão compilada. Um comando deve iniciar frontend e backend em desenvolvimento.
- Dados fora da pasta de build, caminho configurável e documentado. Atualizar o aplicativo não pode apagar o banco.
- Rodar somente em localhost por padrão. Não expor serviço na rede nem publicar sem solicitação. Autenticação multiusuário fica fora da versão local; documentar essa limitação.
- Tratamento consistente de erros, mensagens claras, estados de carregamento e registro técnico sem dados sensíveis.

## 4. Cadastros obrigatórios

### Estabelecimento e despesas

Nome, moeda BRL, metas de margem, despesas fixas mensais detalhadas, volume previsto de pedidos e unidades por pedido. Cadastro de categorias e fornecedores. Despesas fixas incluem aluguel, salários fixos, internet e mensalidades; não duplicar mão de obra já classificada como variável.

Mensalidade de plataforma deve pertencer a uma única categoria de despesa fixa, com vigência e eventual condição de faturamento documentada. Não cobrar novamente como taxa por pedido.

### Insumos e embalagens

Nome, categoria, fornecedor opcional, unidade de compra, quantidade da embalagem de compra, preço de compra, custos de aquisição opcionais, unidade de consumo, rendimento aproveitável e histórico de alterações. Conversões kg/g e L/ml; unidade não se converte em massa ou volume sem fator explícito. Impedir quantidades zero e conversões incompatíveis.

Custo por unidade aproveitável = custo total de aquisição / (quantidade convertida × fração aproveitável). Rendimento de 80% significa fração 0,80; não tratar como simples acréscimo de 20%. Não lançar a mesma perda no insumo e na receita.

### Produtos e fichas técnicas

Código único, nome, categoria, descrição, status ativo, porções por receita, ingredientes e quantidades, embalagens, custos variáveis diretos adicionais, tempo de produção opcional e custo de mão de obra variável quando aplicável. Alternativa de custo direto manual por produto, mutuamente exclusiva com o custo calculado por ficha técnica.

Calcular custo do lote e custo por porção vendável. Embalagem pode ser por unidade ou por pedido e deve ter essa classificação explícita. Não dividir ou somar embalagem duas vezes.

Permitir duplicar produto, arquivar e pesquisar. Produtos referenciados em vendas não podem ser excluídos fisicamente. Combos e adicionais devem somar os custos e quantidades de seus componentes, impedir ciclos e evitar contar o componente como uma venda independente.

### Plataformas, planos e regras

Cadastrar nome, plano, período de validade, modalidade de entrega e forma de pagamento. Cada regra de cobrança tem nome, tipo percentual ou fixo, escopo por item ou por pedido, base de incidência, condições de aplicação e arredondamento.

Suportar comissão, pagamento online, antecipação, taxa fixa por pedido, logística, outras cobranças e tributos configuráveis. Para antecipação, permitir percentual informado sobre o recebível elegível após deduções identificadas; não somar automaticamente ao percentual sobre faturamento. Não calcular juros por prazo sem fórmula explicitamente definida.

Bases devem ser explícitas: subtotal de produtos antes do desconto, subtotal após desconto da loja, valor pago pelo cliente em produtos, recebível elegível ou frete elegível. A regra pode declarar inclusão de subsídio da plataforma e frete quando aplicável. Descrever a base na tela e na memória de cálculo. Não criar uma linguagem livre de fórmulas; usar opções tipadas e validadas.

Regras encadeadas devem ter ordem determinística e dependências sem ciclos. Impedir duas versões do mesmo plano com vigências sobrepostas. Mudanças criam novas versões e não alteram vendas passadas. Alíquotas individuais entre 0% e 100%; configurações economicamente inviáveis devem mostrar diagnóstico em vez de preço fictício.

### Preços por produto e canal

Preço atual, meta de margem, plano utilizado, custo vigente, versão, data e observações. Um produto pode ter preços diferentes no iFood, na 99 e na venda direta. Suportar preço promocional com período definido e histórico de preços.

## 5. Motor financeiro: contrato obrigatório

### Conceitos apresentados ao usuário

- Receita gerencial: valor atribuído à loja, incluindo subsídios que a loja efetivamente recebe; separar frete próprio e repasses de terceiros.
- Margem de contribuição: receita gerencial menos taxas, tributos e custos variáveis. Serve para cobrir despesas fixas e depois gerar resultado.
- Resultado unitário estimado: contribuição menos rateio gerencial de despesas fixas. Não chamar automaticamente de lucro líquido contábil.
- Resultado operacional do período: soma das contribuições realizadas menos despesas fixas do período, sem subtrair o rateio unitário novamente.
- Margem percentual e markup são conceitos distintos. Mostrar os denominadores e não usar os nomes como sinônimos.

### Caso simplificado, sem descontos e com a mesma base percentual

Defina P = preço por unidade; C = custo variável por unidade; F = custo fixo variável por pedido; Q = quantidade de unidades por pedido assumida na simulação; t = soma de percentuais que incidem diretamente sobre P; R = rateio fixo por unidade; m = margem alvo sobre P. Percentuais no motor são frações: 20% = 0,20.

Contribuição unitária = P × (1 − t) − C − F/Q.
Margem de contribuição = contribuição unitária / P.
Resultado unitário estimado = contribuição unitária − R.
Preço de equilíbrio de contribuição = (C + F/Q) / (1 − t).
Preço para margem de contribuição alvo = (C + F/Q) / (1 − t − m).
Preço para margem estimada após rateio = (C + F/Q + R) / (1 − t − m).

Exigir Q > 0; se o denominador for zero ou negativo, bloquear o cálculo com explicação. Preço zero pode representar bonificação no pedido, mas margem percentual com receita zero é indefinida, nunca infinito ou NaN.

### Regras gerais e promoções

As fórmulas simplificadas só são válidas quando todas as bases e condições correspondem às hipóteses. Para bases diferentes, descontos, antecipação, taxas condicionais ou frete, avaliar cada regra individualmente e usar o motor completo.

No pedido, separar subtotal de tabela G, desconto financiado pela loja DL e desconto financiado pela plataforma DP. O cliente paga G − DL − DP pelos produtos. O subsídio reconhecido é apenas o valor de DP efetivamente repassado à loja. Logo, receita gerencial de produtos = pagamento do cliente + subsídio reconhecido. Validar limites dos descontos e permitir subsídio parcial com informação explícita. Não descontar DP novamente se ele for integralmente reembolsado.

Registrar cobrança de frete ao cliente, quem recebe, custo de entrega pago pela loja e subsídio de entrega. Frete recebido por terceiros não é receita da loja; custo suportado pela loja deve entrar uma vez. Tributos e comissões seguem suas bases configuradas, sem assumir que incidem sobre o repasse líquido.

Taxas por pedido são calculadas uma vez sobre o pedido completo. Para análise por produto, ratear por receita dos itens após desconto da loja ou por quantidade, com escolha explícita. Se a base de receita for zero, usar quantidade; distribuir resíduos de centavos deterministicamente para que a soma dos itens coincida com o total. Descontos do pedido seguem o mesmo princípio.

Simulação de um produto isolado deve mostrar a hipótese de unidades por pedido e o rateio estimado; não confundir esse número com taxa efetivamente cobrada por unidade.

Para encontrar o preço em regras gerais, usar busca numérica com limites documentados apenas em trechos monotônicos válidos; para limites e degraus, avaliar também as fronteiras. Se não houver garantia de solução, informar a restrição. Recalcular a margem com o preço final arredondado e só recomendar preço que atinja a meta.

Permitir arredondamento para centavo, múltiplos de R$ 0,50 e terminações comerciais ,90 ou ,99, escolhendo o menor preço permitido igual ou superior ao necessário. Não arredondar para baixo e ocultar perda de margem.

### Rateio e ponto de equilíbrio

Oferecer rateio por unidades previstas: despesas fixas / unidades previstas; ou por pedidos previstos, alocando depois aos itens. Mostrar volume usado e evitar divisão por zero. Não misturar métodos silenciosamente.

Ponto de equilíbrio mensal em receita = despesas fixas / margem de contribuição percentual ponderada pelo mix de receita. Em unidades, usar contribuição média ponderada pelo mix de unidades. Exigir mix e contribuição positiva, mostrar premissas e arredondar pedidos/unidades para cima. Não tirar média simples das margens dos produtos.

## 6. Telas e fluxos

1. Início orientado: cadastrar empresa, insumos, produto, plano e gerar o primeiro preço. Campos ausentes devem aparecer como pendências; zero confirmado é diferente de informação não preenchida.
2. Painel: faturamento, deduções, custos variáveis, contribuição, despesas fixas e resultado operacional; filtros por período, canal e categoria; distinguir indicadores filtrados da despesa fixa total. Comparações de resultado operacional por canal só com método de rateio explícito.
3. Insumos e fichas técnicas: CRUD completo, conversões, rendimento, composição e histórico.
4. Plataformas e taxas: CRUD de canais, planos e regras com vigência, bases e exemplos de cálculo.
5. Precificação: tabela produto × canal com custo, preço atual, preço sugerido, contribuição em R$ e %, resultado estimado após rateio e alerta de prejuízo. Edição e aplicação de preços com confirmação do conjunto selecionado, histórico e reversão por nova versão.
6. Simulador: comparar canais, margens, descontos, aumento de custos, quantidade por pedido e entrega. Mostrar memória de cálculo linha a linha. Simular não modifica preço nem venda sem ação explícita.
7. Vendas: pedido com múltiplos produtos, quantidades, preços efetivos, canal, data, descontos, frete, status e taxas. Registrar cancelamento, estorno total/parcial, custos de produção que permaneceram e taxas devolvidas ou retidas. Ajustes vinculados ao pedido, sem apagar histórico.
8. Conciliação: registrar repasse informado, confrontar com recebível esperado e exibir diferença e motivo. Taxa real ainda desconhecida significa resultado esperado; só rotular realizado quando os dados necessários estiverem confirmados. Nunca subtrair repasse do lucro ou taxas duas vezes.
9. Relatórios: rentabilidade por produto/canal, itens deficitários, ranking por contribuição total e unitária, evolução de custos e preços, mix e ponto de equilíbrio.
10. Configurações, importação/exportação e backup/restauração.

Toda ação principal precisa funcionar, com persistência, validações, edição, filtros e feedback. Não deixar botões decorativos ou dados fixos substituindo consultas reais. Filtros de datas devem usar America/Sao_Paulo, limites consistentes e datas localizadas.

Visual profissional e simples: navegação lateral, espaço de trabalho claro, tabelas legíveis, cores de alerta acompanhadas por texto, campos monetários pt-BR e ajuda curta para termos financeiros. Acessibilidade por teclado, rótulos e contraste. Não exigir imagem ou serviço externo para a interface.

## 7. Dados, histórico e segurança

Modelar no mínimo: estabelecimento, categorias, fornecedores, insumos, versões de custo, produtos, componentes de receita, canais, versões de planos e regras, versões de preços, despesas fixas, pedidos, itens, descontos, cobranças calculadas, ajustes e conciliações. Incluir datas de criação/alteração e arquivamento.

Cada venda salva uma fotografia dos custos, preços, bases, taxas, rateios e versão do motor usados. Alterar o custo de um ingrediente deve atualizar simulações futuras e sinalizar preços para revisão, preservando o resultado histórico. Se houver recálculo histórico solicitado, gerar uma visão comparativa ou revisão auditável separada.

Importação CSV com modelos para insumos, produtos e vendas, suporte a UTF-8, separador ponto e vírgula e números brasileiros. Ter prévia, mapeamento, validação por linha, política de duplicidade e confirmação antes de gravar. Usar identificador externo de pedido para impedir duplicação na reimportação. Não associar produto só por nome quando houver ambiguidade. Importação de produtos com ficha técnica deve validar referências.

Exportar tabelas e relatórios em CSV compatível com Excel, escapando células que possam executar fórmulas. Exportar backup completo versionado, incluindo histórico. Restaurar com validação de formato, integridade e versão, transação e backup anterior automático; informar claramente que substitui os dados e exigir confirmação dentro do aplicativo. Não coletar dados pessoais de clientes desnecessários.

Banco com consultas parametrizadas, validação de uploads e limites de tamanho. Segredos fora do código. .gitignore deve excluir banco real, backups e arquivos de ambiente; fornecer .env.example sem credenciais.

## 8. Casos de teste financeiros obrigatórios

Todos os números abaixo são fictícios e não representam contratos das plataformas.

1. C = R$ 10,00; F = R$ 2,00 por pedido; Q = 2; t = 25%; m = 20%; R = 0. Preço teórico = 11 / 0,55 = 20,00. Com P = 20, contribuição unitária = R$ 4,00 e margem = 20%.
2. Mesmo caso com R = R$ 1,00: preço teórico para margem após rateio = 12 / 0,55 = 21,818181…; arredondamento a centavos para cima = R$ 21,82. Recalcular resultado e verificar margem alvo com a política de arredondamento.
3. Insumo: 1 kg custa R$ 20,00 e rende 80%. Custo aproveitável = R$ 0,025/g; uso de 100 g custa R$ 2,50.
4. Produto de R$ 30,00; desconto da loja de R$ 3,00 e da plataforma de R$ 2,00 integralmente reembolsado. Cliente paga R$ 25,00; receita da loja é R$ 27,00 antes das taxas. Comissão de 20% configurada sobre R$ 27,00 = R$ 5,40. Com custo variável de R$ 10,00 e sem outras deduções, contribuição = R$ 11,60.
5. Dois itens de R$ 20,00 e R$ 30,00; taxa única de R$ 2,00 por pedido. Rateio por receita resulta em R$ 0,80 e R$ 1,20. Cobrança total permanece R$ 2,00.
6. Receita R$ 100,00; comissão de 20% sobre receita e antecipação de 2% sobre recebível após comissão: comissão = R$ 20,00; antecipação = R$ 1,60; recebível = R$ 78,40, sem outros componentes.
7. Contribuição mensal de R$ 3.000 e despesa fixa de R$ 2.000: resultado operacional = R$ 1.000, mesmo quando há rateio exibido nos produtos. Não deduzir despesa duas vezes.
8. Alterar custo atual de R$ 10 para R$ 12: pedido antigo mantém custo R$ 10; nova simulação usa R$ 12.
9. Testar denominador zero/negativo, custo zero confirmado, ausência de custo, receita zero, conversão inválida, rendimento zero, taxa por pedido com múltiplas unidades, perda sem duplicação, descontos parciais, estorno com custo retido e reimportação duplicada.
10. Rateio de centavos em três ou mais itens deve preservar exatamente todos os totais. Testar vigências, condição de taxa e arredondamento comercial com margem final verificada.

Criar testes unitários do motor e testes de integração das operações persistidas. Incluir teste do fluxo: cadastrar insumo → produto → plano → simular → aplicar preço → registrar venda → conferir relatório → reiniciar → confirmar persistência → exportar/restaurar backup em banco de teste. Usar dados temporários, nunca destruir dados reais.

## 9. Dados demonstrativos

Oferecer carga demonstrativa opcional, claramente identificada, com pelo menos cinco produtos, insumos, um combo, dois canais com regras distintas e pedidos para demonstrar relatórios. Não popular dados fictícios silenciosamente no ambiente real. Fornecer comando separado ou opção de interface para criar demonstração em banco isolado.

## 10. Ordem de execução e entrega

1. Examinar pasta e ferramentas disponíveis; criar plano, modelo de dados e motor financeiro.
2. Validar fórmulas com testes; implementar banco, migrações e serviços.
3. Entregar cadastros, fichas e regras de taxas persistentes.
4. Implementar preços, simulador, memória de cálculo e histórico.
5. Implementar vendas, ajustes, conciliação, painel e relatórios.
6. Implementar importação, exportação, backup e restauração.
7. Integrar interface, validar fluxo completo, corrigir falhas e preparar operação no Windows.

Entregar código-fonte completo nesta pasta, migrações, testes, README em português, .env.example, modelos CSV e GUIA_DE_USO.md com o fluxo do primeiro cadastro até a conferência de uma venda. Documentar instalação, comandos exatos, localização do banco, backup, recuperação e premissas financeiras.

Critérios de conclusão: instalação reproduzível; build e verificações de tipos aprovados; testes financeiros e de persistência aprovados; telas conectadas ao banco; nenhum fluxo principal com placeholder; nenhuma taxa fictícia apresentada como real; dados preservados após reinício; receitas e custos reconciliados nos relatórios; restauração validada em ambiente de teste.

Ao terminar, informar como iniciar e abrir o aplicativo, o que foi validado, onde ficam os dados e eventuais limitações. Se não for possível testar a interface visualmente, declarar isso explicitamente. Não publicar nem contratar serviços como parte desta tarefa.
