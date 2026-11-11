import { useEffect, useState } from "react";
import { MotionConfig } from "motion/react";
import {
  Hero,
  Principles,
  Technology,
  Models,
  Project,
  FAQ,
  FinalCTA,
  Footer,
} from "./Sections.jsx";
import Simulator from "./Simulator.jsx";
import Checkout from "./Checkout.jsx";
import { BrandFilm } from "./Brand.jsx";
import NavbarBrand from "./NavbarBrand.jsx";
import PackagingShowcase from "./Packaging.jsx";

const readSetting = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};
export default function App() {
  const [fontStep, setFontStep] = useState(() =>
    Math.min(2, Math.max(0, Number(readSetting("rayg-font", 0)) || 0)),
  );
  const [contrast, setContrast] = useState(
    () => readSetting("rayg-contrast", false) === true,
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [model, setModel] = useState(null);
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--font-scale",
      1 + fontStep * 0.125,
    );
    document.documentElement.classList.toggle("high-contrast", contrast);
    try {
      localStorage.setItem("rayg-font", JSON.stringify(fontStep));
      localStorage.setItem("rayg-contrast", JSON.stringify(contrast));
    } catch {
      /* Private browsing storage is optional. */
    }
  }, [fontStep, contrast]);
  useEffect(() => {
    const escape = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, []);
  return (
    <MotionConfig reducedMotion="user">
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <div className="access-bar">
        <div className="container access-inner">
          <span>Acessibilidade</span>
          <div className="access-actions">
            <button
              id="font-size"
              onClick={() => setFontStep((fontStep + 1) % 3)}
              aria-label={
                fontStep === 2
                  ? "A↺ Restaurar tamanho da fonte"
                  : "A+ Aumentar tamanho da fonte"
              }
            >
              {fontStep === 2 ? "A↺" : "A+"}
            </button>
            <button
              id="contrast"
              onClick={() => setContrast(!contrast)}
              aria-pressed={contrast}
            >
              <span aria-hidden="true">◐</span> Alto contraste
            </button>
          </div>
        </div>
      </div>
      <header className="header">
        <div className="container nav-inner">
          <NavbarBrand />
          <button
            className="menu-toggle"
            id="menu-toggle"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
            aria-controls="navigation"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>
          <nav
            id="navigation"
            className={menuOpen ? "open" : ""}
            aria-label="Navegação principal"
            onClick={(e) => {
              if (e.target.closest("a")) setMenuOpen(false);
            }}
          >
            <a href="#tecnologia">Como funciona</a>
            <a href="#simulador">Simulador AI</a>
            <a href="#modelos">Modelos & preços</a>
            <a href="#projeto">O projeto</a>
          </nav>
          <a className="button button-small header-cta" href="#modelos">
            Ver modelos <span aria-hidden="true">↗</span>
          </a>
        </div>
      </header>
      <main id="conteudo">
        <Hero />
        <Principles />
        <Simulator />
        <Technology />
        <BrandFilm />
        <Models onSelect={(e) => setModel(e.currentTarget.dataset.model)} />
        <PackagingShowcase />
        <Project />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
      <Checkout modelKey={model} onClose={() => setModel(null)} />
    </MotionConfig>
  );
}
