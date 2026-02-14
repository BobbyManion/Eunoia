// Tailwind CDN config must run before https://cdn.tailwindcss.com
// Keep it lightweight (no build step)
window.tailwind = window.tailwind || {};
window.tailwind.config = {
  theme: {
    extend: {
      boxShadow: {
        soft: "0 12px 40px rgba(0,0,0,0.08)",
        menu: "0 16px 50px rgba(0,0,0,0.12)",
        paper: "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)",
      },
      colors: {
        // from code.html
        primary: "#1a365d",          // Deep Academic Blue
        accent: "#C5A065",           // Gold/Bronze accent
        paper: "#FDFBF7",            // Ivory / Paper
        paperSoft: "#F4F1EA",
        ink: "#2D2D2D",              // Charcoal
        muted: "#5D5D5D",
        borderSoft: "rgba(0,0,0,0.08)",
      },
      fontFamily: {
        sans: ["Playfair Display", "ui-serif", "Georgia", "Times New Roman", "Times", "serif"],
        serif: ["Playfair Display", "ui-serif", "Georgia", "Times New Roman", "Times", "serif"],
        display: ["Playfair Display", "ui-serif", "Georgia", "Times New Roman", "Times", "serif"],
      },
    },
  },
};
