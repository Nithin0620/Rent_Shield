import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        midnight: {
          900: "#050814",
          800: "#0b1022",
          700: "#111a33"
        },
        neon: {
          500: "#7CFF6B",
          600: "#5BEA4E"
        }
      },
      fontFamily: {
        display: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        glow: "0 0 40px rgba(124, 255, 107, 0.35)",
        soft: "0 20px 60px rgba(5, 8, 20, 0.35)"
      }
    }
  },
  plugins: []
};

export default config;
