import { lazy, Suspense, useEffect, useRef, useState } from "react";
import "./aquila-model-flow.css";

const CaseViewer = lazy(() => import("./CaseViewer.jsx"));
const steps = ["Modelo", "Caixa e conteúdo", "Dados", "Pagamento"];
const variants = {
  Essencial: "essencial",
  Signature: "pro",
  Prestige: "ultra",
};

export default function AquilaModelFlow({ model, onClose }) {
  const [step, setStep] = useState(0);
  const [details, setDetails] = useState({ name: "", email: "", city: "" });
  const [payment, setPayment] = useState("pix");
  const [complete, setComplete] = useState(false);
  const heading = useRef(null);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    heading.current?.focus({ preventScroll: true });
    heading.current?.closest("dialog")?.scrollTo(0, 0);
  }, [step, complete]);
  const change = (event) =>
    setDetails((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));

  return (
    <div className="aquila-flow">
      <p className="eyebrow">Apresentação conceitual · AQUILA</p>
      <h2 id="model-title">AQUILA {model.name}</h2>
      <p id="model-note">
        Especificações, conteúdo do kit e valores aguardam confirmação. Esta
        experiência não gera pedido ou cobrança.
      </p>
      <ol className="flow-steps" aria-label="Etapas da apresentação">
        {steps.map((label, i) => (
          <li key={label} aria-current={step === i ? "step" : undefined}>
            <span aria-hidden="true">0{i + 1}</span>
            {label}
          </li>
        ))}
      </ol>
      <div className="flow-stage" key={`${step}-${complete}`}>
        <h3 ref={heading} tabIndex="-1">
          {complete ? "Demonstração concluída" : steps[step]}
        </h3>
        {step === 0 && (
          <>
            <div className="flow-product">
              <img
                src="/assets/aquila/eyewear-cutout.png"
                alt={`Imagem conceitual compartilhada pela proposta ${model.name}`}
                width="1672"
                height="941"
              />
              <div>
                <p>{model.description}</p>
                <dl className="flow-specs">
                  <div>
                    <dt>Diferencial do modelo</dt>
                    <dd>Em definição</dd>
                  </div>
                  <div>
                    <dt>Especificações técnicas</dt>
                    <dd>A confirmar pela criadora</dd>
                  </div>
                  <div>
                    <dt>Imagem</dt>
                    <dd>Conceitual, compartilhada entre as propostas</dd>
                  </div>
                </dl>
              </div>
            </div>
            <p className="flow-note">
              Os nomes identificam direções de apresentação. As diferenças
              oficiais serão incluídas quando estiverem definidas.
            </p>
          </>
        )}
        {step === 1 && (
          <>
            <p>
              Explore uma proposta de embalagem AQUILA. Controle a abertura da
              caixa pelo botão ou pelo deslizador.
            </p>
            <Suspense
              fallback={<p role="status">Preparando a caixa AQUILA…</p>}
            >
              <CaseViewer
                variant={variants[model.name]}
                name={model.name}
                brand="AQUILA"
              />
            </Suspense>
            <dl className="flow-specs">
              <div>
                <dt>O que acompanha o plano</dt>
                <dd>Composição do kit em definição</dd>
              </div>
              <div>
                <dt>Embalagem</dt>
                <dd>Proposta conceitual para avaliação</dd>
              </div>
            </dl>
            <p className="flow-note">
              Os óculos, o estojo e o tecido representados na cena são
              ilustrativos e não confirmam os itens inclusos. Os mecanismos
              também são propostas.
            </p>
          </>
        )}
        {step === 2 && (
          <form
            id="aquila-details"
            className="flow-form"
            onSubmit={(event) => {
              event.preventDefault();
              setStep(3);
            }}
          >
            <p>
              Use dados fictícios para experimentar o formulário. Eles ficam
              somente nesta janela e são descartados ao fechá-la.
            </p>
            <label htmlFor="demo-name">
              Nome de demonstração
              <input
                id="demo-name"
                name="name"
                value={details.name}
                onChange={change}
                required
                maxLength="100"
                autoComplete="off"
              />
            </label>
            <label htmlFor="demo-email">
              E-mail de demonstração
              <input
                id="demo-email"
                name="email"
                type="email"
                value={details.email}
                onChange={change}
                required
                maxLength="150"
                autoComplete="off"
              />
            </label>
            <label htmlFor="demo-city">
              Cidade de demonstração
              <input
                id="demo-city"
                name="city"
                value={details.city}
                onChange={change}
                required
                maxLength="100"
                autoComplete="off"
              />
            </label>
            <p className="flow-note">
              Nenhum dado é enviado ou salvo. Não é necessário informar CPF,
              endereço ou dados bancários nesta demonstração.
            </p>
          </form>
        )}
        {step === 3 && !complete && (
          <>
            <dl className="flow-specs flow-summary">
              <div>
                <dt>Modelo escolhido</dt>
                <dd>AQUILA {model.name}</dd>
              </div>
              <div>
                <dt>Conteúdo do kit</dt>
                <dd>Em definição</dd>
              </div>
              <div>
                <dt>Valor total</dt>
                <dd>Valor a definir</dd>
              </div>
            </dl>
            <fieldset className="flow-payments">
              <legend>Forma de pagamento para demonstração</legend>
              {[
                ["pix", "Pix"],
                ["cartao", "Cartão"],
                ["boleto", "Boleto"],
              ].map(([value, label]) => (
                <label key={value}>
                  <input
                    type="radio"
                    name="demo-payment"
                    value={value}
                    checked={payment === value}
                    onChange={() => setPayment(value)}
                  />
                  {label}
                </label>
              ))}
            </fieldset>
            <p className="flow-note">
              Formas de pagamento ilustrativas, sujeitas a confirmação.
              Parcelas, frete e condições comerciais serão definidos com o
              valor. Nenhum pagamento será processado.
            </p>
          </>
        )}
        {complete && (
          <div className="flow-complete" role="status">
            <p>Você percorreu a apresentação do AQUILA {model.name}.</p>
            <p>
              Nenhum pedido foi criado, nenhum pagamento foi realizado e nenhum
              dado foi enviado.
            </p>
          </div>
        )}
      </div>
      <div className="flow-actions">
        {complete ? (
          <button className="button primary" onClick={onClose}>
            Voltar à coleção ↗
          </button>
        ) : (
          <>
            {step > 0 && (
              <button className="button" onClick={() => setStep(step - 1)}>
                ← Voltar
              </button>
            )}
            {step === 2 ? (
              <button
                className="button primary"
                type="submit"
                form="aquila-details"
              >
                Ir para pagamento ↗
              </button>
            ) : (
              <button
                className="button primary"
                onClick={() =>
                  step === 3 ? setComplete(true) : setStep(step + 1)
                }
              >
                {step === 0
                  ? "Ver caixa e conteúdo"
                  : step === 1
                    ? "Preencher dados"
                    : "Concluir demonstração"}{" "}
                ↗
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
