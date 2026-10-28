# Guia de uso — seu primeiro produto

1. Abra o aplicativo e entre em **Empresas** para cadastrar cada cliente. Clique em **Acessar** ou escolha o estabelecimento no seletor lateral antes de lançar qualquer dado. Os registros anteriores estão no estabelecimento original. Em **Estabelecimento**, informe nome, pedidos/unidades previstos no mês e margem alvo. Salve. Essas premissas são próprias de cada empresa.
2. Cadastre **Categorias** e **Fornecedores**, se desejar organizar o catálogo.
3. Em **Insumos**, registre os itens comprados e embalagens. Exemplo fictício: 1 kg de carne por R$ 20 com rendimento de 80%, consumo em g. O custo de 100 g aproveitáveis será R$ 2,50. Embalagem por unidade pode ser um insumo com rendimento de 100%.
4. Em **Produtos e fichas**, crie um código e nome. Escolha custo manual por unidade, ou ficha técnica. Na ficha, adicione ingredientes nas unidades de consumo; informe porções vendáveis do lote. Para combo, adicione produtos já cadastrados. Custos de mão de obra variável podem entrar nos outros custos do lote. Não registre a mesma perda ou mão de obra duas vezes.
5. Em **Despesas fixas**, informe despesas mensais e vigência. Mensalidades de plataforma entram aqui. Condições contratuais são anotações: inclua o valor apenas nos meses em que a cobrança se aplica.
6. Em **Canais**, confirme o nome do serviço contratado (iFood, 99 ou outro). Em **Planos e taxas**, crie plano, vigência e regras conforme o contrato. Exemplo apenas didático: Comissão, percentual, valor 20, base subtotal após desconto da loja. Adicione pagamento online, tributos ou outras cobranças separadamente. Para antecipação após comissão, coloque a regra depois dela e use base recebível. Valores fixos globais usam uma vez por pedido. Não copie percentuais de exemplo como se fossem os seus.
7. Em **Precificação**, selecione produto/plano, unidades no pedido e margem. Calcule um preço que você já pratica ou encontre um preço sugerido. Confira receita, cobranças, custos e contribuição na memória. Marque incluir despesas fixas para meta após rateio. **Aplicar preço** grava no sistema; atualize seu cardápio nas plataformas manualmente.
8. Em **Vendas**, registre identificador único, data, plano e itens. O preço cadastrado é sugerido ao escolher o produto; informe o preço efetivamente vendido. Informe quem financiou cada desconto, subsídio recebido, frete e entrega. Taxas efetivas e conferência permitem marcar realizado; sem isso é esperado.
9. Para cancelamento, use **Estorno / cancelamento** e registre receita devolvida, taxas retornadas e apenas os custos recuperados. Produto já preparado e perdido não representa custo recuperado. O histórico original é preservado.
10. Em **Conciliar repasse**, registre valor recebido e motivo de diferença. O valor é o repasse total do pedido, não uma parcela incremental. Novas conciliações registram novas conferências.
11. Confira **Visão geral** e **Relatórios** da empresa selecionada. Em **Resultados por empresa**, compare todos os clientes no mesmo período, com receita, contribuição, despesas e resultado operacional. O resultado pode incluir valores esperados, identificados na conferência. O resultado de cada cliente não representa o lucro dos seus honorários de gestão.
12. Em **Dados e backup**, baixe backup de cada empresa regularmente. A restauração substitui somente a empresa selecionada após confirmação, bloqueia arquivo identificado como de outra empresa e salva cópia anterior. Para conservar a estrutura completa e o cadastro central, encerre o servidor e copie a pasta de dados inteira. Teste recuperação em outra pasta usando DATA_DIR.

## Promoções e atualização de custos

Na tabela de histórico de preços, use Promoção e informe início/fim. Reaplicar cria nova versão sem apagar a anterior. Ao atualizar insumos, o custo atual muda e preços anteriores são sinalizados para revisão; vendas passadas continuam usando os custos originais.

## CSV

Use os arquivos da pasta modelos. Valores brasileiros como 10,50 são aceitos; separador é ponto e vírgula. Você pode ajustar o nome de destino de cada coluna antes de validar. Clique Validar e visualizar, corrija erros e só depois confirme. O lote é transacional. Duplicidades podem ser rejeitadas ou ignoradas, nunca sobrescritas. Produtos são identificados pelo código, insumos pelo nome e vendas pelo identificador externo.

Para fichas técnicas, a coluna components recebe uma lista JSON: `[{"kind":"ingredients","id":"ID_DO_INSUMO","quantity":100}]`. Para combos, use kind products. Para vendas, a coluna items recebe `[{"product":"ID_DO_PRODUTO","quantity":1,"price":20}]`. Copie IDs das exportações de cadastros. Em CSV, coloque o JSON entre aspas e duplique as aspas internas, como no modelo vendas.csv. O cadastro visual é recomendado para as primeiras fichas e vendas.

A exportação CSV é para análise; o backup JSON é o formato para restauração completa.

## Manual completo

Para consultar todos os campos, cálculos, rotinas e soluções de problemas, use o [Manual completo do usuário](MANUAL_DO_USUARIO.md). A versão **MANUAL_DO_USUARIO.html**, na mesma pasta, oferece índice lateral e formato para impressão pelo navegador.

Para conferir posteriormente uma venda esperada, use Vendas → Conferir taxas realizadas. Informe o total efetivo e confirme que custos e subsídios originais foram conferidos. O sistema grava uma conferência adicional; a fotografia original permanece no banco e no histórico. Se os valores de receita/custo originalmente lançados estavam errados, registre os ajustes correspondentes ou um pedido corrigido, preservando a trilha anterior.

## Base iFood de referência

Em Planos e taxas, use Adicionar bases iFood nesta empresa para cadastrar entrega própria, parceiros iFood e variantes de frete grátis ao consumidor. Consulte a fonte/data e a divergência pública da taxa de pagamento online. Os detalhes estão em REFERENCIAS_IFOOD.md e no capítulo 27 do manual. Mensalidades começam inativas: ative somente a efetivamente devida. Frete grátis mantém comissões; informe o custo/participação de entrega da loja no simulador.

## Execução atual: Docker

Abra o Docker Desktop e use INICIAR.bat. O sistema continua em segundo plano ao fechar o iniciador. Use PARAR.bat para pausar e BACKUP_DOCKER.bat para copiar toda a carteira com validação. Os dados ativos ficam no volume margem_ifood99_data; a pasta data do projeto é a cópia anterior à migração. Consulte DOCKER_OPERACAO.md e o capítulo 28 do manual.
