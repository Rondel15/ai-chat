export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#0d1117",
        panel:   "#161b22",
        card:    "#21262d",
        border:  "#30363d",
        accent:  "#58a6ff",
        "accent-dim": "#388bfd",
        green:   "#3fb950",
        muted:   "#8b949e",
        soft:    "#e6edf3",
      },
      fontFamily: { sans: ["'DM Sans'", "sans-serif"], mono: ["'JetBrains Mono'", "monospace"] },
    },
  },
  plugins: [],
};
