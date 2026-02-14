import { el } from "./dom.js";
import { chats, selectedChatId, persist, getSelectedChat, setSelectedChatId, setChats, createChat, setPreviousResponseId } from "./state.js";
import { escapeHtml, renderMarkdown, showToast } from "./utils.js";
import { assistantBadgeHtml } from "./model-ui.js";

let ctxTargetChatId = null;

function openCtxMenu(chatId, anchorEl) {
  ctxTargetChatId = chatId;
  const rect = anchorEl.getBoundingClientRect();
  el.ctxMenu.classList.remove("hidden");

  const menu = el.ctxMenu.firstElementChild;
  const menuW = 220;
  const x = Math.min(rect.right + 10, window.innerWidth - menuW - 12);
  const y = Math.min(rect.top, window.innerHeight - menu.offsetHeight - 12);

  el.ctxMenu.style.left = x + "px";
  el.ctxMenu.style.top = y + "px";
}

function closeCtxMenu() {
  el.ctxMenu.classList.add("hidden");
  ctxTargetChatId = null;
}

function renameChat(chatId) {
  const c = chats.find(x => x.id === chatId);
  if (!c) return;
  const next = prompt("Rename Chat：", c.title || "");
  if (next === null) return;
  c.title = (next || "").trim() || "Untitled";
  persist();
  renderChatList();
}

function deleteChat(chatId) {
  const c = chats.find(x => x.id === chatId);
  if (!c) return;
  const ok = confirm("Delete this chat? This action can not be reversed.");
  if (!ok) return;

  const nextChats = chats.filter(x => x.id !== chatId);
  setChats(nextChats);

  if (selectedChatId === chatId) {
    setSelectedChatId(nextChats[0]?.id || null);
  }
  if (!selectedChatId) {
    const n = createChat("Unclear Input or Typo");
    setChats([n]);
    setSelectedChatId(n.id);
  }
  persist();
  renderAll();
}

// Share (top right + context menu)
async function shareChat(chatId) {
  const c = chats.find(x => x.id === chatId);
  if (!c) return;

  const url = new URL(window.location.href);
  url.searchParams.set("chat", chatId);
  const link = url.toString();

  if (navigator.share) {
    try {
      await navigator.share({ title: c.title || "Eunoia Chat", url: link });
      showToast("Shared");
      return;
    } catch {}
  }

  try {
    await navigator.clipboard.writeText(link);
    showToast("Link copied");
  } catch {
    prompt("Copying link：", link);
    showToast("Link copied");
  }
}

export function initContextMenu() {
  const ctxShareBtn = el.ctxMenu.querySelector('[data-action="share"]');
  const ctxRenameBtn = el.ctxMenu.querySelector('[data-action="rename"]');
  const ctxDeleteBtn = el.ctxMenu.querySelector('[data-action="delete"]');

  document.addEventListener("click", (e) => {
    if (!el.ctxMenu.classList.contains("hidden")) {
      const inside = el.ctxMenu.contains(e.target);
      const isEllipsis = e.target.closest("[data-ellipsis]");
      if (!inside && !isEllipsis) closeCtxMenu();
    }
  });

  ctxShareBtn?.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!ctxTargetChatId) return;
    const id = ctxTargetChatId;
    closeCtxMenu();
    await shareChat(id);
  });

  ctxRenameBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!ctxTargetChatId) return;
    const id = ctxTargetChatId;
    closeCtxMenu();
    renameChat(id);
  });

  ctxDeleteBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!ctxTargetChatId) return;
    const id = ctxTargetChatId;
    closeCtxMenu();
    deleteChat(id);
  });

  el.topShareBtn?.addEventListener("click", async () => {
    const c = getSelectedChat();
    await shareChat(c.id);
  });
}

// Chat list
export function renderChatList() {
  const q = (el.searchInput?.value || "").trim().toLowerCase();
  const items = chats
    .slice()
    .sort((a,b) => b.createdAt - a.createdAt)
    .filter(c => !q || c.title.toLowerCase().includes(q));

  el.chatCountPill.classList.toggle("hidden", items.length === 0);
  el.chatCountPill.textContent = String(items.length);

  el.chatList.innerHTML = "";
  for (const c of items) {
    const row = document.createElement("div");
    row.className =
      "group relative rounded-xl px-3 py-2.5 mx-1 cursor-pointer " +
      (c.id === selectedChatId ? "bg-black/5" : "hover:bg-black/5");

    const title = document.createElement("div");
    title.className = "text-sm text-black/80 truncate pr-10";
    title.textContent = c.title || "Untitled";

    const ell = document.createElement("button");
    ell.type = "button";
    ell.setAttribute("data-ellipsis", "1");
    ell.className =
      "absolute right-2 top-1/2 -translate-y-1/2 icon-btn !p-1.5 opacity-0 group-hover:opacity-100 transition";
    ell.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm0 5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm0 5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" fill="#111827"/>
      </svg>
    `;

    ell.addEventListener("click", (e) => {
      e.stopPropagation();
      openCtxMenu(c.id, ell);
    });

    row.appendChild(title);
    row.appendChild(ell);

    row.addEventListener("click", () => {
      setSelectedChatId(c.id);
      persist();
      renderAll();
    });

    el.chatList.appendChild(row);
  }
}

// Messages render
export function renderMessages() {
  const chat = getSelectedChat();
  const msgs = chat?.messages || [];

  el.emptyState.classList.toggle("hidden", msgs.length > 0);
  el.chatMessages.innerHTML = "";

  for (const m of msgs) {
    const block = document.createElement("div");

    if (m.role === "user") {
      block.className = "user-row";
      const bubble = document.createElement("div");
      bubble.className = "user-bubble user-msg";
      bubble.textContent = m.text;
      block.appendChild(bubble);
      el.chatMessages.appendChild(block);
      continue;
    }

    block.className = "space-y-2";

    const header = document.createElement("div");
    header.className = "flex items-center gap-2 text-xs text-black/45 font-semibold";
    header.innerHTML = `<span class="inline-flex items-center gap-2">${assistantBadgeHtml()}</span>`;

    const body = document.createElement("div");
    body.className = "assistant-md";
    body.innerHTML = renderMarkdown(m.text);

    const links = Array.from(body.querySelectorAll("a[href]"))
      .map(a => ({ href: a.getAttribute("href"), text: (a.textContent || a.getAttribute("href") || "").trim() }))
      .filter(x => x.href && !x.href.startsWith("#"));
    const uniq = [];
    const seen = new Set();
    for (const l of links) {
      const key = l.href;
      if (seen.has(key)) continue;
      seen.add(key);
      uniq.push(l);
    }
    if (uniq.length) {
      const details = document.createElement("details");
      details.className = "refs";
      const summary = document.createElement("summary");
      summary.textContent = `References / Links (${uniq.length})`;
      details.appendChild(summary);

      const ul = document.createElement("ul");
      ul.className = "mt-2 space-y-1 text-sm";
      for (const l of uniq) {
        const li = document.createElement("li");
        li.innerHTML = `<a class="underline decoration-black/15 hover:decoration-black/35" href="${escapeHtml(l.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(l.text || l.href)}</a>`;
        ul.appendChild(li);
      }
      details.appendChild(ul);
      body.appendChild(details);
    }

    block.appendChild(header);
    block.appendChild(body);
    el.chatMessages.appendChild(block);
  }
}

export function renderAll() {
  renderChatList();
  renderMessages();
  document.dispatchEvent(new Event("eunoia:rendered"));
}

// URL ?chat=...
export function applyChatFromUrl() {
  const url = new URL(window.location.href);
  const chatId = url.searchParams.get("chat");
  if (!chatId) return;
  const exists = chats.some(c => c.id === chatId);
  if (exists) {
    setSelectedChatId(chatId);
    persist();
  }
}

// Search toggle
export function initSearchToggle() {
  let searchOpen = false;
  function toggleSearch(force) {
    searchOpen = typeof force === "boolean" ? force : !searchOpen;
    el.searchRow.classList.toggle("hidden", !searchOpen);
    if (searchOpen) {
      el.searchInput.focus();
      el.searchToggleBtn.classList.add("bg-black/5");
    } else {
      el.searchInput.value = "";
      el.searchToggleBtn.classList.remove("bg-black/5");
    }
    renderChatList();
  }

  el.searchToggleBtn?.addEventListener("click", () => toggleSearch());
  el.searchClearBtn?.addEventListener("click", () => {
    el.searchInput.value = "";
    el.searchInput.focus();
    renderChatList();
  });
  el.searchInput?.addEventListener("input", renderChatList);
}

// New chat / reset hooks
export function initChatActions({ resetChat, createNewChatLikeChatGPT } = {}) {
  el.newTaskBtn?.addEventListener("click", createNewChatLikeChatGPT);
  el.chatReset?.addEventListener("click", resetChat);
}
