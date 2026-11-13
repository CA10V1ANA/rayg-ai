# Animações AQUILA

## Abertura do site

Na abertura de cada carregamento, o símbolo é desenhado no centro, cercado pelo círculo de partículas rosé que converge durante a formação da marca. As letras QUILA aparecem em uma linha horizontal abaixo dele. Depois, o conjunto sobe em linha reta e segue para a esquerda; as letras se reorganizam no formato da navbar durante o encaixe final. O círculo desaparece suavemente quando o conjunto começa a subir e seu processamento é interrompido. A posição final é medida no elemento real. O site fica oculto e suas animações pausadas até a chegada. A abertura dura aproximadamente 4,1 segundos. Pular abertura e Escape encerram a cena e devolvem o foco ao conteúdo. Movimento reduzido dispensa a cena. Redimensionar a tela durante o deslocamento encerra a abertura com segurança.

Os títulos do hero e o 3D iniciam após a chegada da marca. `npm run test:aquila-intro` verifica as fases, o alinhamento do pouso, encerramento automático, recarregamento, teclado, acessibilidade e movimento reduzido. `npm run export:html` gera `entregas/AQUILA-site-completo.html` com CSS, imagens e JavaScript incorporados, para abertura offline.

Aplicação atual: `src/main.jsx` carrega `Aquila.jsx`. A revisão cobre a página que está em uso, os modais e o menu. Os componentes da versão anterior em `App.jsx` não são carregados pela página atual.

- Rolagem: entrada única com opacidade, deslocamento de 12 px e desfoque de 3 px; 500 ms, intervalo de 40 ms entre irmãos, limitado a 200 ms. Títulos, experiência de nitidez, coleção, origem, perguntas e rodapé têm gatilhos individuais de visibilidade.
- Conteúdo já visitado permanece visível. Foco de teclado revela imediatamente o bloco. Sem IntersectionObserver, o conteúdo permanece visível. Movimento reduzido revela tudo sem transição, inclusive se a preferência mudar durante a navegação.
- Modal: abertura de 250 ms, fechamento de 150 ms, escala 0,96 e fundo escuro com entrada/saída gradual.
- Etapas e formas de pagamento: entrada e saída simultâneas em 250 ms, deslocamento de 8 px, desfoque de entrada de 3 px, direção conforme avançar/voltar. Conteúdo saindo fica inerte e fora da árvore de acessibilidade. O formulário saindo perde o ID para não receber o envio destinado ao formulário atual.
- Revisão dos dados: mesma curva suave do restante do fluxo. Check em 500 ms, desenho iniciado após 80 ms; saída mais curta em 150 ms.
- Menu móvel: entrada de 250 ms e saída de 150 ms, preservando Escape e navegação por teclado.
- Acordeões, respostas dos botões, transformação da marca e movimento próprio dos óculos foram inspecionados. Tempos específicos da cena do produto são mantidos, pois não correspondem a uma troca de interface. O botão de pausa e o suporte a movimento reduzido permanecem disponíveis.

Os tokens ficam em `src/aquila.css`; `src/motion-tokens.js` lê os mesmos valores para os componentes Motion existentes, sem acrescentar bibliotecas.

## Navbar e assinatura

Navbar e embalagens usam o mesmo desenho vetorial, definido em `src/aquila-brand.js`. `AquilaBrand.jsx` apresenta os traços no navegador, enquanto as texturas das caixas, estojos e tecidos usam os mesmos caminhos no canvas, sem substituir as letras por uma fonte.

A troca de tema da cápsula usa 500 ms para fundo, borda, texto e símbolo. O item da seção atual ganha um sublinhado animado. A assinatura combina o símbolo original com letras vetoriais de traço fino; o nome recolhe gradualmente e o símbolo aumenta 16%. O percurso começa após 48 px e se estende por 70% da altura do hero, com mínimo de 420 px. A resposta acompanha a rolagem com suavização temporal de 110 ms, nos dois sentidos. Movimento reduzido mantém a assinatura inteira e elimina as transições.

## Produto e caixas 3D

O hero usa um modelo conceitual procedural com acabamento AQUILA, girando 360° em cerca de 20 segundos. A rotação respeita pausa/retomada e movimento reduzido. Fora da tela ou com a aba oculta, a cena deixa de renderizar. Se WebGL falhar, a imagem conceitual permanece como alternativa.

O modelo AQUILA é definido em `src/aquila-eyewear.js`, tomando a imagem original como referência para as lentes trapezoidais arredondadas, armação de acetato preto, ponte integrada, hastes largas e detalhes rosé. É uma aproximação procedural: a foto única não fornece as medidas nem todas as vistas do produto. Durante o carregamento, aparece um indicador discreto; a imagem 2D é exibida somente se a visualização falhar, evitando a troca entre dois óculos diferentes ao recarregar.

As caixas permitem rotação por arraste com mouse/dedo e pelas setas do teclado. Home e o botão Restaurar vista recuperam o ângulo inicial; Vista superior mostra o conteúdo por cima. A abertura pelo deslizador ou botão é independente do ângulo escolhido. A projeção se ajusta à pose atual para evitar cortes. O Prestige tem acabamento rosé menos reflexivo e marca externa escura, com a marca interna clara.

`npm run test:aquila-3d` verifica giro completo, pausa, movimento reduzido, rotação das três caixas, vista superior, teclado, toque, abertura independente, acessibilidade e alternativa após perda do contexto WebGL.

Verificação: `npm run build`, `npm run test:aquila-motion` e `npm run test:aquila-flow`, com servidor em `127.0.0.1:5175` ou variável `AQUILA_URL`.
