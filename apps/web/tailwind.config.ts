import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./domain/**/*.{js,ts,jsx,tsx,mdx}",
    "./application/**/*.{js,ts,jsx,tsx,mdx}",
    "./infrastructure/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: { extend: {} },
  plugins: [],
};

export default config;
