// Tailwind CDN config must run before https://cdn.tailwindcss.com
// (No bundler/build step here; keep it lightweight)
tailwind.config = {
  theme: {
    extend: {
      boxShadow: {
        soft: "0 12px 40px rgba(0,0,0,0.08)",
        menu: "0 16px 50px rgba(0,0,0,0.12)"
      },
      colors: {
        paper: "#F6F6F5",
        ink: "#111827",
        muted: "#6B7280"
      }
    },
  },
};
