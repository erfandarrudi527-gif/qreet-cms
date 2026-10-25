import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        admin: {
          bg: "#f8fafc",
          panel: "#ffffff",
          border: "#e2e8f0",
          accent: "#6366f1",
          accentSoft: "#818cf8",
        },
      },
    },
  },
  plugins: [],
};
export default config;
