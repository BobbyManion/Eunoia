import { el } from "./dom.js";
import { getSelectedChat } from "./state.js";
import { showToast } from "./utils.js";

function chatToMarkdown(chat){
  const lines = [];
  const title = (chat?.title || "Eunoia Chat").trim();
  lines.push(`# ${title}`);
  lines.push("");
  for (const m of (chat?.messages || [])) {
    if (m.role === "user") {
      lines.push(`**You:** ${m.text}`);
    } else {
      lines.push(`**Eunoia:**`);
      lines.push("");
      lines.push(m.text);
    }
    lines.push("\n---\n");
  }
  return lines.join("\n").replace(/\n{3,}/g, "\n\n");
}

function downloadText(filename, content){
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function initExport() {
  el.exportBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    el.exportMenu?.classList.toggle("hidden");
  });

  document.addEventListener("click", () => el.exportMenu?.classList.add("hidden"));

  el.exportCopyMd?.addEventListener("click", async () => {
    const md = chatToMarkdown(getSelectedChat());
    try {
      await navigator.clipboard.writeText(md);
      showToast("Markdown copied");
    } catch {
      prompt("Copy markdown:", md);
    }
    el.exportMenu?.classList.add("hidden");
  });

  el.exportDownloadMd?.addEventListener("click", () => {
    const chat = getSelectedChat();
    const safe = (chat.title || "eunoia_chat").replace(/[^\w\-]+/g, "_").slice(0,50);
    const md = chatToMarkdown(chat);
    downloadText(`${safe}.md`, md);
    showToast("Downloaded");
    el.exportMenu?.classList.add("hidden");
  });

  el.exportPrint?.addEventListener("click", () => {
    el.exportMenu?.classList.add("hidden");
    window.print();
  });
}
