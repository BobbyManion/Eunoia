import { el } from "./dom.js";
import { LS_SIDEBAR } from "./state.js";

const mqMobile = window.matchMedia("(max-width: 1023px)");

function isMobile() {
  return mqMobile.matches;
}

// Desktop collapsed state
export function applySidebarCollapsed(collapsed) {
  if (isMobile()) return;
  document.body.classList.toggle("sidebar-collapsed", !!collapsed);
  try { localStorage.setItem(LS_SIDEBAR, collapsed ? "1" : "0"); } catch {}
}

function loadSidebarCollapsed() {
  let collapsed = false;
  try { collapsed = (localStorage.getItem(LS_SIDEBAR) === "1"); } catch {}
  applySidebarCollapsed(collapsed);
}

// Mobile drawer state
export function setSidebarOpen(open) {
  if (!isMobile()) return;
  document.body.classList.toggle("sidebar-open", !!open);
  if (el.sidebarBackdrop) el.sidebarBackdrop.classList.toggle("hidden", !open);
}

function toggleSidebar() {
  if (isMobile()) {
    const open = document.body.classList.contains("sidebar-open");
    setSidebarOpen(!open);
  } else {
    const collapsed = document.body.classList.contains("sidebar-collapsed");
    applySidebarCollapsed(!collapsed);
  }
}

export function initSidebar() {
  // Collapsed-mode "Chats" icon: expand on desktop
  el.collapsedChatsBtn?.addEventListener("click", () => {
    if (isMobile()) return;
    if (document.body.classList.contains("sidebar-collapsed")) applySidebarCollapsed(false);
  });

  el.sidebarToggleBtns.forEach(btn => btn?.addEventListener("click", toggleSidebar));
  el.sidebarBackdrop?.addEventListener("click", () => setSidebarOpen(false));

  // Close drawer when selecting a chat on mobile
  el.sidebar?.addEventListener("click", (e) => {
    if (!isMobile()) return;
    const t = e.target;
    if (t && (t.closest?.("[data-chat-id]") || t.closest?.("#newTaskBtn"))) setSidebarOpen(false);
  });

  mqMobile.addEventListener?.("change", () => {
    document.body.classList.remove("sidebar-collapsed");
    setSidebarOpen(false);
    if (!isMobile()) loadSidebarCollapsed();
  });

  if (isMobile()) setSidebarOpen(false);
  else loadSidebarCollapsed();
}
