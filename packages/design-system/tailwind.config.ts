import type { Config } from "tailwindcss";

const config: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        dream: {
          primary: "var(--dream-color-primary)",
          "primary-light": "var(--dream-color-primary-light)",
          "primary-lighter": "var(--dream-color-primary-lighter)",
          "primary-dark": "var(--dream-color-primary-dark)",
          "primary-darker": "var(--dream-color-primary-darker)",
          "on-primary": "var(--dream-color-on-primary)",
          secondary: "var(--dream-color-secondary)",
          "secondary-light": "var(--dream-color-secondary-light)",
          accent: "var(--dream-color-accent)",
          "accent-light": "var(--dream-color-accent-light)",
          surface: "var(--dream-color-surface)",
          "surface-alt": "var(--dream-color-surface-alt)",
          background: "var(--dream-color-background)",
          "text-primary": "var(--dream-color-text-primary)",
          "text-secondary": "var(--dream-color-text-secondary)",
          "text-tertiary": "var(--dream-color-text-tertiary)",
        },
        "dream-neutral": {
          50: "var(--dream-neutral-50)",
          100: "var(--dream-neutral-100)",
          200: "var(--dream-neutral-200)",
          300: "var(--dream-neutral-300)",
          400: "var(--dream-neutral-400)",
          500: "var(--dream-neutral-500)",
          600: "var(--dream-neutral-600)",
          700: "var(--dream-neutral-700)",
          800: "var(--dream-neutral-800)",
          900: "var(--dream-neutral-900)",
        },
        "dream-semantic": {
          success: "var(--dream-success)",
          "success-light": "var(--dream-success-light)",
          warning: "var(--dream-warning)",
          "warning-light": "var(--dream-warning-light)",
          error: "var(--dream-error)",
          "error-light": "var(--dream-error-light)",
          info: "var(--dream-info)",
          "info-light": "var(--dream-info-light)",
        },
      },
      borderRadius: {
        "dream-sm": "var(--dream-radius-sm)",
        "dream-md": "var(--dream-radius-md)",
        "dream-lg": "var(--dream-radius-lg)",
        "dream-xl": "var(--dream-radius-xl)",
        "dream-full": "var(--dream-radius-full)",
      },
      boxShadow: {
        "dream-sm": "var(--dream-shadow-sm)",
        "dream-md": "var(--dream-shadow-md)",
        "dream-lg": "var(--dream-shadow-lg)",
        "dream-xl": "var(--dream-shadow-xl)",
      },
      fontFamily: {
        "dream-primary": ["var(--dream-font-primary)"],
        "dream-display": ["var(--dream-font-display)"],
      },
      spacing: {
        "dream-xxs": "var(--dream-spacing-xxs)",
        "dream-xs": "var(--dream-spacing-xs)",
        "dream-sm": "var(--dream-spacing-sm)",
        "dream-md": "var(--dream-spacing-md)",
        "dream-lg": "var(--dream-spacing-lg)",
        "dream-xl": "var(--dream-spacing-xl)",
        "dream-2xl": "var(--dream-spacing-2xl)",
        "dream-3xl": "var(--dream-spacing-3xl)",
      },
      transitionDuration: {
        "dream-fast": "150ms",
        "dream-normal": "250ms",
        "dream-slow": "400ms",
      },
    },
  },
};

export default config;
