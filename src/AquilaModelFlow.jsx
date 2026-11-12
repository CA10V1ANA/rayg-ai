import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { formatCPF, formatPhone, validCPF, money } from "./checkout-utils.js";
import PresencePanel from "./PresencePanel.jsx";
import { readMotionTokens } from "./motion-tokens.js";
import "./aquila-model-flow.css";

const CaseViewer = lazy(() => import("./CaseViewer.jsx"));
const steps = ["Modelo", "Caixa e conteúdo", "Seus dados", "Pagamento"];
const variants = {
  Essencial: "essencial",
  Signature: "pro",
  Prestige: "ultra",
};
const methods = [
  ["pix", "Pix", "À vista"],
  ["cartao", "Cartão", "Até 10x sem juros"],
  ["boleto", "Boleto", "À vista"],
];

function Field({ label, name, value, onChange, error, ...props }) {
  return (
    <label className={props.className} htmlFor={`checkout-${name}`}>
      <span id={`${name}-label`}>{label}</span>
      <input
        {...props}
        className={undefined}
        id={`checkout-${name}`}
        name={name}
        value={value}
        onChange={onChange}
        aria-labelledby={`${name}-label`}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
      />
      {error && (
        <span className="field-error" id={`${name}-error`}>
          {error}
        </span>
      )}
    </label>
  );
}

export default function AquilaModelFlow({
  model,
  onClose,
  reducedMotion = false,
}) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [details, setDetails] = useState({
    name: "",
    email: "",
    cpf: "",
    phone: "",
  });
  const [address, setAddress] = useState({
    cep: "",
    street: "",
    number: "",
    complement: "",
    district: "",
    city: "",
    state: "",
  });
  const [errors, setErrors] = useState({});
  const [payment, setPayment] = useState("pix");
  const [paymentDirection, setPaymentDirection] = useState(1);
  const [installments, setInstallments] = useState(1);
  const [reviewed, setReviewed] = useState(false);
  const flowRoot = useRef(null);
  const reviewStatus = useRef(null);
  const reduced = reducedMotion;
  const timing = useMemo(readMotionTokens, []);
  const surface = { duration: reduced ? 0 : timing.fast, ease: timing.ease };
  const focusHeading = () =>
    flowRoot.current
      ?.querySelector(".flow-stage:not([inert]) > h3")
      ?.focus({ preventScroll: true });
  const initial = useRef(true);
  useEffect(() => {
    if (initial.current) {
      initial.current = false;
      return;
    }
    if (reviewed) {
      reviewStatus.current?.focus({ preventScroll: true });
      reviewStatus.current?.scrollIntoView({
        block: "nearest",
        behavior: reduced ? "instant" : "smooth",
      });
      return;
    }
    focusHeading();
    flowRoot.current
      ?.closest("dialog")
      ?.scrollTo({ top: 0, behavior: "instant" });
  }, [step, reviewed, reduced]);
  const go = (next) => {
    setDirection(next > step ? 1 : -1);
    setReviewed(false);
    setStep(next);
  };
  const change = (event) => {
    const { name, value } = event.target;
    setDetails((previous) => ({
      ...previous,
      [name]:
        name === "cpf"
          ? formatCPF(value)
          : name === "phone"
            ? formatPhone(value)
            : value,
    }));
    setErrors((previous) => ({ ...previous, [name]: undefined }));
    setReviewed(false);
  };
  const changeAddress = ({ target: { name, value } }) => {
    setAddress((previous) => ({
      ...previous,
      [name]:
        name === "cep"
          ? value
              .replace(/\D/g, "")
              .slice(0, 8)
              .replace(/(\d{5})(\d)/, "$1-$2")
          : name === "state"
            ? value
                .toUpperCase()
                .replace(/[^A-Z]/g, "")
                .slice(0, 2)
            : value,
    }));
    setReviewed(false);
  };
  const submitDetails = (event) => {
    event.preventDefault();
    const next = {};
    if (details.name.trim().split(/\s+/).length < 2)
      next.name = "Informe seu nome e sobrenome.";
    if (!validCPF(details.cpf)) next.cpf = "Confira o CPF informado.";
    if (!/^[1-9]{2}\d{8,9}$/.test(details.phone.replace(/\D/g, "")))
      next.phone = "Informe o DDD e um número com 10 ou 11 dígitos.";
    setErrors(next);
    if (Object.keys(next).length)
      requestAnimationFrame(() =>
        document.querySelector('.aquila-flow [aria-invalid="true"]')?.focus(),
      );
    else go(3);
  };
  const slide = {
    variants: {
      enter: (travel = 1) => ({
        opacity: 0,
        x: reduced ? 0 : travel * timing.distance,
        filter: reduced ? "none" : `blur(${timing.blur}px)`,
      }),
      rest: { opacity: 1, x: 0, filter: reduced ? "none" : "blur(0px)" },
      exit: (travel = 1) => ({
        opacity: 0,
        x: reduced ? 0 : -travel * timing.distance,
      }),
    },
    initial: "enter",
    animate: "rest",
    exit: "exit",
    transition: surface,
  };

  return (
    <div className="aquila-flow" ref={flowRoot}>
      <header className="flow-header">
        <div>
          <p className="eyebrow">
            Coleção AQUILA{model.recommended ? " · Recomendado" : ""}
          </p>
          <h2 id="model-title">AQUILA {model.name}</h2>
        </div>
        <div className="flow-price">
          <strong>{money(model.price)}</strong>
          <span>ou 10x de {money(model.price / 10)} sem juros</span>
        </div>
      </header>
      <p id="model-note">
        Conheça seu modelo, preencha seus dados e escolha como pagar.
      </p>
      <ol className="flow-steps" aria-label="Etapas da compra">
        {steps.map((label, i) => (
          <li
            key={label}
            aria-current={step === i ? "step" : undefined}
            data-done={i < step}
          >
            <span aria-hidden="true">{i < step ? "✓" : `0${i + 1}`}</span>
            {label}
          </li>
        ))}
      </ol>
      <div className="flow-stage-stack">
        <AnimatePresence initial={false} mode="popLayout" custom={direction}>
          <PresencePanel
            className="flow-stage"
            key={step}
            custom={direction}
            {...slide}
            onAnimationComplete={() => {
              if (step > 0) focusHeading();
            }}
          >
            <h3 tabIndex="-1">{steps[step]}</h3>
            {step === 0 && (
              <>
                <div className="flow-product">
                  <img
                    src="/assets/aquila/eyewear-cutout.png"
                    alt={`Óculos AQUILA ${model.name}, imagem conceitual`}
                    width="1672"
                    height="941"
                  />
                  <div>
                    <p>{model.description}</p>
                    <dl className="flow-specs">
                      <div>
                        <dt>Modelo</dt>
                        <dd>{model.name}</dd>
                      </div>
                      <div>
                        <dt>Valor</dt>
                        <dd>{money(model.price)}</dd>
                      </div>
                      <div>
                        <dt>Cartão de crédito</dt>
                        <dd>Até 10x sem juros</dd>
                      </div>
                    </dl>
                  </div>
                </div>
                <p className="flow-note">
                  Imagem conceitual. Especificações técnicas e composição do kit
                  aguardam confirmação.
                </p>
              </>
            )}
            {step === 1 && (
              <>
                <p>
                  Explore a embalagem AQUILA. Abra a caixa pelo botão ou pelo
                  deslizador.
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
                <p className="flow-note">
                  Representação ilustrativa da embalagem. Os itens inclusos
                  serão confirmados na oferta final.
                </p>
              </>
            )}
            {step === 2 && (
              <form
                id="aquila-details"
                className="flow-form"
                onSubmit={submitDetails}
              >
                <p className="flow-wide">
                  Informe os dados do comprador. O e-mail será usado para
                  acompanhar a compra.
                </p>
                <Field
                  label="Nome completo"
                  name="name"
                  value={details.name}
                  onChange={change}
                  error={errors.name}
                  required
                  autoComplete="name"
                  maxLength={100}
                  placeholder="Seu nome e sobrenome"
                />
                <Field
                  label="E-mail"
                  name="email"
                  value={details.email}
                  onChange={change}
                  required
                  type="email"
                  autoComplete="email"
                  maxLength={150}
                  placeholder="voce@exemplo.com"
                />
                <Field
                  label="CPF"
                  name="cpf"
                  value={details.cpf}
                  onChange={change}
                  error={errors.cpf}
                  required
                  inputMode="numeric"
                  maxLength={14}
                  placeholder="000.000.000-00"
                />
                <Field
                  label="Celular com DDD"
                  name="phone"
                  value={details.phone}
                  onChange={change}
                  error={errors.phone}
                  required
                  type="tel"
                  autoComplete="tel-national"
                  maxLength={15}
                  placeholder="(00) 00000-0000"
                />
                <p className="flow-note flow-wide">
                  Por enquanto, os dados ficam somente nesta janela e são
                  descartados ao fechar.
                </p>
              </form>
            )}
            {step === 3 && (
              <div className="flow-checkout-grid">
                <div className="flow-payment-main">
                  <fieldset className="flow-payments">
                    <legend>Como você prefere pagar?</legend>
                    <div className="flow-payment-options">
                      {methods.map(([value, label, note]) => (
                        <label key={value}>
                          <input
                            type="radio"
                            name="payment"
                            value={value}
                            checked={payment === value}
                            onChange={() => {
                              setPaymentDirection(
                                methods.findIndex(
                                  ([method]) => method === value,
                                ) >
                                  methods.findIndex(
                                    ([method]) => method === payment,
                                  )
                                  ? 1
                                  : -1,
                              );
                              setPayment(value);
                              setReviewed(false);
                            }}
                          />
                          <span>
                            {label}
                            <small>{note}</small>
                          </span>
                          {payment === value && (
                            <motion.span
                              className="payment-indicator"
                              layoutId="payment-indicator"
                              transition={surface}
                            />
                          )}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <div className="flow-method-stack">
                    <AnimatePresence
                      mode="popLayout"
                      initial={false}
                      custom={paymentDirection}
                    >
                      <PresencePanel
                        as="form"
                        id="aquila-payment"
                        key={payment}
                        custom={paymentDirection}
                        {...slide}
                        className="flow-method"
                        onSubmit={(event) => {
                          event.preventDefault();
                          setReviewed(true);
                        }}
                      >
                        <h4>
                          {payment === "pix"
                            ? "Dados do pagador"
                            : payment === "cartao"
                              ? "Dados do cartão"
                              : "Dados para emissão do boleto"}
                        </h4>
                        <dl className="flow-payer">
                          <div>
                            <dt>Nome</dt>
                            <dd>{details.name}</dd>
                          </div>
                          <div>
                            <dt>E-mail</dt>
                            <dd>{details.email}</dd>
                          </div>
                          <div>
                            <dt>CPF</dt>
                            <dd>{details.cpf}</dd>
                          </div>
                        </dl>
                        <button
                          type="button"
                          className="flow-edit"
                          onClick={() => go(2)}
                        >
                          Editar dados do comprador ↗
                        </button>
                        {payment === "pix" && (
                          <div className="flow-instructions">
                            <p>
                              Ao gerar o Pix, você receberá um QR Code e o
                              código copia e cola para pagar no aplicativo do
                              seu banco.
                            </p>
                            <p>
                              A compra será confirmada após a identificação do
                              pagamento.
                            </p>
                          </div>
                        )}
                        {payment === "cartao" && (
                          <>
                            <div className="flow-form flow-card-fields">
                              <label className="flow-wide">
                                Número do cartão
                                <input
                                  disabled
                                  placeholder="0000 0000 0000 0000"
                                  aria-describedby="card-note"
                                />
                              </label>
                              <label className="flow-wide">
                                Nome impresso no cartão
                                <input disabled placeholder="Nome do titular" />
                              </label>
                              <label>
                                Validade
                                <input disabled placeholder="MM/AA" />
                              </label>
                              <label>
                                Código de segurança
                                <input disabled placeholder="CVV" />
                              </label>
                              <label
                                className="flow-wide"
                                htmlFor="installments"
                              >
                                Parcelamento
                                <select
                                  id="installments"
                                  value={installments}
                                  onChange={(event) => {
                                    setInstallments(Number(event.target.value));
                                    setReviewed(false);
                                  }}
                                >
                                  {Array.from({ length: 10 }, (_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                      {i + 1}x de {money(model.price / (i + 1))}{" "}
                                      sem juros
                                      {(model.price * 100) % (i + 1)
                                        ? " (aprox.)"
                                        : ""}
                                    </option>
                                  ))}
                                </select>
                              </label>
                            </div>
                            <p id="card-note" className="flow-note">
                              O preenchimento do cartão será liberado com a
                              conexão ao serviço de pagamento.
                            </p>
                          </>
                        )}
                        {payment === "boleto" && (
                          <>
                            <div className="flow-form flow-address">
                              <Field
                                label="CEP"
                                name="cep"
                                value={address.cep}
                                onChange={changeAddress}
                                required
                                inputMode="numeric"
                                autoComplete="billing postal-code"
                                pattern="[0-9]{5}-[0-9]{3}"
                                placeholder="00000-000"
                              />
                              <Field
                                label="Endereço"
                                name="street"
                                value={address.street}
                                onChange={changeAddress}
                                required
                                autoComplete="billing address-line1"
                                maxLength={150}
                              />
                              <Field
                                label="Número"
                                name="number"
                                value={address.number}
                                onChange={changeAddress}
                                required
                                maxLength={20}
                              />
                              <Field
                                label="Complemento (opcional)"
                                name="complement"
                                value={address.complement}
                                onChange={changeAddress}
                                autoComplete="billing address-line2"
                                maxLength={80}
                              />
                              <Field
                                label="Bairro"
                                name="district"
                                value={address.district}
                                onChange={changeAddress}
                                required
                                maxLength={80}
                              />
                              <Field
                                label="Cidade"
                                name="city"
                                value={address.city}
                                onChange={changeAddress}
                                required
                                autoComplete="billing address-level2"
                                maxLength={80}
                              />
                              <label htmlFor="billing-state">
                                <span id="billing-state-label">Estado</span>
                                <select
                                  id="billing-state"
                                  aria-labelledby="billing-state-label"
                                  name="state"
                                  required
                                  value={address.state}
                                  onChange={changeAddress}
                                  autoComplete="billing address-level1"
                                >
                                  <option value="">Selecione</option>
                                  {"AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO"
                                    .split(" ")
                                    .map((uf) => (
                                      <option key={uf}>{uf}</option>
                                    ))}
                                </select>
                              </label>
                            </div>
                            <div className="flow-instructions">
                              <p>
                                O boleto será emitido com os dados do comprador
                                e o endereço de cobrança. O documento informará
                                o vencimento e a linha digitável.
                              </p>
                              <p>
                                A compra será confirmada após a compensação do
                                pagamento.
                              </p>
                            </div>
                          </>
                        )}
                      </PresencePanel>
                    </AnimatePresence>
                  </div>
                </div>
                <aside className="flow-order" aria-label="Resumo da compra">
                  <p className="eyebrow">Sua escolha</p>
                  <img
                    src="/assets/aquila/eyewear-cutout.png"
                    alt=""
                    width="1672"
                    height="941"
                  />
                  <h4>AQUILA {model.name}</h4>
                  <dl className="flow-specs">
                    <div>
                      <dt>Quantidade</dt>
                      <dd>1</dd>
                    </div>
                    <div>
                      <dt>Produto</dt>
                      <dd>{money(model.price)}</dd>
                    </div>
                    <div className="flow-total">
                      <dt>Subtotal</dt>
                      <dd>{money(model.price)}</dd>
                    </div>
                  </dl>
                  <p className="flow-note">
                    {payment === "cartao"
                      ? `${installments}x de ${money(model.price / installments)} sem juros`
                      : `À vista no ${payment === "pix" ? "Pix" : "boleto"}`}
                  </p>
                  <p className="flow-note">
                    Entrega e eventual frete serão definidos antes da cobrança.
                  </p>
                </aside>
              </div>
            )}
          </PresencePanel>
        </AnimatePresence>
      </div>
      {step === 3 && (
        <>
          <AnimatePresence>
            {reviewed && (
              <PresencePanel
                className="flow-reviewed"
                role="status"
                ref={reviewStatus}
                tabIndex={-1}
                initial={{ opacity: 0, y: reduced ? 0 : timing.distance }}
                animate={{ opacity: 1, y: 0 }}
                exit={{
                  opacity: 0,
                  transition: {
                    duration: reduced ? 0 : timing.quick,
                    ease: timing.ease,
                  },
                }}
                transition={surface}
              >
                <span className="flow-check" aria-hidden="true">
                  <svg viewBox="0 0 40 40" fill="none">
                    <circle cx="20" cy="20" r="18" />
                    <path pathLength="1" d="m12 20 5 5 11-11" />
                  </svg>
                </span>
                <div>
                  <strong>Dados revisados</strong>
                  <p>
                    O pagamento ainda não está disponível. Nenhuma cobrança foi
                    feita.
                  </p>
                </div>
              </PresencePanel>
            )}
          </AnimatePresence>
          <div className="flow-availability">
            <span className="flow-status-dot" />
            <p>
              <strong>Pagamento indisponível no momento.</strong> A loja está
              preparando o recebimento por Pix, cartão e boleto.
            </p>
          </div>
        </>
      )}
      <div className="flow-actions">
        {step > 0 && (
          <button className="button" onClick={() => go(step - 1)}>
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
        ) : step === 3 ? (
          <>
            <button className="button" type="submit" form="aquila-payment">
              Revisar dados
            </button>
            <button className="button primary" disabled>
              {payment === "pix"
                ? "Gerar Pix"
                : payment === "boleto"
                  ? "Emitir boleto"
                  : `Pagar ${money(model.price)}`}
            </button>
            {reviewed && (
              <button className="flow-edit" onClick={onClose}>
                Voltar à coleção ↗
              </button>
            )}
          </>
        ) : (
          <button className="button primary" onClick={() => go(step + 1)}>
            {step === 0 ? "Ver caixa e conteúdo" : "Preencher dados"} ↗
          </button>
        )}
      </div>
    </div>
  );
}
