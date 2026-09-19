import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "var(--color-paper)",
        cream: "var(--color-cream)",
        ink: "var(--color-ink)",
        muted: "var(--color-muted)",
        rule: "var(--color-rule)",
        rust: "var(--color-rust)",
        "rust-dark": "var(--color-rust-dark)",
        clay: "var(--color-clay)",
        moss: "var(--color-moss)",
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        accent: "var(--color-accent)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
      },
      fontFamily: {
        serif: [
          "Newsreader",
          "Iowan Old Style",
          "Palatino Linotype",
          "Palatino",
          "Georgia",
          "serif",
        ],
        sans: [
          "Source Sans 3",
          "Segoe UI",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
      maxWidth: {
        reading: "42rem",
        page: "72rem",
        "reading-page": "46rem",
      },
      minHeight: {
        11: "2.75rem",
      },
    },
  },
  plugins: [],
};

export default config;
