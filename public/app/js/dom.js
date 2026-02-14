// DOM element references (single place so other modules can import reliably)

export const el = {
  // chat + layout
  chatList: document.getElementById("chatList"),
  chatMessages: document.getElementById("chatMessages"),
  chatScroll: document.getElementById("chatScroll"),
  chatForm: document.getElementById("chatForm"),
  chatInput: document.getElementById("chatInput"),
  chatSend: document.getElementById("chatSend"),
  stopBtn: document.getElementById("stopBtn"),
  chatReset: document.getElementById("chatReset"),
  attachBtn: document.getElementById("attachBtn"),
  fileInput: document.getElementById("fileInput"),
  attachmentRow: document.getElementById("attachmentRow"),
  voiceBtn: document.getElementById("voiceBtn"),
  emptyState: document.getElementById("emptyState"),

  // sidebar/search
  sidebar: document.getElementById("sidebar"),
  sidebarBackdrop: document.getElementById("sidebarBackdrop"),
  sidebarToggleBtns: Array.from(document.querySelectorAll("[data-sidebar-toggle]")),
  collapsedChatsBtn: document.getElementById("collapsedChatsBtn"),
  newTaskBtn: document.getElementById("newTaskBtn"),
  searchToggleBtn: document.getElementById("searchToggleBtn"),
  searchRow: document.getElementById("searchRow"),
  searchInput: document.getElementById("searchInput"),
  searchClearBtn: document.getElementById("searchClearBtn"),
  chatCountPill: document.getElementById("chatCountPill"),

  // top actions
  topShareBtn: document.getElementById("topShareBtn"),
  exportBtn: document.getElementById("exportBtn"),
  exportMenu: document.getElementById("exportMenu"),
  exportCopyMd: document.getElementById("exportCopyMd"),
  exportDownloadMd: document.getElementById("exportDownloadMd"),
  exportPrint: document.getElementById("exportPrint"),

  // context menu
  ctxMenu: document.getElementById("ctxMenu"),

  // model menu
  modelBtn: document.getElementById("modelBtn"),
  modelMenu: document.getElementById("modelMenu"),
  modelTierPill: document.getElementById("modelTierPill"),
  heroTierPill: document.getElementById("heroTierPill"),
  heroModelPill: document.getElementById("heroModelPill"),
};
