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
        auwn: {
          dark: "#010a09",
          card: "#081712",
          accent: "#1ef6b2",
          accentSoft: "#0f3f34",
          text: "#f3fff7",
          muted: "#8db3a7"
        }
      },
      boxShadow: {
        glow: "0 20px 45px rgba(0,0,0,.45)"
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        merri: ["Merriweather", "serif"]
      }
    }
  },
  plugins: []
};
export default config;
