# AQUILA — Uma nova perspectiva

A apresentação atual está em `src/Aquila.jsx`, com estilos em `src/aquila.css`. Preserva a identidade, o símbolo, as cores e os textos do protótipo AQUILA enviado. A imagem e os nomes da coleção continuam conceituais; preços e especificações comerciais não foram adicionados.

Use Node.js 22.12+ (ou 24+) e execute `npm install`, seguido de `npm run dev`. Para produção, use `npm run build` e `npm run preview`.

O relatório de decisões, referências e verificações está em [AQUILA-DESIGN.md](./AQUILA-DESIGN.md). Para testar a página atual, mantenha o servidor local ativo e execute `npm run test:aquila`. O teste utiliza o Microsoft Edge instalado e, por padrão, acessa `http://127.0.0.1:5173`. A variável `AQUILA_URL` permite apontar para outro servidor, incluindo a versão compilada.

Os arquivos RAYG AI e seus testes anteriores foram preservados para consulta. A documentação abaixo descreve essa versão histórica, não as funcionalidades da apresentação AQUILA.

O modal de cada conceito segue Modelo → Caixa e conteúdo → Dados → Pagamento. As caixas 3D são propostas adaptadas à identidade AQUILA. O checkout é somente demonstrativo, sem transmissão de dados, geração de pedidos ou cobrança. Preços, especificações e conteúdo oficial dos kits continuam pendentes. Execute `npm run test:aquila-flow` para verificar as quatro etapas, os três mecanismos das caixas e a alternância automática dos conceitos. Esse teste usa `http://127.0.0.1:5175` por padrão, configurável por `AQUILA_URL`.

## Documentação histórica — RAYG AI

Landing page moderna, acessível e interativa para apresentação e demonstração da tecnologia de óculos com ajuste de foco e grau adaptativo via inteligência artificial.

---

## 🚀 Como Executar

### Pré-requisitos
- **Node.js** 20+ ou 22+
- Gerenciador de pacotes **npm**

### Instalação e Desenvolvimento

```sh
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento local
npm run dev
```

Acesse `http://localhost:5173` no seu navegador.

### Build de Produção

```sh
# Gerar bundle otimizado para deploy (Vercel / Netlify / Estático)
npm run build

# Pré-visualizar build localmente
npm run preview
```

Os arquivos estáticos otimizados serão gerados no diretório `dist/`.

---

## 🛠️ Tecnologias Utilizadas

- **React 19** + **Vite 6**: Estrutura reativa rápida, componentizada e otimizada.
- **Three.js**: Visualização e renderização 3D procedural do produto e estojos no browser com iluminação de estúdio e materiais físicos (`MeshPhysicalMaterial`).
- **Motion (Framer Motion)**: Animações de interface fluidas, transições de estado e suporte completo a acessibilidade com preferência de movimento reduzido (`prefers-reduced-motion`).
- **CSS Design Tokens**: Arquitetura CSS responsiva, tokens semânticos, suporte a alto contraste e layouts adaptativos mobile-first.
- **Playwright & Axe-Core**: Testes de interação ponta a ponta e auditoria de acessibilidade automatizada (WCAG 2.1 AA).

---

## ✨ Funcionalidades Principais

1. **Hero com Óculos 3D Procedural**:
   - Visualização 3D interativa de alta performance com fallback elegante em SVG.
   - Ajuste dinâmico de iluminação e reflexos nas lentes.

2. **Simulador de Foco e Grau Adaptativo**:
   - Controle manual de dioptria e modo autofoco inteligente.
   - Demonstração visual do ajuste em tempo real com indicador de nitidez.

3. **Showcase 3D de Embalagens e Cinemática dos Estojos**:
   - Três mecanismos interativos de abertura (tampa removível, tampa articulada e gaveta telescópica).
   - Movimentação suave de câmera entre perspectiva lateral e frontal.

4. **Navbar Dinâmica e Responsiva**:
   - Transição inteligente da marca RAYG AI para RAI durante o scroll.
   - Menu acessível com suporte total a navegação por teclado.

5. **Calculadora e Planos Interativos**:
   - Comparativo entre planos de aquisição (Essencial, Pro e Ultra AI).
   - Cards com física de inclinação 3D via Motion Values.
   - Modal de checkout demonstrativo local.

6. **Acessibilidade e Usabilidade**:
   - Conformidade WCAG AA.
   - Alternância para modo de Alto Contraste.
   - Respeito às preferências de movimento reduzido do sistema operacional.

---

## 🧪 Testes e Qualidade

```sh
# Executar testes de interação
npm test

# Testes da barra de navegação
npm run test:navbar

# Testes de cinemática dos estojos
npm run test:boxes

# Auditoria visual automatizada
npm run audit
```
