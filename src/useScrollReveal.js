import { useEffect } from "react";
import "./scroll-reveal.css";

const targets = [
  ".section-head > *",
  ".focus-controls",
  ".focus-scene",
  ".collection-art",
  ".model-row",
  ".models-note",
  ".story-grid > *",
  ".faq-layout > h2",
  ".t-acc",
  ".closing-top > *",
  ".footer-row",
].join(",");

export default function useScrollReveal() {
  useEffect(() => {
    const nodes = [...document.querySelectorAll(targets)];
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    if (!nodes.length || !window.IntersectionObserver) return;
    const show = (node) => {
      node.classList.add("is-shown");
      observer.unobserve(node);
    };
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) show(entry.target);
        });
      },
      { rootMargin: "0px 0px -32px 0px", threshold: 0 },
    );
    const update = () => {
      nodes.forEach((node) => {
        if (preference.matches) {
          show(node);
          return;
        }
        if (node.classList.contains("is-shown")) return;
        // A restored scroll position or anchor must never hide content already seen.
        if (node.getBoundingClientRect().top < window.innerHeight - 32) {
          show(node);
          return;
        }
        const index = [...node.parentElement.children].indexOf(node);
        node.style.setProperty("--reveal-index", Math.min(index, 5));
        node.classList.add("t-stagger-line");
        observer.observe(node);
      });
    };
    const focus = (event) => {
      const node = event.target.closest(".t-stagger-line");
      if (node) show(node);
    };
    const settled = (event) => {
      if (
        event.propertyName === "opacity" &&
        event.target.matches(".t-stagger-line.is-shown")
      )
        event.target.classList.add("is-settled");
    };
    update();
    preference.addEventListener("change", update);
    document.addEventListener("focusin", focus);
    document.addEventListener("transitionend", settled);
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", update);
      document.removeEventListener("focusin", focus);
      document.removeEventListener("transitionend", settled);
      nodes.forEach((node) => {
        node.classList.remove("t-stagger-line", "is-shown", "is-settled");
        node.style.removeProperty("--reveal-index");
      });
    };
  }, []);
}
