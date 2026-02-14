// Central state (kept very close to the original globals)

export const LS_CHATS = "eunoia_chats_v3";
export const LS_SELECTED = "eunoia_selected_chat_v3";
export const LS_SIDEBAR = "eunoia_sidebar_collapsed_v1";
export const STORAGE_KEY = "eunoia_prev_response_id";

export let chats = [];
export let selectedChatId = null;

export let previousResponseId = localStorage.getItem(STORAGE_KEY) || null;

export function setPreviousResponseId(id) {
  previousResponseId = id;
  if (id) localStorage.setItem(STORAGE_KEY, id);
  else localStorage.removeItem(STORAGE_KEY);
}

export function setChats(next) { chats = next; }
export function setSelectedChatId(id) { selectedChatId = id; }

export function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

export function createChat(title = "Unclear Input or Typo") {
  return { id: uid(), title, createdAt: Date.now(), messages: [] };
}

export function persist() {
  localStorage.setItem(LS_CHATS, JSON.stringify(chats));
  localStorage.setItem(LS_SELECTED, selectedChatId || "");
}

export function loadState() {
  try { chats = JSON.parse(localStorage.getItem(LS_CHATS) || "[]"); } catch { chats = []; }
  selectedChatId = localStorage.getItem(LS_SELECTED);

  if (chats.length === 0) {
    const c = createChat("Unclear Input or Typo");
    chats = [c];
    selectedChatId = c.id;
    persist();
  }
  if (!selectedChatId || !chats.some(c => c.id === selectedChatId)) {
    selectedChatId = chats[0].id;
    persist();
  }
}

export function getSelectedChat() {
  return chats.find(c => c.id === selectedChatId) || chats[0];
}
