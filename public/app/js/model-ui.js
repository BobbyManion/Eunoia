import { el } from "./dom.js";

let currentTier = "Lite"; // "Lite" | "Pro"

function setTier(nextTier) {
  currentTier = nextTier === "Pro" ? "Pro" : "Lite";
  if (el.modelTierPill) el.modelTierPill.textContent = currentTier;
  if (el.heroTierPill) el.heroTierPill.textContent = currentTier;
  // renderMessages will be imported lazily in init to avoid circular deps
  window.__eunoia_currentTier = currentTier;
  document.dispatchEvent(new CustomEvent("eunoia:tierchange", { detail: { tier: currentTier } }));
}

export function assistantBadgeHtml() {
  const tier = window.__eunoia_currentTier || currentTier;
  return `
      <span class="text-sm font-semibold text-black/80">Eunoia</span>
      <span class="text-xs rounded-full px-2 py-0.5 bg-black/5 text-black/35">${tier}</span>
  `;
}

export function initModelMenu({ scrollToTop } = {}) {
  window.__eunoia_currentTier = currentTier;

  el.modelBtn?.addEventListener("click", () => el.modelMenu?.classList.toggle("hidden"));
  el.modelMenu?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-model]");
    if (!btn) return;
    const isPro = String(btn.dataset.model || "").toLowerCase().includes("pro");
    setTier(isPro ? "Pro" : "Lite");
    el.modelMenu.classList.add("hidden");
  });

  document.addEventListener("click", (e) => {
    if (!el.modelBtn?.contains(e.target) && !el.modelMenu?.contains(e.target)) el.modelMenu?.classList.add("hidden");
  });

  el.heroModelPill?.addEventListener("click", () => {
    el.modelMenu?.classList.toggle("hidden");
    scrollToTop?.();
  });
}
