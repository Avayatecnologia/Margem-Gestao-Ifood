# Manual do usuário — Margem

**Precificação e acompanhamento de resultados para iFood, 99 e venda direta**  
Versão 1.3 • Docker, múltiplos estabelecimentos e referências iFood • 28 de outubro de 2026  
Este manual descreve os campos e comportamentos da versão implementada. Todos os valores dos exemplos são fictícios; use os custos e contratos reais do seu estabelecimento.

## Índice

1. [Apresentação do sistema](#s01)
2. [Abrir, encerrar e navegar](#s02)
3. [Preparação e sequência do primeiro cadastro](#s03)
4. [Estabelecimento e parâmetros de rateio](#s04)
5. [Categorias e fornecedores](#s05)
6. [Insumos, embalagens e rendimento](#s06)
7. [Produtos, fichas técnicas e combos](#s07)
8. [Canais de venda](#s08)
9. [Planos, vigências e taxas das plataformas](#s09)
10. [Despesas fixas](#s10)
11. [Precificação e simulador](#s11)
12. [Preços cadastrados, promoções e histórico](#s12)
13. [Registro de vendas](#s13)
14. [Conferência de taxas realizadas](#s14)
15. [Estornos e cancelamentos](#s15)
16. [Conciliação de repasses](#s16)
17. [Visão geral e interpretação dos resultados](#s17)
18. [Relatórios de rentabilidade](#s18)
19. [Importação e exportação CSV](#s19)
20. [Backup, restauração e conservação dos dados](#s20)
21. [Exemplo completo: do custo à venda](#s21)
22. [Rotinas diária, semanal e mensal](#s22)
23. [Mensagens e solução de problemas](#s23)
24. [Limites da versão e glossário](#s24)
25. [Checklist de conferência antes de usar um preço](#s25)
26. [Empresas: cadastro, alteração e resultados por cliente](#s26)
27. [Bases iFood e frete grátis ao consumidor](#s27)
28. [Execução no Docker e backup completo](#s28)

<a id="s01"></a>
## 1. Apresentação do sistema

O Margem reúne custos de produção, despesas fixas, taxas e preços de venda para responder:

- Quanto custa produzir cada unidade?
- Qual preço atende à minha meta de margem neste canal?
- Quanto uma venda deixa depois das cobranças e dos custos variáveis?
- A contribuição das vendas cobre as despesas fixas do período?
- O repasse recebido coincide com o valor esperado?

O fluxo de trabalho é **custos → produtos → planos e taxas → preço → venda → conferência → resultado**.

| Menu | Para que serve |
|---|---|
| Empresas | Cadastrar, alterar, acessar, arquivar e reativar estabelecimentos. |
| Resultados por empresa | Comparar receita, contribuição, despesas e resultado operacional de cada cliente. |
| Visão geral | Consultar receita, contribuição, despesas, resultado operacional e ponto de equilíbrio. |
| Insumos | Registrar compras, unidades, rendimento e embalagens. |
| Produtos e fichas | Definir custo manual, receita de produção, adicional ou combo. |
| Canais | Organizar iFood, 99, venda direta e outros serviços. |
| Planos e taxas | Informar contratos, vigências e cobranças de cada canal. |
| Precificação | Simular preços, encontrar sugestões e consultar a comparação produto × canal. |
| Vendas | Registrar pedidos, conferir taxas, ajustar cancelamentos e conciliar recebimentos. |
| Relatórios | Analisar contribuição por produto e canal e exportar dados. |
| Despesas fixas | Registrar custos mensais, incluindo mensalidades de plataformas. |
| Categorias | Organizar o catálogo e permitir filtros por categoria. |
| Fornecedores | Identificar a origem dos insumos. |
| Estabelecimento | Configurar nome, previsões e meta de margem. |
| Dados e backup | Importar, exportar, salvar e restaurar informações. |

<a id="s02"></a>
## 2. Abrir, encerrar e navegar

1. Na pasta do projeto, dê dois cliques em **INICIAR.bat**.
2. Com a migração para Docker, aguarde a confirmação de início. O Docker Desktop precisa estar em execução; a janela do iniciador pode ser fechada.
3. No navegador deste computador, abra **http://127.0.0.1:3333/**.
4. Escolha uma rotina no menu lateral.
5. Para pausar o sistema no Docker, execute **PARAR.bat**. Fechar apenas a aba do navegador não encerra o servidor.

A instalação atual já foi preparada. No Docker, uma instalação nova precisa do Docker Desktop e de acesso à internet para construir a imagem. Node.js fica dentro do container. Depois de instalado, o uso normal é local. Para desenvolvimento fora do Docker, consulte o README.

Nos cadastros, use **+ Novo cadastro**, preencha os campos e clique em **Salvar cadastro**. **Cancelar** e **Fechar ×** não gravam o formulário. **Editar** altera o cadastro; **Histórico** permite consultar versões anteriores. A consulta histórica atual apresenta detalhes em formato técnico.

Digite valores sem símbolo de moeda e sem separador de milhar: use **1250,50**, por exemplo. O sistema também aceita ponto decimal. Um percentual de vinte por cento deve ser informado como **20**, não como 0,20. Datas nos campos seguem o controle do navegador; nas solicitações textuais de promoção, use **AAAA-MM-DD**.

Campos opcionais podem ficar vazios. Custo não informado não é a mesma coisa que custo zero: use zero somente quando não existir aquele custo. Mensagens de validação precisam ser corrigidas antes de salvar.

O endereço local acessa o computador onde o sistema foi iniciado. Nesta versão, ele não disponibiliza acesso por outro celular ou computador da rede.

<a id="s03"></a>
## 3. Preparação e sequência do primeiro cadastro

Separe notas de compra, receitas com quantidades, custos de embalagem, contrato das plataformas, despesas mensais e uma estimativa de volume vendido. Antes de começar, cadastre ou selecione a empresa no menu **Empresas**; todos os passos abaixo são realizados separadamente para cada cliente.

Siga esta ordem:

1. **Estabelecimento:** informe nome e previsões.
2. **Categorias e Fornecedores:** cadastre os agrupamentos que desejar usar.
3. **Insumos:** cadastre ingredientes e embalagens usados nas fichas.
4. **Produtos e fichas:** monte os produtos ou informe custos manuais já apurados.
5. **Canais:** confirme os serviços utilizados.
6. **Planos e taxas:** informe as cobranças do contrato.
7. **Despesas fixas:** registre os gastos mensais.
8. **Precificação:** simule, confira a memória e aplique o preço.
9. **Vendas:** registre as operações para alimentar o painel.

É possível começar com custo manual de produto sem cadastrar ingredientes. Nesse caso, você é responsável por atualizar o custo manual quando os preços de compra mudarem.

Simulações e preços cadastrados não geram faturamento no painel. Os indicadores de vendas aparecem depois de registrar pedidos.

<a id="s04"></a>
## 4. Estabelecimento e parâmetros de rateio

Acesse **Estabelecimento**, preencha e clique em **Salvar configurações**.

| Campo | Como preencher | Efeito no cálculo |
|---|---|---|
| Nome do estabelecimento | Nome usado para identificar a operação. | Aparece na navegação. |
| Pedidos previstos / mês | Número de pedidos completos esperados; maior que zero. | Ajuda a estimar unidades por pedido e pode definir rateio. |
| Unidades previstas / mês | Total esperado de unidades vendidas; maior que zero. | Define rateio por unidade e a média de unidades por pedido. |
| Margem alvo (%) | Meta de contribuição sobre receita; de 0 até menos de 100. | Meta padrão da comparação de preços quando não há meta cadastrada para aquele produto/plano. |
| Rateio de despesas | Por unidades previstas ou por pedidos × unidades por pedido. | Define como distribuir as despesas fixas no simulador quando essa opção estiver marcada. |

**Exemplo:** 300 pedidos e 600 unidades previstos significam média de 2 unidades por pedido. Um combo registrado como produto conta como uma unidade vendida do combo, não como a soma das peças que o compõem.

Com R$ 1.200 de despesas fixas e 600 unidades previstas, o rateio por unidade é R$ 2. No modo por pedidos, com 300 pedidos e 2 unidades no pedido simulado, também é R$ 2: 1.200 ÷ (300 × 2).

O modo por pedidos usa a quantidade informada naquela simulação. Alterá-la modifica o rateio por unidade. Previsão elevada demais pode tornar o rateio artificialmente baixo; revise as premissas conforme as vendas reais.

A tela pode conter valores iniciais de referência. Confirme-os antes de utilizá-los. A meta do formulário de simulação deve ser conferida em cada uso; não presuma que mudar a configuração substitua uma meta já digitada no simulador.

<a id="s05"></a>
## 5. Categorias e fornecedores

Em **Categorias**, crie nomes como Lanches, Bebidas e Sobremesas. Em **Fornecedores**, cadastre os nomes usados na compra de insumos.

| Campo | Orientação |
|---|---|
| Nome | Identificação do agrupamento ou fornecedor. Evite duplicidades de grafia. |
| Ativo | Indica situação cadastral. Desmarque para arquivar sem apagar o histórico. |

Salve e selecione esses registros nos insumos ou produtos. Fornecedor não gera contas a pagar nem controle de compras; é uma identificação auxiliar. Categoria não altera o valor do custo, mas organiza filtros e consultas.

Renomear uma categoria não troca automaticamente o texto já associado a todos os produtos. Revise esses cadastros quando reorganizar o catálogo. Arquivar não elimina referências antigas; confira os vínculos existentes.

<a id="s06"></a>
## 6. Insumos, embalagens e rendimento

Acesse **Insumos → + Novo cadastro**.

| Campo | Como preencher |
|---|---|
| Nome do insumo / embalagem | Identificação clara, incluindo apresentação quando necessário. |
| Categoria | Agrupamento opcional já cadastrado. |
| Fornecedor | Origem opcional da compra. |
| Unidade de compra | Quilo, grama, litro, mililitro ou unidade. |
| Quantidade comprada | Quantidade total correspondente ao custo informado, na unidade de compra. Maior que zero. |
| Custo de compra (R$) | Valor total daquela quantidade, não preço por grama quando a compra está em kg. |
| Frete / aquisição (R$) | Custo adicional atribuído àquela compra. Não repita se já estiver no custo de compra. |
| Rendimento aproveitável (%) | Parcela que pode efetivamente ser usada: acima de 0 até 100. |
| Unidade de consumo | Grama, mililitro ou unidade; precisa corresponder à compra. |
| Ativo | Situação do cadastro. Arquivar preserva os registros anteriores. |

**Conversões disponíveis:** kg para g; g para g; L para ml; ml para ml; unidade para unidade. Não há conversão automática de unidade para grama ou de massa para volume.

**Como o custo é obtido:**

`Custo por unidade aproveitável = (compra + aquisição) ÷ (quantidade convertida × rendimento / 100)`

Exemplo: 1 kg por R$ 20, rendimento de 80%, consumo em g. O sistema encontra 800 g aproveitáveis, custo de R$ 0,025 por g e custo de R$ 2,50 para 100 g. Rendimento de 80% não significa simplesmente adicionar 20% ao preço.

Para embalagem: 100 unidades por R$ 60, rendimento de 100%, consumo em unidade. Cada uma custa R$ 0,60.

Quando uma nova compra alterar o custo, use **Editar**, atualize os valores e salve. Fichas técnicas futuras passam a usar o novo custo. Vendas já registradas mantêm os custos preservados na data de registro.

Não aplique a mesma perda novamente na receita. Se o ingrediente já usa rendimento de 80%, não adicione outra perda equivalente no produto.

<a id="s07"></a>
## 7. Produtos, fichas técnicas e combos

Acesse **Produtos e fichas → + Novo cadastro**.

### 7.1 Campos do produto

| Campo | Como preencher |
|---|---|
| Nome do produto | Nome comercial. |
| Código único | Identificador próprio, por exemplo H001. Não pode se repetir. |
| Categoria | Categoria opcional para organização e filtros. |
| Descrição | Informações complementares. |
| Origem do custo | Escolha custo manual por unidade ou ficha técnica / combo. |
| Custo manual por unidade (R$) | Custo variável total de uma unidade; usado somente no modo manual. |
| Porções vendáveis por receita | Quantas unidades o lote produz; usado na ficha e maior que zero. |
| Outros custos variáveis do lote (R$) | Gastos variáveis não representados nos componentes, como mão de obra variável do lote. |
| Embalagem por pedido contendo este produto (R$) | Custo cobrado uma vez para aquele produto distinto no pedido, independentemente da quantidade vendida. |
| Ativo | Desmarque para arquivar o produto. Produto arquivado não pode compor uma nova venda registrada. |

No modo manual, digite o custo já apurado. Não há soma automática de ingredientes nesse modo. No modo ficha, o sistema calcula o custo pelos componentes; o custo manual deixa de ser utilizado.

### 7.2 Montar uma ficha técnica

1. Escolha **Ficha técnica / combo**.
2. Informe as porções vendáveis do lote.
3. Clique em **+ Componente**.
4. Em **Origem**, escolha **Insumo / embalagem**.
5. Selecione o componente e a quantidade usada no lote, na unidade de consumo cadastrada.
6. Repita para os demais ingredientes e embalagens por unidade.
7. Informe outros custos variáveis do lote, se houver, e salve.

O custo unitário é a soma dos custos dos componentes e dos outros custos variáveis do lote, dividida pelas porções vendáveis. A embalagem por pedido é separada desse custo unitário.

Se uma receita produz 10 unidades, informe os ingredientes do lote inteiro e 10 porções. Se todos os componentes já correspondem a uma unidade, informe 1 porção.

### 7.3 Montar um combo ou adicional

Cadastre primeiro os produtos componentes. Crie o combo no modo ficha, use **Origem → Produto / adicional** e informe quantas porções de cada produto o combo contém. Use normalmente 1 porção vendável para um combo completo.

Os componentes formam o custo do combo; a venda registra apenas o produto combo quando ele é o item vendido. Não registre também seus componentes como vendas adicionais sem que tenham sido vendidos separadamente.

Os custos por pedido dos componentes também são somados no combo. Confira essa composição antes de adicionar outra embalagem no próprio combo. O sistema impede ciclos, como A conter B e B conter A.

### 7.4 Embalagem: escolha o local correto

| Situação | Onde lançar |
|---|---|
| Uma caixa por unidade de hambúrguer | Insumo da ficha, com quantidade correspondente ao lote; ou incluída no custo manual. |
| Uma embalagem por pedido que contenha este produto | Campo de embalagem por pedido do produto. |
| Uma cobrança global única por pedido do canal | Regra de valor fixo por pedido no plano, identificada claramente. |

Se dois produtos diferentes tiverem R$ 1 de embalagem por pedido cada, um pedido contendo ambos somará R$ 2. Não use esse campo nos dois produtos se o gasto real for uma única sacola de R$ 1 compartilhada pelo pedido inteiro.

Use **Duplicar** para partir de outro produto; confira nome, código, composição e custos antes de salvar. **Histórico** consulta versões. Alterar ou arquivar não apaga vendas anteriores.

<a id="s08"></a>
## 8. Canais de venda

O sistema inicia com iFood, 99 e Venda direta. Em **Canais**, use **Editar** para ajustar o nome ao serviço contratado ou **+ Novo cadastro** para incluir outro.

Os campos são **Nome** e **Ativo**. O canal organiza contratos e relatórios; as cobranças são configuradas nos planos vinculados a ele.

Um mesmo canal pode ter vários planos. Confirme o plano escolhido ao simular ou vender. O nome do canal, por si só, não define taxas, entrega ou pagamento.

<a id="s09"></a>
## 9. Planos, vigências e taxas das plataformas

Acesse **Planos e taxas → + Novo cadastro**. Consulte o contrato ou demonstrativo real para preencher.

### 9.1 Identificação do plano

| Campo | Como preencher |
|---|---|
| Nome do plano / versão | Nome que diferencie o contrato ou a revisão, por exemplo Contrato outubro/2026. |
| Canal | Canal previamente cadastrado. |
| Vigência inicial | Primeiro dia de aplicação. |
| Vigência final | Último dia, se houver; vazio significa sem fim definido. |
| Modalidade de entrega | Texto identificador, por exemplo Própria. |
| Forma de pagamento | Texto identificador, por exemplo Online. |

O simulador usa a data atual e a entrega/pagamento definidos no plano. Uma venda usa a data e os textos informados no pedido. Se a regra tiver condição de pagamento ou entrega, mantenha a grafia exatamente igual.

### 9.2 Adicionar uma cobrança

Clique em **+ Adicionar regra** para cada cobrança. As regras são aplicadas na ordem exibida.

| Campo da regra | Como preencher / efeito |
|---|---|
| Nome | Comissão, Pagamento online, Antecipação, Tributo ou outro identificador. |
| Tipo | Percentual ou valor fixo em reais. |
| Alíquota (%) ou valor (R$) | Para 20%, digite 20. Para taxa de R$ 2, digite 2 no tipo valor fixo. |
| Aplicação de valor fixo | Uma vez por pedido ou por unidade vendida. Essa escolha é para cobranças fixas; percentuais usam a base total selecionada. |
| Base de incidência | Escolha conforme o contrato, usando a tabela abaixo. |
| Incluir frete elegível na base | Acrescenta frete próprio e subsídio de entrega quando a base selecionada não os contém. Não inclui frete destinado a terceiro. |
| A partir de base (R$) | Valor mínimo inclusivo para aplicar a regra. Zero deixa sem piso adicional. |
| Até base (opcional, R$) | Valor máximo inclusivo; deixe vazio para não limitar. |
| Só nesta forma de pagamento | Condição opcional; vazio aplica a todas. |
| Só nesta entrega | Condição opcional; vazio aplica a todas. |

### 9.3 Bases disponíveis

| Base na tela | Significado |
|---|---|
| Subtotal antes dos descontos | Soma de preço × quantidade dos produtos antes dos descontos do pedido. |
| Subtotal após desconto da loja | Subtotal menos o desconto financiado pela loja. |
| Pago pelo cliente em produtos | Subtotal menos os descontos da loja e da plataforma. |
| Pago + subsídio recebido | Valor pago pelo cliente em produtos somado ao subsídio da plataforma reconhecido pela loja. |
| Recebível após regras anteriores | Receita gerencial, incluindo frete próprio/subsídio de entrega, menos cobranças anteriores; base mínima zero. |
| Frete próprio + subsídio de entrega | Somente o frete recebido pela loja e o subsídio de entrega. |

**Exemplo de ordem:** comissão de 20% sobre R$ 100 = R$ 20; antecipação de 2% sobre recebível após comissão usa R$ 80 e resulta em R$ 1,60. O recebível final é R$ 78,40. Somar 20% + 2% sobre R$ 100 produziria outro resultado.

Cada cobrança é arredondada para centavos, com metade para cima. Não há opção de outra política de arredondamento da taxa nesta tela. Regras com faixas ou limites podem ser simuladas manualmente; a sugestão automática de preço não é disponibilizada para esses planos.

**Mensalidade não é taxa por pedido:** cadastre-a uma vez em Despesas fixas. Tributos devem ser informados por você; o sistema não determina enquadramento ou alíquota fiscal.

### 9.4 Alteração contratual

Planos salvos não são editados diretamente. Use **Nova versão**, revise nome, vigência e regras e salve. A nova versão mantém a ligação com o canal; você escolhe o novo plano nas próximas simulações e vendas.

O botão sugere outro nome de versão. Se usar o mesmo nome no mesmo canal, os períodos não podem se sobrepor. Planos de nomes diferentes podem coexistir; escolher corretamente continua sendo necessário. Um plano antigo sem fim definido não desaparece automaticamente quando você cria outro.

<a id="s10"></a>
## 10. Despesas fixas

Acesse **Despesas fixas → + Novo cadastro**.

| Campo | Orientação |
|---|---|
| Descrição | Aluguel, internet, salário fixo, mensalidade da plataforma etc. |
| Valor mensal (R$) | Valor daquele gasto em um mês. |
| Categoria | Texto para organização. Não gera regra automática. |
| Início | Data inicial da despesa. |
| Fim | Data final opcional, nunca anterior ao início. |
| Observações contratuais | Anotações sobre condições e detalhes; não automatizam cobranças. |
| Ativa | Desmarcada, a despesa fica fora do cálculo dos relatórios, inclusive consultas históricas. |

Para preservar uma despesa encerrada na análise histórica, prefira manter **Ativa** e preencher **Fim**. Ao corrigir valores históricos, considere que o painel usa o cadastro atual das despesas, não uma fotografia mensal fechada.

No simulador, entram as despesas ativas vigentes no dia da simulação. No painel, cada despesa ativa que se sobreponha a um mês consultado é contada integralmente naquele mês. Não há proporcionalidade por dias: um filtro de uma semana pode exibir um mês inteiro de despesas.

Se uma mensalidade só for devida acima de certo faturamento, a observação não faz esse teste. Confirme se a cobrança ocorreu e ajuste o cadastro/vigência. Não repita mão de obra como despesa fixa se ela já estiver incluída como custo variável da produção.

<a id="s11"></a>
## 11. Precificação e simulador

Acesse **Precificação**. A parte superior é o simulador; abaixo fica a comparação produto × canal.

### 11.1 Todos os parâmetros da simulação

| Campo | Como usar |
|---|---|
| Produto | Produto cujo custo atual será utilizado. |
| Canal / plano | Contrato com as regras a considerar; precisa estar vigente hoje. |
| Preço para simular (R$) | Preço unitário que deseja avaliar. |
| Unidades neste pedido | Quantidade desse produto no pedido hipotético; maior que zero. |
| Margem alvo sobre receita (%) | Meta usada para encontrar o preço sugerido. |
| Arredondamento | Centavo acima, múltiplo de R$ 0,50, final ,90 ou final ,99. |
| Incluir despesas fixas na meta | Marcado: a meta deve ser atingida depois do rateio estimado; desmarcado: meta de contribuição. |
| Aumento simulado no custo (%) | Acréscimo hipotético sobre o custo unitário do produto, sem alterar seu cadastro. Não aumenta automaticamente embalagem por pedido ou entrega. |
| Desconto da loja no pedido (R$) | Total do desconto financiado pelo estabelecimento. |
| Desconto da plataforma (R$) | Total abatido do cliente por ação da plataforma. |
| Subsídio recebido (R$) | Parcela do desconto da plataforma que efetivamente volta à loja. Não pode superar esse desconto. |
| Frete do cliente (R$) | Frete cobrado no pedido. |
| Frete recebido pela loja | Marque somente se esse frete pertence à loja. |
| Custo da entrega (R$) | Gasto de entrega suportado pela loja. |
| Subsídio de entrega (R$) | Crédito de entrega efetivamente recebido pela loja. |

Os descontos e fretes são totais do pedido simulado, não valores por unidade. O simulador avalia um produto por vez, com a quantidade informada. Pedidos com diferentes produtos são registrados em Vendas.

### 11.2 Calcular um preço praticado

1. Selecione produto e plano.
2. Informe preço e quantidade.
3. Preencha descontos e entrega, se houver.
4. Clique em **Calcular este preço**.
5. Confira os cartões e a **Memória de cálculo**.

Esse botão avalia o preço informado; não procura outro preço. Para comparar canais, mantenha o cenário, troque o plano e calcule novamente. Anote as diferenças ou use a tabela produto × canal.

### 11.3 Encontrar e cadastrar um preço sugerido

1. Defina a margem e o arredondamento desejados.
2. Decida se quer incluir despesas fixas na meta.
3. Clique em **Encontrar preço sugerido**.
4. Confira se custo, taxas, quantidade, descontos e rateio correspondem à situação real.
5. Clique em **Aplicar preço no cadastro** e confirme.

Aplicar grava preço e meta para aquele produto/plano. Não grava a hipótese de desconto, quantidade ou aumento de custo como uma regra permanente de vendas. Documente seu cenário quando ele for especial. O sistema não publica o preço no iFood ou na 99: a atualização do cardápio é manual.

### 11.4 Interpretar os resultados

| Resultado | Interpretação |
|---|---|
| Preço sugerido por unidade | Preço encontrado para a meta e o cenário informados. |
| Contribuição do pedido | Receita da loja menos taxas e custos variáveis de todas as unidades simuladas. |
| Percentual de contribuição | Contribuição do pedido dividida pela receita gerencial do pedido. |
| Após rateio estimado | Contribuição do pedido menos rateio por unidade × quantidade simulada. |
| Recebível esperado | Receita gerencial menos taxas; ainda não desconta produção e entrega pagas pela loja. |
| Memória de cálculo | Receita, base e valor de cada cobrança, custos variáveis e rateio por unidade. |

Com a opção de despesas fixas desmarcada, o rateio mostrado é zero. Portanto, o cartão **Após rateio estimado** não terá descontado despesas fixas nessa simulação.

**Atenção à unidade de análise:** o preço sugerido é unitário; contribuição, recebível e resultado após rateio são do pedido simulado. Com 2 unidades, divida os resultados do pedido por 2 para obter a média por unidade.

O arredondamento comercial é sempre para cima em relação ao valor necessário: por exemplo, R$ 20,91 vira R$ 21,90 no final ,90, R$ 20,99 no final ,99 ou R$ 21,00 no múltiplo de R$ 0,50.

<a id="s12"></a>
## 12. Preços cadastrados, promoções e histórico

### 12.1 Tabela Produto × canal

| Coluna | O que mostra |
|---|---|
| Produto / canal | Produto associado ao canal e ao plano. |
| Preço atual | Última versão gravada, considerando promoção vigente. Sem cadastro aparece um traço. |
| Sugerido | Sugestão para a meta do produto/plano, ou meta do estabelecimento se ainda não houver cadastro. |
| Custo | Custo unitário atual do produto; embalagem por pedido é considerada separadamente no cálculo. |
| Contribuição / un. | Contribuição média por unidade no preço atual e na hipótese padrão da tabela. |
| Margem atual | Contribuição percentual no preço atual. |
| Revisão | Mudança no custo unitário desde o preço gravado ou restrição de cálculo. |
| Simular | Carrega produto, plano, preço e premissas básicas no simulador. |

Essa tabela usa **unidades previstas ÷ pedidos previstos**, sem descontos/frete extraordinários e sem despesas fixas na meta. Mostra produtos ativos e planos ativos vigentes na data atual. Um resultado diferente da simulação detalhada pode decorrer dessas premissas, e não de erro.

A sinalização de revisão compara o custo unitário. Alterações de embalagem por pedido, despesas, entrega ou regras contratuais também merecem análise, mesmo sem esse aviso. Confira todos os custos periodicamente.

### 12.2 Histórico e reaplicação

Em **Histórico de preços**, consulte produto, preço e data. **Reaplicar** cria outra versão usando aquele registro, sem apagar as anteriores. Se o registro tiver promoção, seus dados também são copiados; confira a vigência.

### 12.3 Promoção

1. Na linha desejada do histórico, clique em **Promoção**.
2. Informe o preço promocional unitário.
3. Informe início e fim em **AAAA-MM-DD**.
4. Confirme e confira o preço na tabela.

A promoção cria uma nova versão vinculada ao produto/plano daquela linha. O preço promocional só é usado dentro do período; fora dele, vale o preço normal dessa versão. Recalcule a margem antes de cadastrar uma promoção: essa ação não garante por si só a meta de rentabilidade.

<a id="s13"></a>
## 13. Registro de vendas

Acesse **Vendas → + Registrar venda**.

### 13.1 Cabeçalho e parâmetros do pedido

| Campo | Orientação |
|---|---|
| Identificador único do pedido | Número externo ou controle próprio; não pode se repetir. Para canais com números iguais, use prefixos como IFOOD-123 e 99-123. |
| Data da venda | Data efetiva do pedido. Deve pertencer à vigência do plano. |
| Plano aplicado | Contrato correspondente àquela venda. |
| Forma de pagamento | Informe a identificação correta, especialmente se houver regras condicionais. |
| Modalidade de entrega | Informe a identificação correta para as regras do plano. |
| Desconto pago pela loja (R$) | Total financiado pelo estabelecimento. |
| Desconto pago pela plataforma (R$) | Total abatido do cliente por ação da plataforma. |
| Subsídio efetivamente recebido (R$) | Parcela efetivamente ressarcida à loja. Não presuma reembolso integral. |
| Frete cobrado do cliente (R$) | Frete cobrado no pedido. |
| Frete recebido pela loja | Marque somente se o valor pertence à loja. |
| Custo de entrega da loja (R$) | Gasto efetivamente suportado pelo estabelecimento. |
| Subsídio de entrega recebido (R$) | Crédito adicional de entrega recebido pela loja. |
| Rateio das cobranças | Por receita dos itens ou por quantidade. Distribui os totais para analisar os produtos; não multiplica a cobrança da plataforma. |
| Taxas efetivas totais (opcional, R$) | Total real apurado das cobranças variáveis; substitui o total calculado pelo plano, não é um acréscimo. |
| Custos, subsídios e taxas efetivas conferidos | Marque somente após conferir todos os componentes e informar as taxas efetivas. |

Sem o total de taxas efetivas, o sistema não permite marcar a venda como conferida. Informar taxas reais, mas deixar a marcação desmarcada, mantém a situação esperada até a conferência.

### 13.2 Itens vendidos

1. Escolha primeiro plano e data do pedido.
2. Clique em **+ Produto**.
3. Selecione o produto, a quantidade e o preço unitário efetivamente vendido.
4. O preço cadastrado é sugerido ao selecionar o produto, se existir para o plano; confira a promoção aplicável à data.
5. Adicione os demais produtos e salve.

Consolide o mesmo produto em uma linha, somando sua quantidade. Se alterar plano ou data depois de selecionar os itens, confira novamente os preços: a seleção anterior não garante atualização automática de todas as linhas.

O total dos descontos da loja e plataforma não pode superar o subtotal de produtos. O subsídio de produtos não pode superar o desconto da plataforma. Frete recebido por terceiros não integra sua receita.

Ao salvar, a venda preserva custos, regras e valores usados. **Lançar uma venda antiga utiliza os custos atuais do cadastro naquele momento**, não reconstrói automaticamente preços de compra passados. Confira isso antes de importar histórico.

Na lista, **Memória** abre os detalhes preservados. A coluna de contribuição não desconta despesas fixas nem deve ser confundida com saldo bancário. O cadastro do pedido não é editado diretamente após salvo; use as rotinas de conferência e ajuste quando cabíveis.

<a id="s14"></a>
## 14. Conferência de taxas realizadas

Use **Vendas → Conferir taxas realizadas** quando o pedido já foi lançado como esperado e você recebeu os valores definitivos.

| Campo | Orientação |
|---|---|
| Pedido | Selecione o pedido existente. |
| Data da conferência | Data em que a conferência passa a ser considerada; não pode anteceder a venda. |
| Total de taxas efetivas (R$) | Total definitivo das cobranças, e não somente a diferença em relação à previsão. |
| Observações | Fonte dos dados e explicação das diferenças, se houver. |

Ao salvar, o sistema cria uma conferência adicional e marca o resultado como realizado, mantendo a fotografia original. Essa rotina modifica o total de taxas; não corrige automaticamente receita, desconto, entrega ou custo do pedido. Confira esses valores antes de utilizá-la.

Exemplo: previsão de R$ 4 de taxas, total real de R$ 5. Informe **5**, não 1. A contribuição cai R$ 1.

Quando houver mais de uma conferência, a última registrada é a referência atual. Nos relatórios, ela precisa estar datada até o fim do período consultado. Evite registrar datas fora da sequência das conferências.

<a id="s15"></a>
## 15. Estornos e cancelamentos

Acesse **Vendas → Estorno / cancelamento**.

| Campo | Orientação |
|---|---|
| Pedido | Pedido original ao qual o ajuste pertence. |
| Motivo | Explique o ocorrido. |
| Data | Data do ajuste. |
| Tipo | Estorno parcial ou cancelamento. |
| Receita devolvida (R$) | Receita que deixou de pertencer à loja. |
| Taxas devolvidas (R$) | Cobranças efetivamente devolvidas pela plataforma. |
| Custos recuperados (R$) | Parcela de custos realmente recuperada; não o preço de venda. |

**Cancelamento não zera os valores sozinho.** Escolher o tipo altera a classificação, mas você precisa informar receita, taxas e custos envolvidos.

Exemplo: venda de R$ 20, taxas de R$ 4 e custo de R$ 10. Se o pedido for cancelado após produção, a receita for devolvida, as taxas forem ressarcidas e o produto perdido, informe receita devolvida 20, taxas devolvidas 4 e custos recuperados 0. O resultado ajustado será **−R$ 10**.

Os ajustes se acumulam e não podem superar a receita, as taxas ou os custos do pedido de referência. Não lance novamente o mesmo estorno. Esses registros também não são editados diretamente depois de gravados.

O pedido continua no histórico. O relatório atribui o efeito ao pedido original, considerando ajustes registrados com data até o fim da consulta. Assim, um estorno de outro mês não funciona como lançamento isolado de fluxo de caixa no mês do estorno. As unidades do relatório permanecem as quantidades originalmente vendidas; não representam unidades líquidas de devoluções.

<a id="s16"></a>
## 16. Conciliação de repasses

Acesse **Vendas → Conciliar repasse**.

| Campo | Orientação |
|---|---|
| Pedido | Pedido a conferir. |
| Data do repasse | Data da conferência do recebimento. |
| Repasse recebido (R$) | Total recebido referente ao pedido. Não informe somente uma parcela ou a diferença. |
| Motivo da diferença / observações | Detalhe retenções, divergências ou a fonte da informação. |

Na tabela de conciliação:

`Esperado após ajustes = recebível de referência − receita devolvida + taxas devolvidas`

`Diferença = recebido − esperado após ajustes`

- **Zero:** valores coincidem.
- **Negativo:** o valor recebido é menor que o esperado.
- **Positivo:** o valor recebido é maior que o esperado.

Exemplo: esperado R$ 16 e recebido R$ 15,50 → diferença de −R$ 0,50. Investigue a causa e confira as taxas, sem lançar o repasse como um custo adicional.

Conciliação registra comparação; não altera automaticamente a contribuição nem confirma taxas. Use **Conferir taxas realizadas** para registrar o total definitivo de cobranças quando necessário. Novas conciliações registram novas conferências de total, não somam parcelas de recebimento.

<a id="s17"></a>
## 17. Visão geral e interpretação dos resultados

Acesse **Visão geral** e ajuste **De**, **Até**, **Canal** e **Categoria**. Para todos os canais/categorias, deixe a seleção correspondente vazia.

### 17.1 Indicadores principais

| Indicador | Como é calculado | Como interpretar |
|---|---|---|
| Receita gerencial | Pagamento em produtos + subsídios reconhecidos + frete próprio + subsídio de entrega, com ajustes aplicáveis. | Receita atribuída à loja, não apenas valor pago pelo cliente. |
| Margem de contribuição, em R$ | Receita − taxas − custos variáveis. | Valor disponível para pagar despesas fixas e depois gerar resultado. |
| Despesas fixas | Soma mensal das despesas ativas nos meses abrangidos. | Gastos da operação, sem rateá-los arbitrariamente aos canais filtrados. |
| Resultado operacional | Contribuição total − despesas fixas. | Resultado gerencial da operação completa, não lucro líquido contábil. |
| Taxas e tributos | Cobranças configuradas ou total efetivo conferido, com devoluções aplicáveis. | Verifique se todos os encargos relevantes foram cadastrados. |
| Custos variáveis | Produção, embalagens por pedido e entrega, com recuperações aplicáveis. | Gastos relacionados às vendas. |

Com filtro de canal ou categoria, o resultado operacional aparece como **—**. Remova esses filtros para ver a operação total; a ausência não significa zero. As despesas fixas exibidas continuam sendo as integrais dos meses abrangidos.

Os indicadores podem misturar pedidos esperados e realizados. Consulte a indicação **Pedidos ainda esperados** e a situação das linhas nos relatórios antes de tratar o total como definitivamente conferido.

### 17.2 Ponto de equilíbrio

O sistema estima quanto precisaria vender para cobrir as despesas fixas, mantendo o mix e a rentabilidade observados no filtro.

`Margem ponderada do mix = contribuição total ÷ receita total`

`Ponto de equilíbrio em receita = despesas fixas ÷ margem ponderada`

`Ponto de equilíbrio em unidades = despesas fixas ÷ contribuição média por unidade`

As unidades são arredondadas para cima. Sem contribuição positiva ou sem base de vendas suficiente, o indicador pode aparecer como **—**. Não use média simples dos percentuais dos produtos para conferir esse número.

Exemplo: despesas de R$ 2.000 e margem ponderada de 25% → equilíbrio em receita de R$ 8.000. Se a contribuição total de um período for R$ 3.000, o resultado operacional será R$ 1.000. O sistema não subtrai novamente o rateio unitário já exibido no simulador.

<a id="s18"></a>
## 18. Relatórios de rentabilidade

Acesse **Relatórios**, selecione o período e os filtros. A tabela agrupa cada produto por canal e apresenta primeiro as maiores contribuições totais.

| Coluna | Interpretação |
|---|---|
| Produto | Produto vendido, com identificação preservada no pedido. |
| Canal | Canal ao qual o plano do pedido pertence. |
| Unidades | Quantidade originalmente registrada nas vendas selecionadas. |
| Receita | Receita atribuída ao produto após rateios e ajustes. |
| Contribuição | Receita atribuída menos taxas e custos atribuídos. |
| Por unidade | Contribuição total da linha ÷ unidades da linha. |
| Margem | Contribuição da linha ÷ receita da linha × 100; receita zero não permite percentual. |
| Situação | Prejuízo quando a contribuição é negativa; Realizado quando os pedidos estão conferidos; Inclui estimativas quando há pedidos não conferidos. |

A taxa global por pedido é calculada uma vez e distribuída entre os itens conforme o rateio selecionado. Resíduos de centavos são distribuídos para preservar os totais. A distribuição de custos de entrega entre itens usa os custos dos produtos como peso; o rateio de receita/taxas segue a opção do pedido.

Use **Exportar CSV** para analisar os dados em planilha. A exportação fornece linhas de itens dos pedidos, não necessariamente a tabela já agrupada exatamente como aparece na tela. Some ou agrupe por produto/canal quando necessário.

Produto com alta margem percentual pode gerar pouca contribuição total se vender pouco. Produto muito vendido pode gerar prejuízo acumulado se a contribuição unitária for negativa. Analise percentual, reais por unidade e total em conjunto.

<a id="s19"></a>
## 19. Importação e exportação CSV

### 19.1 Importar com prévia

Acesse **Dados e backup → Importação CSV com conferência**.

1. Escolha **Tipo**: Insumos, Produtos ou Vendas.
2. Escolha **Duplicidades**: Rejeitar lote ou Ignorar duplicados.
3. Selecione o arquivo CSV ou cole o conteúdo no campo.
4. Confira o nome de destino de cada coluna no mapeamento.
5. Clique em **Validar e visualizar**.
6. Examine linha, dados e validação. Corrija o arquivo e valide novamente se houver erros.
7. Clique em **Confirmar importação** e confirme o lote.

Use UTF-8, separador ponto e vírgula, limite de 5.000 linhas e requisição de até 20 MB. Os arquivos de exemplo estão na pasta **modelos** do projeto.

Não há atualização automática de cadastros já existentes por importação. A duplicidade é identificada por **nome de insumo**, **código de produto** e **identificador externo de venda**. Ignorar duplicados mantém o registro já existente; rejeitar lote impede a gravação quando uma duplicidade é encontrada.

A prévia valida formato e campos. Referências, vigência e duplicidades também são verificadas ao confirmar; um erro nessa etapa impede a gravação do lote inteiro. Cadastre antes os insumos, produtos e planos aos quais o arquivo fará referência.

### 19.2 Dicionário de colunas

Os nomes abaixo são os nomes de destino usados no mapeamento. Os campos equivalentes já foram explicados nas seções de cadastro.

| Importação | Colunas |
|---|---|
| Insumos | name, category, supplier, unit, quantity, price, extra, yield, consume, active |
| Produtos | name, code, category, description, mode, cost, portions, extra, orderCost, components, active |
| Vendas | external, date, plan, payment, delivery, confirmed, allocation, items, storeDiscount, platformDiscount, subsidy, freight, ownFreight, deliveryCost, deliverySubsidy, actualFees |

| Valor especial | Formato |
|---|---|
| unit | kg, g, L, ml ou un. |
| consume | g, ml ou un. |
| mode | manual ou recipe. |
| allocation | revenue ou quantity. |
| active, ownFreight, confirmed | true ou false; use esses textos, não Sim/Não. |
| date | AAAA-MM-DD. |
| Valores monetários | Por exemplo 10,50 ou 10.50. |
| plan | Identificador interno do plano, obtido na exportação de planos. |
| supplier | Identificador interno do fornecedor, se for usado. |
| components e items | Listas estruturadas em JSON, conforme exemplos abaixo. |

Os campos básicos obrigatórios de insumo são nome, unidades, quantidade, preço e rendimento; em produto, nome, código, modo e custo manual ou composição; em venda, identificador, data, plano e itens. Use os modelos para preservar a estrutura e confira os valores padrão na prévia.

Na importação de produto com **mode = recipe**, inclua **cost = 0** como campo de compatibilidade e preencha **components** e **portions**. Nesse modo, o custo usado no cálculo vem dos componentes, não desse zero. Deixar a coluna cost vazia pode causar rejeição de campo obrigatório na importação. Pelo cadastro visual, esse tratamento é automático.

Componente de ficha:

```json
[{"kind":"ingredients","id":"ID_DO_INSUMO","quantity":100}]
```

Para componente de produto/combinação, use **kind: products** e o identificador do produto. Componentes usam identificadores internos, não o código comercial nem o nome.

Item de venda:

```json
[{"product":"ID_DO_PRODUTO","quantity":1,"price":20}]
```

No CSV, coloque o JSON entre aspas e duplique suas aspas internas, como no modelo vendas.csv. Para as primeiras fichas ou vendas, o formulário visual costuma ser mais simples.

### 19.3 Exportações

Em **Dados e backup → Exportar cadastros**, há opções para Insumos, Produtos e fichas, Planos e taxas, Precificação e Vendas. As tabelas exportam o conteúdo cadastrado; estruturas como componentes aparecem em JSON dentro da célula.

A exportação de vendas preserva o cadastro original; conferências e ajustes ficam integralmente disponíveis no backup e são refletidos nos relatórios. Para análise atualizada, prefira a exportação de Relatórios.

**CSV é para consulta e tratamento de dados. Backup JSON é para recuperação completa.**

<a id="s20"></a>
## 20. Backup, restauração e conservação dos dados

### 20.1 Fazer backup

1. Entre em **Dados e backup**.
2. Clique em **Baixar backup completo**.
3. Guarde o arquivo com data e identificação do estabelecimento.
4. Mantenha uma cópia em outro local de sua escolha, fora deste computador.

O backup inclui cadastros, fotografias das vendas, conferências, ajustes e histórico **somente da empresa selecionada**, com identificação da origem. Faça uma cópia de cada empresa antes de importações grandes, revisões de custos e restaurações. A tela não gera um arquivo único de toda a carteira.

### 20.2 Restaurar

1. Faça um backup da situação atual.
2. Selecione o arquivo em **Restaurar backup**.
3. Confira se o arquivo corresponde ao estabelecimento e ao período pretendidos.
4. Quando solicitado, digite **SUBSTITUIR**.
5. Aguarde o resultado e confira produtos, vendas e relatórios.

A restauração substitui somente a base da empresa selecionada; não combina duas bases. Um backup identificado como de outro estabelecimento é bloqueado. Em arquivo antigo sem identificação, confira com cuidado a empresa de destino. O sistema valida formato, versão, referências e totais históricos. Antes de substituir, salva uma cópia na subpasta **backups** da base daquele estabelecimento. Arquivo inválido não deve substituir os dados válidos.

Depois da migração, os bancos ativos ficam no volume Docker **margem_ifood99_data**, em **/app/data** dentro do container. O banco original é gestao.sqlite, os demais ficam em companies/identificador/gestao.sqlite e o cadastro central é empresas.sqlite. A pasta data do projeto fica preservada como cópia anterior à migração. Use o backup da tela para cada empresa ou **BACKUP_DOCKER.bat** para a carteira completa. Não copie um banco aberto isoladamente, pois há arquivos auxiliares de gravação.

Para testar restauração ou demonstração em base separada, siga as instruções técnicas de **DATA_DIR** no README. A demonstração fica em **data/demo**, separada da operação real. Não restaure uma demonstração sobre seus dados reais.

<a id="s21"></a>
## 21. Exemplo completo: do custo à venda

Este exercício pode ser feito em uma base de demonstração ou acompanhado apenas como conferência. As taxas abaixo são fictícias.

### 21.1 Cadastros do exemplo

| Cadastro | Valores |
|---|---|
| Estabelecimento | 300 pedidos/mês; 600 unidades/mês; margem alvo 20%. |
| Insumo Carne | 1 kg; compra R$ 20; aquisição R$ 0; rendimento 80%; consumo g. |
| Produto Hambúrguer teste | Código TESTE-H; ficha técnica; 1 porção; carne 400 g; outros custos zero; embalagem por pedido zero. |
| Plano | Vigente hoje; comissão fictícia de 25% sobre subtotal antes dos descontos; taxa fixa fictícia de R$ 2 uma vez por pedido. |
| Despesas fixas | Total fictício de R$ 600/mês, vigente hoje. |

O custo de carne aproveitável é R$ 0,025/g. Assim, o custo do produto é **400 × 0,025 = R$ 10**.

### 21.2 Simulação sem despesas fixas na meta

Selecione o produto e plano; informe **2 unidades**, preço **R$ 20**, margem **20%**, sem descontos/frete e sem incluir despesas fixas.

| Memória | Resultado do pedido |
|---|---|
| Receita: 2 × R$ 20 | R$ 40,00 |
| Comissão: 25% × R$ 40 | R$ 10,00 |
| Taxa fixa por pedido | R$ 2,00 |
| Custos dos produtos: 2 × R$ 10 | R$ 20,00 |
| Recebível: 40 − 10 − 2 | R$ 28,00 |
| Contribuição: 40 − 10 − 2 − 20 | R$ 8,00 |
| Margem de contribuição: 8 ÷ 40 | 20% |
| Contribuição média por unidade | R$ 4,00 |

O recebível de R$ 28 não é lucro de R$ 28: R$ 20 correspondem ao custo dos produtos. O restante de R$ 8 ainda precisa ajudar a cobrir despesas fixas.

### 21.3 Mesma meta com rateio de despesas

R$ 600 ÷ 600 unidades = **R$ 1 por unidade** de rateio. Para atingir 20% depois desse rateio, o preço teórico é:

`(10 + 2/2 + 1) ÷ (1 − 0,25 − 0,20) = 21,818181…`

O preço final em centavos é **R$ 21,82 por unidade**. Para 2 unidades:

| Memória | Resultado |
|---|---|
| Receita | R$ 43,64 |
| Comissão arredondada | R$ 10,91 |
| Taxa fixa | R$ 2,00 |
| Custo dos produtos | R$ 20,00 |
| Contribuição antes do rateio | R$ 10,73 |
| Rateio das 2 unidades | R$ 2,00 |
| Resultado estimado após rateio | R$ 8,73 |

Os R$ 8,73 equivalem a aproximadamente 20% da receita; o percentual do cartão de contribuição refere-se aos R$ 10,73 antes do rateio e será maior. Essa distinção é esperada.

### 21.4 Registrar e conferir

1. Aplique o preço sugerido.
2. Em Vendas, registre um pedido de 2 unidades no preço aplicado.
3. Confira que não há descontos/frete e salve como esperado.
4. Quando souber as cobranças reais, use Conferir taxas realizadas e informe o total efetivo.
5. Registre a conciliação com o repasse total recebido.
6. No relatório do mês, compare receita, contribuição e despesas fixas. O resultado operacional usa a soma das contribuições menos a despesa mensal; não repete o rateio unitário como outra dedução.

### 21.5 Exemplo separado de desconto

Produto a R$ 30; desconto da loja de R$ 3; desconto da plataforma de R$ 2; subsídio integral de R$ 2. Cliente paga **R$ 25**; receita da loja em produtos é **R$ 27**. Se só R$ 1 do desconto da plataforma for reembolsado, essa receita será **R$ 26**. A cobrança de comissão depende da base selecionada no contrato.

<a id="s22"></a>
## 22. Rotinas diária, semanal e mensal

| Frequência | Rotina | Resultado esperado |
|---|---|---|
| Antes de definir o primeiro preço | Completar custos, planos, despesas e previsões; simular com memória de cálculo. | Preço baseado em dados conferidos. |
| A cada compra com alteração de preço | Atualizar insumos ou custos manuais e conferir fichas. | Custo atual disponível nas próximas simulações. |
| Diariamente | Registrar vendas, descontos, subsídios e entrega; conferir identificadores para não duplicar. | Painel alimentado com pedidos reais. |
| Quando chegar o demonstrativo | Conferir taxas realizadas e conciliar repasse. | Diferenças conhecidas e resultados mais confiáveis. |
| Quando ocorrer devolução | Registrar ajuste com receita devolvida, taxas retornadas e custos recuperados. | Histórico e contribuição ajustados. |
| Semanalmente | Filtrar o período, analisar produtos deficitários e comparar os canais. | Lista de preços/custos que precisam de revisão. |
| Semanalmente e antes de alterações grandes | Fazer backup completo. | Cópia de recuperação atualizada. |
| Mensalmente | Conferir despesas, vigências, mensalidades efetivas e previsões de volume. | Rateios e resultado operacional coerentes. |
| Ao mudar contrato | Criar nova versão de plano e revisar preços por canal. | Novas vendas com regras corretas sem alterar pedidos antigos. |
| No fechamento mensal | Conferir pedidos esperados, ajustes, taxas e relatório do mês inteiro; exportar e guardar backup. | Registro gerencial do fechamento, lembrando que consultas futuras podem refletir ajustes e alterações de despesas. |

<a id="s23"></a>
## 23. Mensagens e solução de problemas

| Situação / mensagem | O que conferir |
|---|---|
| Navegador não abre o sistema | Inicie INICIAR.bat, mantenha o servidor aberto e confirme o endereço local. |
| Nenhum registro no painel | Vendas precisam ser registradas; confira período e filtros. Simulações não são vendas. |
| Produto sem custo / custo pendente | Informe custo manual válido ou complete a ficha técnica. |
| Ficha técnica vazia | Adicione ao menos um componente no modo ficha. |
| Unidade incompatível | Confira compra kg/g, L/ml ou unidade e a unidade de consumo correspondente. |
| Código de produto já cadastrado | Altere o código ou edite o registro existente. |
| Ciclo na composição | Remova a ligação que faz um produto conter a si mesmo direta ou indiretamente. |
| Plano fora da vigência | Use plano válido para hoje no simulador ou para a data da venda. |
| Vigências sobrepostas | Revise o nome de versão e as datas de planos do mesmo nome/canal. |
| Descontos excedem subtotal | Confira quantidade × preço e os dois descontos totais. |
| Subsídio excede desconto da plataforma | Subsídio de produtos não pode superar o respectivo desconto. Subsídio de entrega tem campo próprio. |
| Preço sugerido indisponível | Confira custo, meta, taxas e regras com limites. Uma configuração pode ser inviável; planos com degraus exigem simulação manual. |
| Preço da tabela diferente do simulador | Compare quantidade, descontos, frete, rateio, aumento de custo, meta e arredondamento. |
| Informe taxas efetivas para confirmar | Preencha o total real antes de marcar a venda como conferida. |
| Identificador externo já importado | O pedido já existe; não crie outra venda para resolver uma diferença de taxas. |
| Ajustes excedem valores originais | Confira os ajustes acumulados e evite repetir uma devolução. |
| Resultado operacional aparece — | Remova filtros de canal e categoria. |
| Conciliação com diferença | Confira taxas efetivas, receita, subsídios, frete e estornos; anote a causa. |
| Backup inválido ou totais inconsistentes | Use arquivo completo gerado pelo sistema, sem edição manual, e confira a versão. |
| Erro ao confirmar importação validada | Confira referências, vigência, produtos ativos e duplicidades; a prévia não substitui essas verificações finais. |

Não resolva um lançamento errado criando outro pedido positivo idêntico: isso duplica receita. Pedidos, conferências e ajustes não têm edição/exclusão direta nesta versão. Para um erro que as rotinas existentes não corrigem, preserve backup e solicite correção assistida, sem improvisar valores negativos em campos que não os aceitam.

<a id="s24"></a>
## 24. Limites da versão e glossário

### 24.1 Limites importantes para a leitura dos resultados

- Operação local de múltiplos estabelecimentos, com dados separados, sem login multiusuário e sem acesso pela rede nesta configuração. O operador local pode consultar todos os clientes; o seletor não é um controle de acesso de usuários.
- Sem integração automática com iFood/99, publicação de preços, emissão fiscal, estoque ou contas a pagar.
- Regras e tributos dependem dos dados informados; o sistema não interpreta o contrato nem apura o regime tributário.
- Custos de produtos são preservados na gravação do pedido; não há reconstrução automática de custos passados para vendas lançadas depois.
- Despesas fixas são mensais, sem proporcionalidade diária, e o relatório usa seus cadastros atuais.
- Observações contratuais de despesas não executam condições automáticas.
- A sugestão automática não atende planos com limites de incidência; use o cálculo manual nesses cenários.
- A indicação de preço para revisão não substitui a revisão de todas as hipóteses e despesas.
- Conferência de taxas e conciliação de recebimento são rotinas diferentes.
- Cancelamentos dependem dos valores informados e não reduzem automaticamente a quantidade original vendida.
- A versão implementada não equivale a contabilidade oficial, fechamento fiscal ou demonstração de lucro líquido.

### 24.2 Glossário

| Termo | Significado |
|---|---|
| Custo variável | Gasto relacionado às unidades/pedidos vendidos, como produção, embalagem e entrega suportada pela loja. |
| Despesa fixa | Gasto mensal que precisa ser coberto pela contribuição da operação. |
| Receita gerencial | Receita atribuída à loja incluindo subsídios reconhecidos e frete próprio, quando aplicáveis. |
| Recebível | Receita menos cobranças; ainda contém valores necessários para pagar custos variáveis. |
| Margem de contribuição | Receita menos taxas e custos variáveis, em reais ou como percentual da receita. |
| Resultado após rateio | Contribuição menos uma parcela estimada de despesas fixas atribuída à unidade/pedido. |
| Resultado operacional | Contribuição total do período menos as despesas fixas consideradas. |
| Margem percentual | Resultado escolhido dividido pela receita; o nome do resultado precisa acompanhar o percentual. |
| Markup | Relação entre preço e custo. Não é sinônimo de margem; a tela trabalha com meta de margem sobre receita. |
| Rateio | Distribuição de um total entre unidades, pedidos ou itens usando uma base definida. |
| Subsídio | Valor financiado pela plataforma e efetivamente reconhecido em favor da loja. |
| Rendimento | Parcela aproveitável da quantidade comprada. |
| Vigência | Período em que o plano ou valor pode ser aplicado. |
| Esperado | Resultado ainda dependente de confirmação dos dados reais. |
| Realizado | Resultado marcado como conferido nas condições disponíveis no sistema. |
| Ponto de equilíbrio | Volume estimado de receita/unidades necessário para cobrir despesas fixas com o mix observado. |
| Fotografia da venda | Cópia preservada dos valores e regras usados quando o pedido foi registrado. |

<a id="s25"></a>
## 25. Checklist de conferência antes de usar um preço

- [ ] Quantidades de compra e consumo estão nas unidades corretas.
- [ ] Rendimento foi informado sem repetir a mesma perda.
- [ ] O produto usa custo manual ou ficha completa, sem duplicar os custos.
- [ ] Porções da receita correspondem ao lote cadastrado.
- [ ] Embalagens por unidade e por pedido foram distinguidas.
- [ ] Taxas foram conferidas com o contrato do canal e estão na ordem correta.
- [ ] A base de cada comissão, taxa ou tributo corresponde ao contrato.
- [ ] Mensalidades não foram repetidas como taxa por pedido.
- [ ] Previsões de volume e despesas fixas foram revisadas.
- [ ] Quantidade, descontos, subsídios e entrega da simulação representam o cenário pretendido.
- [ ] Você sabe se a meta é antes ou depois do rateio de despesas fixas.
- [ ] O resultado foi lido como valor por pedido ou por unidade corretamente.
- [ ] A memória de cálculo foi conferida antes de aplicar o preço.
- [ ] O preço foi atualizado manualmente na plataforma, quando necessário.
- [ ] Há um backup recente dos cadastros e vendas.

**Pergunta de controle:** se eu vender este produto neste canal, com estas condições, quanto sobra para pagar as despesas fixas? A resposta está na contribuição. Depois de reunir as contribuições do período e descontar as despesas fixas uma vez, você chega ao resultado operacional gerencial.

<a id="s26"></a>
## 26. Empresas: cadastro, alteração e resultados por cliente

### 26.1 O que mudou

O sistema agora permite administrar uma carteira de estabelecimentos. Produtos, insumos, categorias, fornecedores, planos, taxas, preços, despesas fixas, pedidos, ajustes, conferências e conciliações pertencem a uma empresa específica. Os registros anteriores continuam no estabelecimento original, sem apagar ou movimentar o banco anterior.

A empresa em uso aparece no seletor lateral e abaixo do título da página. Antes de cadastrar ou alterar dados, confira esse nome. O menu **Estabelecimento** configura as premissas da empresa selecionada; o menu **Empresas** administra a carteira de clientes.

### 26.2 Cadastrar ou alterar um estabelecimento

1. Abra **Empresas**.
2. Clique em **+ Cadastrar empresa**; para mudar um cliente existente, use **Alterar** na linha dele.
3. Preencha os campos e clique em **Salvar empresa**.
4. Clique em **Acessar** no cliente desejado ou selecione-o no campo **Estabelecimento em uso**.
5. Configure suas previsões em **Estabelecimento** e seus cadastros nas demais rotinas.

| Campo | Como usar |
|---|---|
| Nome do estabelecimento | Nome obrigatório exibido nas telas, no seletor e no comparativo. |
| Razão social | Identificação jurídica opcional. |
| CNPJ / documento | Identificação opcional. Documento repetido, desconsiderando pontuação, é bloqueado. O sistema não consulta a Receita Federal nem certifica a validade cadastral. |
| Responsável / contato | Pessoa ou referência responsável pelo cliente. |
| E-mail | Endereço opcional, com validação de formato. |
| Telefone | Telefone de contato opcional. |
| Observações | Informações administrativas do cliente. |
| Empresa ativa | Marcada: permite operação normal. Desmarcada: arquiva sem apagar o histórico e bloqueia gravações até a reativação. |

Cada empresa nova começa sem vendas e sem produtos. São criados os canais básicos iFood, 99 e Venda direta, sem taxas presumidas. Não há cópia automática dos custos ou contratos de outro estabelecimento.

### 26.3 Trocar de empresa e manter a separação

A seleção vale para todas as rotinas da tela. Ao trocar, os formulários, filtros e resultados em memória são reiniciados e o painel passa a mostrar os dados do cliente escolhido. Um formulário aberto pode pedir confirmação para ser descartado; dados não salvos não são transferidos.

Cada aba do navegador guarda sua própria seleção. É possível trabalhar com A em uma aba e B em outra sem trocar uma seleção global do servidor. Confira o nome no cabeçalho antes de salvar.

O mesmo código de produto e o mesmo identificador externo de pedido podem existir em empresas diferentes. Dentro da mesma empresa, as regras de duplicidade continuam valendo. Um pedido de A não aceita produto ou plano exclusivo de B. Importações, exportações, históricos e backups também respeitam a empresa escolhida.

Para atualizar custos, taxas, despesas ou produtos de um cliente, primeiro acesse esse cliente e depois use a rotina correspondente. Alterar o custo de A não muda o custo de B. Alterar o nome em **Estabelecimento** também atualiza o nome mostrado na carteira.

### 26.4 Ver vendas e relatórios de um cliente

1. Selecione a empresa.
2. Abra **Vendas** para consultar ou registrar seus pedidos.
3. Abra **Relatórios**, defina o período e, se necessário, canal e categoria.
4. Confira receita, contribuição, quantidade e situação de conferência.
5. Para o resultado operacional completo daquele cliente, consulte o painel sem filtro de canal/categoria.

Os capítulos anteriores continuam válidos, sempre dentro da empresa selecionada.

### 26.5 Comparar quanto cada cliente está gerando

Abra **Resultados por empresa**. Esse menu é consolidado e não se limita à empresa do seletor lateral.

1. Escolha **De** e **Até**, usando o mesmo período para comparar os clientes.
2. Marque **Incluir empresas arquivadas** quando quiser considerar clientes encerrados.
3. Consulte os totais da carteira e a linha de cada estabelecimento.
4. Clique em **Abrir empresa** para acessar os detalhes do cliente.
5. Use **Exportar por empresa** para baixar a comparação em CSV.

| Coluna | Interpretação |
|---|---|
| Empresa | Cliente e situação ativa/arquivada. |
| Pedidos | Quantidade de pedidos registrados no período. |
| Receita | Receita gerencial daquele estabelecimento, após ajustes aplicáveis. |
| Taxas | Total de cobranças previstas ou efetivamente conferidas. |
| Custos variáveis | Produção, embalagens e entrega atribuídas às vendas. |
| Contribuição | Receita menos taxas e custos variáveis. |
| Despesas fixas | Despesas do cliente nos meses abrangidos, sem rateio entre empresas. |
| Resultado operacional | Contribuição daquele cliente menos suas despesas fixas. |
| Margem operacional | Resultado operacional dividido pela receita × 100; sem receita, o percentual não é calculado. |
| Conferência | Informa pedidos esperados, pedidos conferidos ou ausência de vendas. |
| Ação | Acesso à empresa para detalhar a operação. |

O comparativo ordena os clientes pelo resultado operacional, do maior para o menor. O total é a soma dos estabelecimentos incluídos no filtro. Se arquivadas estiverem desmarcadas, seus resultados não entram nos totais.

Exemplo fictício no mesmo mês: A tem receita de R$ 100, taxas de R$ 20, custos de R$ 40 e despesas de R$ 10. Contribuição = R$ 40; resultado operacional = R$ 30; margem operacional = 30%. B tem receita de R$ 100, taxas de R$ 10, custos de R$ 60 e despesas de R$ 5. Resultado = R$ 25. O total das duas empresas é R$ 55, sem duplicar suas despesas.

**Resultado do cliente é diferente da remuneração do gestor.** Esses indicadores medem a operação do estabelecimento, considerando os dados cadastrados. Não calculam quanto você recebe de honorários, sua comissão de gestão ou o lucro da sua prestação de serviços.

Valores de pedidos ainda não conferidos tornam o resultado uma estimativa. Despesas continuam integrais por mês abrangido: um filtro de uma semana pode descontar um mês inteiro. Não interprete esses resultados como lucro líquido contábil ou saldo bancário.

### 26.6 Arquivar e reativar

Em **Empresas → Alterar**, desmarque **Empresa ativa** para arquivar. O histórico permanece consultável pelo seletor e pelo botão **Consultar histórico**. Para fazer novos lançamentos ou restaurar um backup, reative a empresa. É obrigatório manter pelo menos uma empresa ativa.

Arquivar não apaga despesas ou vendas passadas. No consolidado, use a opção de incluir arquivadas para analisar períodos anteriores da carteira completa. Não existe exclusão definitiva de empresa pela interface.

### 26.7 Backup por empresa e recuperação da carteira

O arquivo baixado em **Dados e backup** pertence somente ao cliente em uso. Faça uma cópia de cada empresa e confira o nome na tela. O sistema bloqueia restaurar um backup identificado como de A em B. Arquivos antigos sem identidade explícita exigem conferência manual do destino.

Para conservar toda a carteira, os dados cadastrais e os identificadores usados nos backups, encerre o servidor e copie a pasta de dados inteira, incluindo o cadastro central **empresas.sqlite** e a subpasta **companies**. Evite reconstruir manualmente os identificadores de empresas depois de perder o cadastro central.

A separação evita misturar lançamentos entre clientes, mas não cria logins ou permissões individuais. O uso continua local, por um operador autorizado a administrar a carteira.

<a id="s27"></a>
## 27. Bases iFood e frete grátis ao consumidor

### 27.1 Incluir ou consultar a base

Em **Planos e taxas**, o quadro de referências apresenta os percentuais, a origem e a data de consulta de 28/10/2026. O botão **Adicionar bases iFood nesta empresa** cria quatro planos e dois modelos de despesa inativos na empresa escolhida. Repetir o comando não duplica essa base nem altera contratos existentes.

Os planos são Básico (entrega pela loja) e Entrega (parceiros iFood), cada um com uma variante de frete grátis ao cliente. Todos são bases de precificação, não confirmação do seu contrato individual.

A referência de pagamento online adotada vem do [artigo oficial de taxas](https://blog-parceiros.ifood.com.br/taxas-ifood/). A [página de entregas](https://parceiros.ifood.com.br/restaurante/como-funciona/entregas) publica outro percentual. Essa divergência fica visível na tela. Confira o Portal do Parceiro e, quando necessário, use **Nova versão** para ajustar a regra ao contrato.

### 27.2 Novos parâmetros e informações do plano

| Parâmetro / informação | Como funciona |
|---|---|
| Frete ao consumidor | Conforme o pedido ou Grátis para o cliente. |
| Fonte e data | Identificam a origem pública da referência; não significam monitoramento automático de mudanças. |
| Mensalidade de referência | Valor e limite de faturamento informativos, não cobrança automática. |
| Base de incidência inicial | Subtotal de produtos antes de descontos, sem frete; hipótese a conferir com o contrato. |
| Pagamento Online | Identificação exata que aciona a taxa de processamento do iFood nos modelos. |

### 27.3 Simular com frete grátis

1. Abra **Precificação** e selecione produto e plano com frete grátis.
2. Ao trocar de plano, o sistema zera o frete do consumidor e pede o custo/participação de entrega da loja.
3. Informe o custo real suportado pela empresa; digite zero somente se ela efetivamente não tiver esse gasto.
4. Deixe o frete do consumidor em zero e desmarque recebimento de frete do cliente.
5. Informe eventual subsídio de entrega apenas se for recebido pela loja, sem duplicar valores já abatidos do custo.
6. Calcule e confira o impacto na contribuição.

Frete grátis não zera comissão. O cliente pode não pagar a entrega e ainda assim haver custo para a loja. Não há um preço fixo de entrega definido automaticamente por estas referências. Se o iFood já estiver cobrando participação promocional nas taxas efetivas totais de uma venda, não repita o mesmo valor como custo de entrega.

Também é obrigatório informar o custo de entrega ao simular ou registrar uma venda na referência de entrega própria. Ao mudar o plano no formulário de venda, confira pagamento, modalidade, frete e custo; os valores iniciais são ajustados para o cenário escolhido.

A tabela Produto × canal não calcula uma sugestão automática quando o custo de entrega necessário ainda é desconhecido. Use **Simular**, informe esse custo e então encontre o preço. Não interprete um traço nessa tabela como custo zero ou ausência de comissão.

### 27.4 Mensalidades e demais custos

Em **Despesas fixas**, os dois modelos ficam inativos para evitar somar contratos alternativos. Ative apenas a mensalidade efetivamente devida e ajuste a vigência. A condição de faturamento é uma observação, não um teste automático. Para incluí-la na formação de preço, marque despesas fixas na meta do simulador e confira o rateio.

Taxas da sua maquininha, antecipação, publicidade, impostos e outras condições precisam de cadastro próprio. Estas bases não os incluem por presunção. Se por “taxa grátis” você estiver se referindo a isenção de comissão ou mensalidade, ela depende de condição comercial específica e deve ter sua própria versão e vigência; não use o cenário de frete grátis como substituto dessa isenção.

<a id="s28"></a>
## 28. Execução no Docker e backup completo

O sistema agora funciona em um container Docker, mantendo os bancos SQLite e a separação por estabelecimento. O endereço continua http://127.0.0.1:3333/.

- Abra o Docker Desktop antes de iniciar.
- Execute INICIAR.bat; a janela pode ser fechada após a confirmação.
- Execute PARAR.bat para pausar o serviço.
- Os dados ativos estão no volume margem_ifood99_data. Atualizar ou recriar a aplicação deve preservar esse volume.
- A pasta data que já existia no projeto é uma cópia anterior à migração; não é mais o local de novos lançamentos.

Para copiar a carteira inteira, execute BACKUP_DOCKER.bat. O procedimento pausa brevemente a aplicação, exporta todos os bancos e o cadastro central, verifica os registros e reinicia o serviço se ele estava funcionando. As cópias ficam em novas pastas dentro de backups, com arquivo manifest.json. Guarde uma cópia fora do computador.

A rotina Dados e backup dentro do sistema continua funcionando por empresa. Para recuperação completa ou transferência para outro computador, consulte DOCKER_OPERACAO.md; ele descreve como testar uma cópia em outro volume e outra porta antes de substituir a operação principal.

Código e instruções podem ser enviados ao GitHub. Bancos, arquivos de ambiente com credenciais e backups dos clientes ficam fora do repositório. Docker não fornece autenticação de usuários automaticamente; o sistema continua restrito ao uso local.
