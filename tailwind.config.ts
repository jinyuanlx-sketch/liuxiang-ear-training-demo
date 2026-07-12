import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#07080b",
          900: "#0d1016",
          850: "#121722",
          800: "#171d2a",
          700: "#242b3a"
        },
        ivory: "#f4efe6",
        muted: "#9aa4b2",
        brass: "#c8a15a",
        jade: "#7cb7a2",
        aubergine: "#5d526f"
      },
      boxShadow: {
        panel: "0 18px 60px rgba(0, 0, 0, 0.28)"
      },
      fontFamily: {
        sans: [
          "Inter",
          "PingFang SC",
          "Microsoft YaHei",
          "Noto Sans SC",
          "system-ui",
          "sans-serif"
        ],
        serif: ["Noto Serif SC", "Songti SC", "serif"]
      }
    }
  },
  plugins: []
};

export default config;
