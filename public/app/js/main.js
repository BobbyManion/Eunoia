import { el } from "./dom.js";
import { loadState, persist, getSelectedChat, chats, createChat, setSelectedChatId, setPreviousResponseId } from "./state.js";
import { initSidebar } from "./sidebar.js";
import { initModelMenu } from "./model-ui.js";
import { initAttachments, buildAttachmentAppendix, clearPendingAttachments, getPendingAttachmentNames, renderAttachmentRow } from "./attachments.js";
import { initVoice } from "./voice.js";
import { initExport } from "./export.js";
import { setBusy, autoGrowTextarea } from "./utils.js";
import { sendToBackendStream } from "./stream.js";
import { renderAll, renderMessages, renderChatList, applyChatFromUrl, initContextMenu, initSearchToggle, initChatActions } from "./chat-ui.js";
import { renderExamplePrompts } from "./prompts.js";

// Streaming controls
let activeStreamAbort = null;
let isStreaming = false;

// Reset chat
function resetChat() {
  const chat = getSelectedChat();
  chat.messages = [];
  setPreviousResponseId(null);
  persist();
  renderMessages();
  renderExamplePrompts();
  el.emptyState.classList.remove("hidden");
}

// New chat
function createNewChatLikeChatGPT() {
  const c = createChat("Unclear Input or Typo");
  chats.push(c);
  setSelectedChatId(c.id);
  setPreviousResponseId(null);
  persist();
  renderAll();
  el.chatInput.focus();
}

// Bind model menu (needs chatScroll)
initModelMenu({
  scrollToTop: () => el.chatScroll?.scrollTo({ top: 0, behavior: "smooth" }),
});

// Re-render on tier change (updates assistant pill)
document.addEventListener("eunoia:tierchange", () => renderMessages());

// init sidebar
initSidebar();

// init context menu + export + search
initContextMenu();
initExport();
initSearchToggle();
initChatActions({ resetChat, createNewChatLikeChatGPT });

// Attachments + voice
initAttachments();
initVoice();

// Form submit
el.chatForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = (el.chatInput.value || "").trim();
  const attachmentAppendix = buildAttachmentAppendix();
  const composedMessage = message + attachmentAppendix;
  if (!message) return;

  const chat = getSelectedChat();

  // Auto-title on first message
  if ((chat.title === "Unclear Input or Typo" || !chat.title) && chat.messages.length === 0) {
    chat.title = message.slice(0, 28) + (message.length > 28 ? "…" : "");
  }

  // Add user message
  chat.messages.push({
    role: "user",
    text: message + (getPendingAttachmentNames().length ? "\n\n[Attachments: " + getPendingAttachmentNames().join(", ") + "]" : ""),
    ts: Date.now()
  });

  el.chatInput.value = "";
  clearPendingAttachments();
  renderAttachmentRow();
  autoGrowTextarea(el.chatInput);

  // Add assistant placeholder
  const assistantMsg = { role: "assistant", text: "", ts: Date.now() };
  chat.messages.push(assistantMsg);

  persist();
  renderChatList();
  renderMessages();

  setBusy(true, {
    onStop: () => {
      if (activeStreamAbort && isStreaming) {
        try { activeStreamAbort.abort(); } catch {}
      }
    }
  });

  try {
    activeStreamAbort = new AbortController();
    isStreaming = true;

    await sendToBackendStream(composedMessage, (fullText) => {
      assistantMsg.text = fullText;
      renderMessages();
      window.requestAnimationFrame(() => {
        el.chatScroll.scrollTop = el.chatScroll.scrollHeight;
      });
    }, activeStreamAbort.signal);

  } catch (err) {
    if (err && (err.name === "AbortError" || String(err.message || "").toLowerCase().includes("aborted"))) {
      persist();
      renderMessages();
    } else {
      assistantMsg.text = "抱歉，流式请求失败。请检查服务器日志。";
      console.error(err);
      persist();
      renderMessages();
    }
  } finally {
    isStreaming = false;
    activeStreamAbort = null;
    setBusy(false);
    el.chatInput.focus();
  }
});

// init
loadState();
applyChatFromUrl();
renderAll();
renderExamplePrompts();
autoGrowTextarea(el.chatInput);
