export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: "var(--color-paper)",
          elevated: "var(--color-paper-2)",
          deep: "var(--color-paper-3)",
        },
        ink: {
          DEFAULT: "var(--color-ink)",
          muted: "var(--color-ink-muted)",
          soft: "var(--color-ink-soft)",
        },
        rule: {
          DEFAULT: "var(--color-rule)",
          dashed: "var(--color-rule-dashed)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          hover: "var(--color-accent-hover)",
          ink: "var(--color-accent-ink)",
        },
        focus: "var(--color-focus)",
      },
      fontFamily: {
        sans: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      fontSize: {
        display: ["var(--text-display)", { lineHeight: "1.05", letterSpacing: "-0.03em" }],
      },
      maxWidth: {
        content: "1320px",
        prose: "42rem",
      },
      spacing: {
        section: "var(--space-section-y)",
      },
    },
  },
  plugins: [],
};
