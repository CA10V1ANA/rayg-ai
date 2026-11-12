# Checkout AQUILA

Preços: Essencial R$ 250 (classe C); Signature R$ 400 (classe B); Prestige R$ 750 (classe A). As classes são uma referência interna: a interface apresenta apenas os nomes dos modelos e seus valores, sem classificação socioeconômica explícita. Até 10x sem juros é a condição solicitada; deverá ser habilitada na conta do recebedor. Valores de parcelas que não dividem exatamente o total em centavos são aproximados. O provedor deverá informar a composição exata preservando o total.

## Estado atual

Cadastro e revisão locais, sem envio, persistência, cobrança ou aprovação de pagamento. Fechar o modal descarta os dados. Pix e boleto mostram a identificação do comprador. Boleto também pede endereço de cobrança, separado de uma futura entrega. Cartão tem os campos sensíveis desativados até existir integração tokenizada.

## Para receber na aplicação

1. Criar e aprovar a conta do recebedor em um provedor com checkout integrado; confirmar tarifas e configurar o parcelamento sem juros assumido pelo vendedor.
2. Implementar backend de pedidos e pagamentos. Resolver preço pelo modelo no servidor; nunca confiar no valor enviado pelo navegador. Definir estoque, entrega e frete antes de cobrar.
3. Montar o componente oficial do provedor para cartão e transmitir apenas o token e os dados necessários ao backend. Nunca salvar número de cartão/CVV nem colocar chaves privadas em variáveis VITE_*.
4. Criar Pix e boleto no servidor. Exibir somente QR Code, copia e cola, linha digitável, vencimento e documento retornados pelo provedor. Emissão não significa aprovação.
5. Usar idempotência para evitar duplicidade. Validar assinatura dos webhooks, consultar o pagamento e conferir pedido, valor e moeda. Aprovar a compra somente com confirmação verificada no servidor.
6. Cobrir pendência, recusa, expiração, nova tentativa e reembolso; definir políticas de compra, privacidade e retenção dos dados.
7. Validar em ambiente de testes antes de habilitar produção.

Documentação consultada: [Checkout Bricks](https://www.mercadopago.com.br/developers/pt/docs/checkout-bricks/overview) e [cartões e notificações](https://www.mercadopago.com.br/developers/pt/docs/checkout-api-orders/payment-integration/websites/cards).

## Verificação

`npm run build` e `npm run test:aquila-flow` (servidor em 127.0.0.1:5175 ou variável AQUILA_URL).

O teste cobre preços, CPF, máscaras, formas de pagamento, dez opções de parcelas, cartão bloqueado, endereço de boleto obrigatório, revisão sem falsa aprovação, acessibilidade, descarte ao fechar, Escape/retorno de foco e ausência de envio/overflow em 1440, 1024, 768, 390 e 320 pixels. O último tamanho usa movimento reduzido.
