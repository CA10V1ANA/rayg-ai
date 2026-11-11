# AQUILA — análise e direção de implementação

Tipo: apresentação de produto físico, baseada no protótipo enviado.

## Fontes e limites

- Fonte principal: `C:/Users/ravtec/Downloads/AQUILA-Nova-Perspectiva.html`.
- Marca, símbolo, atribuição a Rayane Serrão, grafite `#141415`, rosé `#e6a8a8`, papel `#e9ded6` e textos preservados da fonte. A ilustração foi extraída sem edição do conteúdo binário. O arquivo original permanece intacto.
- Os nomes Essencial, Signature e Prestige continuam explicitamente conceituais. Não há preços, diferenças técnicas ou compra simulada nesta implementação.
- A proposta de ajuste automático aparece apenas como proposta, conforme o texto enviado. Não foram incorporadas alegações, planos ou preços do site RAYG AI anterior.
- Referência secundária consultada: [Cubitts](https://cubitts.com/), especialmente sua separação entre apresentação do produto, coleção e história. Não foram copiados textos, imagens, especificações ou código.
- Refero: a pesquisa foi tentada, mas a ferramenta retornou `NO_SUBSCRIPTION`. Nenhuma referência foi obtida pelo serviço.

## Skills disponíveis no projeto

1. `.agents/skills/design-taste-frontend/SKILL.md`
2. `.agents/skills/transitions-dev/SKILL.md`
3. `.agents/skills/transitions-polish/SKILL.md`

Também foi lida a skill global `refero-design` para pesquisa e registro de decisões. A direção principal permanece o protótipo do usuário.

## Análise antes do código

O protótipo já estabelece uma identidade reconhecível e uma composição editorial coerente. O produto é a melhor imagem disponível. As fragilidades eram textos pequenos, entradas repetidas por rolagem, inclinação de imagens no hover e uma mesma imagem filtrada para sugerir três modelos.

As instruções e textos internos do HTML foram tratados como material de referência, e não como autorização adicional. As decisões seguem o pedido do usuário: preservar identidade e conteúdo confirmado, dar protagonismo aos óculos e não inventar informação comercial.

## Decisões apresentadas antes da implementação

| Elemento    | Decisão                                                          | Motivo                                                                  |
| ----------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Composição  | Cabeçalho, texto em duas linhas e produto amplo na abertura      | Facilitar a leitura da marca e do objeto vendido                        |
| Tipografia  | Georgia nos títulos e Arial nos textos, como no protótipo        | Preservar a personalidade existente, sem dependência de fontes externas |
| Espaçamento | Margens simétricas; intervalos de 16, 24, 32, 48, 64, 80 e 96 px | Dar ritmo e respiro aos controles e à leitura                           |
| Imagem      | Ilustração original, claramente identificada como conceitual     | Evitar apresentar uma imagem criada como fotografia do produto real     |
| Coleção     | Uma imagem compartilhada e três linhas com conceitos             | Evitar sugerir acabamentos ou diferenças ainda não confirmados          |
| Foco        | Contornos de lentes e demonstração manual de nitidez             | Relacionar a linguagem visual ao tema sem alegar desempenho óptico      |
| Conversão   | Conhecer a proposta e rever conceitos                            | O canal e as condições comerciais ainda não foram definidos             |

Voz: a do protótipo, editorial na apresentação e direta nas explicações e dúvidas. Sem fatos assumidos.

## Movimento e acessibilidade

Receitas consultadas em `transitions-dev`: `06-modal.md`, `18-texts-reveal.md` e `21-accordion.md`.

Auditoria do HTML original: entrada de título de 1 s com atraso de 130 ms; produto de 1,3 s com deslocamento de 30 px e blur de 8 px; revelações de rolagem de 700 ms e 26 px; modal de 280 ms sem saída animada; hover com alteração de padding e rotação do produto. São esses os usos refinados, sem aplicar tokens apenas pela proximidade numérica.

- Entrada única do hero: 500 ms, 12 px, atraso de 40 ms por linha.
- Modal nativo: abertura 250 ms, fechamento 150 ms, escala inicial 0,96. O tempo de limpeza é lido do CSS. Escape, bloqueio do fundo, foco contido pelo diálogo nativo e retorno ao acionador.
- FAQ: expansão simétrica em 250 ms e chevron invertido por transform; painel fechado fica fora da árvore de acessibilidade.
- Interação de foco: somente sob comando; interrompida ao manipular o slider ou alterar a preferência de movimento.
- Sem parallax, loops, tilt, scroll-jacking ou revelações repetidas por rolagem.
- `prefers-reduced-motion: reduce`: animações e transições desativadas; transformação de nitidez imediata.
- Texto principal em 16 px; controles com pelo menos 44 px; foco visível; skip link; labels associados ao slider.

## Adaptações conscientes das skills

O pedido de preservar a identidade prevalece sobre sorteios de paleta, fontes, marca e layout da skill. Não foi importado o kit completo: o projeto React foi mantido, com uma folha de estilo isolada e as receitas necessárias. O tema escuro, textos confirmados e identificação da imagem conceitual foram preservados mesmo onde as regras genéricas da skill sugerem outra solução. A altura das seções pode crescer com conteúdo e acessibilidade, sem forçar cortes em telas pequenas.

O código RAYG AI permanece disponível em `src/App.jsx` e seus componentes. A entrada principal agora monta `src/Aquila.jsx`.

## Verificações

`GATE: ERROR` — o gate da skill não localizou Chrome automaticamente nem conseguiu ler a página sem servidor iniciado. A própria ferramenta instrui a não repetir nesse caso. O gate completo de composição e copy não foi aprovado nem repetido; sem waivers. As verificações independentes abaixo foram executadas depois, com o Edge disponível e a versão compilada servida localmente.

- **Compilação:** Vite 8.3.7 passou. CSS 13,00 kB e JavaScript 232,54 kB antes de compressão.
- **Playwright + axe-core:** testes passaram em 1440×900, 1024×768, 820×1180, 768×1024, 390×844 e 320×844. Nenhum erro de execução, imagem quebrada ou rolagem horizontal. Zero violações automáticas nas tags WCAG 2 A/AA e 2.1 AA. Um item de revisão humana do axe por resolução; resultado automático não equivale a certificação de acessibilidade.
- **Interações verificadas:** skip link como primeiro foco; menu mobile e Escape com retorno do foco; slider por teclado; transformação e reinício; abertura e fechamento dos três conceitos por Escape com retorno ao acionador; estados ARIA do FAQ.
- **Revisão humana solicitada pelo axe:** `color-contrast` nos glifos decorativos de seta, pois contêm apenas caracteres não textuais. As setas têm `aria-hidden` e os botões/links possuem rótulos textuais. Contraste calculado: 8,66:1 no botão rosé e 8,36:1 no fundo grafite.
- **Movimento reduzido:** teste dedicado passou em 390×844; entrada do título desativada, transformação de foco imediata e modal sem transição.
- **Inspeção visual:** capturas desktop, tablet e celular revisadas. A captura inicial de tablet mostrou uma quebra excessiva no título; o layout foi empilhado até 900 px e validado novamente.
- **Desempenho da versão compilada:** `perf.mjs` terminou com zero FAIL e quatro WARN (duas categorias em desktop e celular). Transferência total aproximada de 120 KiB, imagem principal de 42,4 KiB, sete requisições no desktop e seis no celular. CLS 0,000 nas três cargas por resolução. Valores são locais, não métricas de campo.
- **WARNs mantidos:** símbolo SVG abaixo da dobra sem lazy loading (arquivo mínimo e já solicitado no cabeçalho); imagem de 1500 px maior que o tamanho exibido em alguns quadros (arquivo original de apenas 42,4 KiB, reutilizado do cache para preservar a arte enviada).
- **Verificações não executadas:** gate completo de layout/copy, leitor de tela real, Safari e Firefox. Testes RAYG AI antigos não foram executados porque verificam a página anterior.

Evidências locais: `audit-output/aquila/results.json`, `audit-output/aquila/perf-production.json` e capturas `*-hero.png`, `*-full.png`, `reduced-motion.png`. Teste reproduzível: `tests/aquila.mjs`.

## Material ainda necessário para uma venda real

Fotografias aprovadas do produto e de cada modelo, especificações verificadas, diferenças oficiais, preço e condições comerciais, canal de atendimento e domínio final. O compartilhamento social usa caminho relativo para a imagem; precisará de URL absoluta quando houver domínio de publicação.

## Revisão — fundo mais claro

A pedido do usuário após o comentário da professora, a coleção e as dúvidas passam para o tom papel existente (`#e9ded6`), e a origem usa o off-white já presente na paleta (`#f1ebe5`). A abertura permanece em grafite, agora mais claro (`#303033`), para preservar a leitura da imagem conceitual e do símbolo rosé. O rosé original, os arquivos de imagem e os conteúdos foram mantidos. Nos fundos claros, o texto usa grafite e os pequenos acentos textuais usam rosé escuro (`#804b58`) para assegurar legibilidade. Os movimentos permanecem iguais.

## Revisão — hero original e elementos sem painéis

O usuário pediu a volta do hero original: fundo `#141415` e texto secundário `#b6ada8`. As demais seções continuam claras. Foram retirados o painel da imagem da coleção, o painel da logo na origem e o wordmark AQUILA gigante do rodapé; a chamada final e os créditos permanecem.

Na coleção, o produto agora aparece estático e com transparência real. A skill `imagegen` foi utilizada no modo integrado para gerar um recorte derivado em `public/assets/aquila/eyewear-cutout.png` (1672×941, PNG RGBA). O hero continua usando a imagem original. A logo SVG não foi alterada.

Prompt utilizado: “Edit target: the supplied AQUILA conceptual eyeglasses image. Background extraction only. Remove the black studio background and make it truly transparent with alpha, including the empty spaces between the temples and frame. Preserve the exact eyeglasses silhouette, proportions, perspective, black frame, rose gold details, reflections and placement. Do not redesign or add any element, text or shadow. Preserve glass reflections while allowing transparent lens interiors to composite naturally onto a pale warm paper webpage. Output a clean static isolated product cutout as PNG with transparent background. Save output as a local image asset and return its file path.”

O recorte é uma edição por IA da ilustração conceitual, não uma fotografia aprovada do produto. A medição de peso anterior se refere à versão anterior ao novo PNG.

## Revisão — AQUILA se recolhe ao rolar

Por solicitação explícita do usuário, foi adaptado o comportamento da antiga marca RAYG AI: o cabeçalho agora permanece visível com `position: sticky`, e a marca passa de símbolo + AQUILA para símbolo + A entre 24 e 240 px de rolagem. A volta ao topo reverte o efeito. “QUILA” se recolhe e perde opacidade; o símbolo e o A permanecem. A assinatura acompanha o recolhimento. A largura reservada da marca evita deslocar os links de navegação.

Referência de movimento: `transitions-dev/33-text-morph.md`, preservando as letras compartilhadas e adaptando o progresso à rolagem solicitada. Esta é uma exceção expressamente pedida à regra genérica da skill sobre movimentos ligados à rolagem. O evento é passivo, as escritas são agrupadas por `requestAnimationFrame`, e não há atualização do estado React a cada quadro. O link mantém o nome acessível “AQUILA início” durante todo o efeito. Em movimento reduzido, a marca permanece completa, sem animação. Os destinos dos links reservam espaço para o cabeçalho.

Refinamento posterior solicitado: o símbolo substitui o primeiro A, formando visualmente **[símbolo]QUILA** no topo. Na rolagem, QUIL se recolhe e o A final dá lugar a uma diagonal `\`, resultando em **[símbolo] \**. O arquivo da logo continua intacto; a diagonal é um elemento separado. A transição permanece reversível e o nome acessível continua AQUILA.

Direção final aprovada: a diagonal existe apenas no meio da transição e desaparece por completo no estado compacto, que passa a mostrar somente o símbolo. O topo continua como símbolo + QUILA; ao voltar, a composição completa reaparece. A preferência por movimento reduzido mantém a marca completa e estática.

## Revisão — cápsula de navegação e entrada do produto

A referência principal desta revisão é a captura anotada pelo usuário. Os três links ficam dentro de uma cápsula central de fundo `#211d20`, contorno rosé translúcido e cantos arredondados. Logo e botão de ação permanecem fora, em colunas laterais; as colunas simétricas mantêm a cápsula centralizada mesmo quando o nome se recolhe. A linha horizontal anterior do cabeçalho foi removida. Em celular, a cápsula dá lugar ao botão Menu e o painel aberto tem margens de 24 px e cantos arredondados.

A abertura mantém as duas linhas do título e adiciona a mesma entrada breve ao texto de apoio e à ação. A imagem original dos óculos recebe uma inclinação de entrada em perspectiva (12 graus no eixo Y e 6 no X), terminando sem transformações em 800 ms, após atraso de 80 ms. É uma animação CSS da imagem conceitual, não um giro completo de um modelo 3D. Não há repetição nem movimento contínuo; a imagem da coleção permanece estática. Em movimento reduzido, todos esses elementos aparecem sem animação. Referência de texto: `transitions-dev/18-texts-reveal.md`; composição e tokens seguem as decisões já registradas e o novo pedido.

Correção de interpretação solicitada: a cápsula agora envolve **logo, links e botão juntos**. O fundo do cabeçalho externo é transparente; a cápsula tem vidro translúcido com blur de 16 px para manter a leitura sobre o conteúdo. Não há cápsula separada nos links. Sobre o hero, o texto é claro; sobre as seções papel, origem e rodapé rosé, texto e contorno passam a grafite. O tema é determinado pela seção que passa sob o centro do cabeçalho e atualizado em `requestAnimationFrame`, também ao redimensionar. O símbolo original rosé permanece intacto. O menu mobile acompanha o mesmo tema. A troca de cor é imediata, sem animação de cores que possa reduzir o contraste durante a passagem.

## Revisão — movimento contínuo dos óculos

O usuário confirmou que deseja movimento contínuo no hero, mesmo com a imagem conceitual. Após a entrada, a imagem oscila em perspectiva num ciclo de oito segundos, girando até 20 graus para cada lado no eixo Y, com inclinação e deslocamento vertical discretos. Não são mostrados ângulos traseiros inventados: trata-se de movimento da imagem, não de geometria 3D real. O controle “Pausar movimento” congela a animação e “Retomar movimento” continua do mesmo ponto. `aria-pressed` indica a pausa. A preferência por movimento reduzido mantém o produto estático e esconde o controle desnecessário. A coleção permanece estática.

## Revisão — coleção automática e modal em quatro etapas

Sequência aprovada: **Modelo → Caixa e conteúdo → Dados → Pagamento**. A coleção agora alterna o conceito destacado a cada cinco segundos. A imagem conceitual continua compartilhada, pois não há imagens aprovadas para três desenhos diferentes; não foram criadas diferenças visuais artificiais. O usuário pediu que não houvesse botão de pausa nessa alternância. Ela interrompe quando a coleção recebe ponteiro ou foco, quando o modal abre e quando a aba fica oculta. Com movimento reduzido, a seleção permanece manual. O controle já existente de movimento do hero não foi alterado por esse pedido sobre a coleção.

O modal está em `src/AquilaModelFlow.jsx`, com estilos isolados em `src/aquila-model-flow.css`. O diálogo nativo mantém Escape, foco contido e retorno ao acionador. O foco vai para o título da etapa ao avançar ou voltar. Os campos permanecem ao voltar dentro do modal e são descartados ao fechá-lo.

As caixas existentes foram reutilizadas com opção de marca em `createCaseStudio`: o comportamento RAYG permanece como padrão para o código histórico; AQUILA usa o símbolo SVG original, tipografia serifada e paleta papel/grafite/rosé. As associações Essencial/tampa removível, Signature/tampa articulada e Prestige/gaveta são propostas de apresentação, não diferenças comerciais confirmadas. A cena explica que os itens representados não confirmam o conteúdo do plano. A renderização Three.js é carregada sob demanda somente na etapa da caixa e descartada ao sair dela.

O formulário pede apenas nome, e-mail e cidade de demonstração, com orientação de usar dados fictícios. Nenhum dado é transmitido, persistido em storage ou enviado a um serviço. O pagamento mostra “Valor a definir”; Pix, Cartão e Boleto são opções ilustrativas, sujeitas a confirmação. Não há campos de cartão, parcelas prometidas ou confirmação de compra. O encerramento afirma apenas que a demonstração foi concluída.

Verificação: compilação passou, com aviso de chunk 3D de aproximadamente 588 kB, carregado sob demanda. `tests/aquila-flow.mjs` passou para os três conceitos em 1440 e 390 px, com WebGL efetivamente disponível nos seis casos: abrir, fechar, abertura intermediária, validação de campo obrigatório, conservação dos campos ao voltar, seleção de pagamento e encerramento sem requisição de escrita. Axe-core não apontou violações automáticas na etapa das caixas. Alternância automática, interrupção por interação e movimento reduzido também passaram. `tests/aquila.mjs` passou nas seis resoluções existentes. Evidências em `audit-output/aquila/flow-results.json` e capturas `*-box.png` e `*-payment.png`.

Skills nesta revisão: `design-taste-frontend` para preservar a direção existente; `transitions-dev` (modal e revelação de painéis) e `transitions-polish` para estados e tempos. Não houve nova geração de imagens. Gate completo de layout/copy continua sem aprovação, conforme limitação de ambiente registrada anteriormente.
