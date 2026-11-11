import { useEffect, useRef, useState } from "react";
import { money } from "./Widgets.jsx";
const models = {
  essencial: { name: "RAYG Essencial", price: 250 },
  pro: { name: "RAYG Pro", price: 400 },
  ultra: { name: "RAYG Ultra AI", price: 750 },
};
export default function Checkout({ modelKey, onClose }) {
  const ref = useRef(null);
  const timer = useRef();
  const finish = useRef(null);
  const [payment, setPayment] = useState("vista");
  const [busy, setBusy] = useState(false);
  const [complete, setComplete] = useState(false);
  const model = models[modelKey];
  useEffect(() => {
    const el = ref.current;
    if (modelKey) {
      setPayment("vista");
      setBusy(false);
      setComplete(false);
      el.showModal();
    } else if (el.open) el.close();
    return () => clearTimeout(timer.current);
  }, [modelKey]);
  useEffect(() => {
    if (complete) finish.current?.focus();
  }, [complete]);
  function close() {
    clearTimeout(timer.current);
    ref.current.close();
    onClose();
  }
  function submit(e) {
    e.preventDefault();
    setBusy(true);
    timer.current = setTimeout(() => {
      setBusy(false);
      setComplete(true);
    }, 600);
  }
  return (
    <dialog
      id="checkout"
      ref={ref}
      aria-labelledby="checkout-title"
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        const r = ref.current.getBoundingClientRect();
        if (
          e.target === ref.current &&
          (e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom)
        )
          close();
      }}
    >
      <button
        className="dialog-close"
        onClick={close}
        aria-label="Fechar checkout"
      >
        ×
      </button>
      {model &&
        (!complete ? (
          <div>
            <div className="eyebrow">Checkout demonstrativo</div>
            <h2 id="checkout-title">Seu próximo olhar.</h2>
            <p>
              Você escolheu <strong id="selected-model">{model.name}</strong>.
            </p>
            <div className="order-summary">
              <span>Valor proposto</span>
              <strong id="order-total">{money(model.price)}</strong>
            </div>
            <form onSubmit={submit}>
              <fieldset>
                <legend>Como você prefere simular?</legend>
                <label className="payment-option">
                  <input
                    type="radio"
                    name="payment"
                    value="vista"
                    checked={payment === "vista"}
                    onChange={() => setPayment("vista")}
                  />{" "}
                  À vista <span>{money(model.price)}</span>
                </label>
                <label className="payment-option">
                  <input
                    type="radio"
                    name="payment"
                    value="parcelado"
                    checked={payment === "parcelado"}
                    onChange={() => setPayment("parcelado")}
                  />{" "}
                  Em 10x sem juros <span>10x {money(model.price / 10)}</span>
                </label>
              </fieldset>
              {modelKey === "essencial" && (
                <p className="checkout-social">
                  A Tarifa Cidadã tem critérios de elegibilidade ainda a
                  definir. Nenhum documento é solicitado nesta demonstração.
                </p>
              )}
              <p className="fine-print">
                Esta simulação não gera pedido, não cobra valores e não solicita
                dados pessoais.
              </p>
              <button
                className="button full-width"
                type="submit"
                disabled={busy}
                aria-disabled={busy}
              >
                {busy ? "Concluindo simulação…" : "Concluir simulação ↗"}
              </button>
            </form>
          </div>
        ) : (
          <div id="checkout-success" role="status">
            <div className="success-mark" aria-hidden="true">
              ✓
            </div>
            <div className="eyebrow">Experiência concluída</div>
            <h2 id="checkout-title">
              Um novo olhar
              <br />
              em perspectiva.
            </h2>
            <p>
              Simulação de {model.name}{" "}
              {payment === "parcelado"
                ? `em 10x de ${money(model.price / 10)}`
                : `por ${money(model.price)} à vista`}
              .
            </p>
            <p>
              Nenhum pagamento foi realizado. Obrigado por conhecer o RAYG AI.
            </p>
            <button className="button full-width" onClick={close} ref={finish}>
              Voltar à vitrine
            </button>
          </div>
        ))}
    </dialog>
  );
}
