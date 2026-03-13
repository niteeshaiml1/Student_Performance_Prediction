/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Syne'", "sans-serif"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        ink: {
          DEFAULT: "#0a0a0f",
          50: "#f5f5fa",
          100: "#e8e8f0",
          200: "#c8c8dc",
          300: "#9898b8",
          400: "#6868a0",
          500: "#4848a0",
          600: "#0a0a0f",
        },
        electric: {
          DEFAULT: "#4fffb0",
          dim: "#1dd68a",
          glow: "rgba(79,255,176,0.15)",
        },
        danger: {
          DEFAULT: "#ff4f6b",
          dim: "#cc2244",
          glow: "rgba(255,79,107,0.15)",
        },
        amber: {
          signal: "#ffcc44",
        },
      },
    },
  },
  plugins: [],
};
