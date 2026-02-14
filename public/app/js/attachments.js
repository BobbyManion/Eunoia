import { el } from "./dom.js";
import { autoGrowTextarea } from "./utils.js";

let pendingAttachments = [];

function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return "";
  const units = ["B","KB","MB","GB"];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
  return (i === 0 ? String(n) : n.toFixed(1)) + units[i];
}

function isProbablyText(type, name) {
  if (type && type.startsWith("text/")) return true;
  const ext = (name.split(".").pop() || "").toLowerCase();
  return ["txt","md","json","csv","tsv","js","ts","py","java","cpp","c","h","hpp","html","css","xml","yml","yaml","toml","ini","log"].includes(ext);
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result || ""));
    r.onerror = reject;
    r.readAsText(file);
  });
}

export function renderAttachmentRow() {
  el.attachmentRow.innerHTML = "";
  if (!pendingAttachments.length) return;

  for (const a of pendingAttachments) {
    const chip = document.createElement("div");
    chip.className = "flex items-center gap-2 rounded-full bg-white/70 border border-black/10 px-3 py-1.5 text-xs text-black/70";
    chip.innerHTML = `
      <span class="truncate max-w-[240px]">${a.name}</span>
      <span class="text-black/40">${a.sizeLabel || ""}</span>
      <button type="button" class="ml-1 text-black/40 hover:text-black/70" aria-label="Remove">✕</button>
    `;
    chip.querySelector("button").addEventListener("click", () => {
      pendingAttachments = pendingAttachments.filter(x => x.id !== a.id);
      renderAttachmentRow();
    });
    el.attachmentRow.appendChild(chip);
  }
}

export function buildAttachmentAppendix() {
  if (!pendingAttachments.length) return "";
  const lines = [];
  lines.push("");
  lines.push("[Attachments]");
  for (const a of pendingAttachments) {
    lines.push(`- ${a.name} (${a.type || "unknown"}, ${a.sizeLabel || ""})`);
    if (a.textContent) {
      const clipped = a.textContent.length > 8000 ? a.textContent.slice(0, 8000) + "\n…(truncated)" : a.textContent;
      lines.push("```");
      lines.push(clipped);
      lines.push("```");
    }
  }
  return lines.join("\n");
}

export function clearPendingAttachments() {
  pendingAttachments = [];
  renderAttachmentRow();
}

export function getPendingAttachmentNames() {
  return pendingAttachments.map(a => a.name);
}

export function initAttachments() {
  el.attachBtn?.addEventListener("click", () => el.fileInput?.click());

  el.fileInput?.addEventListener("change", async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    for (const file of files) {
      const id = crypto?.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());
      const att = {
        id,
        name: file.name,
        type: file.type,
        size: file.size,
        sizeLabel: formatBytes(file.size),
        textContent: null,
      };

      try {
        if (isProbablyText(file.type, file.name) && file.size <= 200_000) {
          att.textContent = await readFileAsText(file);
        }
      } catch {}

      pendingAttachments.push(att);
    }

    el.fileInput.value = "";
    renderAttachmentRow();
  });

  el.chatInput?.addEventListener("input", () => autoGrowTextarea(el.chatInput));
}
