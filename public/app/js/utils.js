import { el } from "./dom.js";

export function showToast(text) {
  const toast = document.getElementById("toast");
  toast.querySelector("div").textContent = text;
  toast.classList.remove("hidden");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.add("hidden"), 1300);
}

export function autoGrowTextarea(textarea) {
  textarea.style.height = "auto";
  textarea.style.height = Math.min(textarea.scrollHeight, 160) + "px";
}

export function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m]));
}

// Markdown -> safe HTML (for assistant output)
export function renderMarkdown(md) {
  if (window.marked && window.DOMPurify) {
    marked.setOptions({ gfm: true, breaks: true });
    const raw = marked.parse(md || "");
    return DOMPurify.sanitize(raw, { USE_PROFILES: { html: true } });
  }
  return escapeHtml(md || "").replace(/\n/g, "<br/>");
}

// Busy state controls (send/stop)
export function setBusy(isBusy, { onStop } = {}) {
  el.chatSend.disabled = isBusy;
  el.chatInput.disabled = isBusy;
  el.chatSend.style.opacity = isBusy ? "0.5" : "1";

  if (el.stopBtn) {
    el.stopBtn.classList.toggle("hidden", !isBusy);
    el.chatSend.classList.toggle("hidden", isBusy);
  }

  if (el.stopBtn && onStop) {
    // Ensure we don't stack listeners:
    el.stopBtn.onclick = onStop;
  }
}
