# Animações AQUILA

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

A troca de tema da cápsula usa 500 ms para fundo, borda, texto e símbolo. O item da seção atual ganha um sublinhado animado. A assinatura combina o símbolo original com letras vetoriais de traço fino; o nome recolhe gradualmente e o símbolo aumenta 16%. O percurso começa após 48 px e se estende por 70% da altura do hero, com mínimo de 420 px. A resposta acompanha a rolagem com suavização temporal de 110 ms, nos dois sentidos. Movimento reduzido mantém a assinatura inteira e elimina as transições.

Verificação: `npm run build`, `npm run test:aquila-motion` e `npm run test:aquila-flow`, com servidor em `127.0.0.1:5175` ou variável `AQUILA_URL`.
