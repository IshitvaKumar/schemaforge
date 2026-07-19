import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        panel: "0 18px 60px rgba(3, 7, 18, 0.36)",
      },
    },
  },
  plugins: [],
};

export default config;
