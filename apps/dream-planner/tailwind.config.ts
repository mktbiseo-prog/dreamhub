import type { Config } from "tailwindcss";
import sharedConfig from "@dreamhub/config/tailwind";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
    "../../packages/design-system/src/**/*.{ts,tsx}",
  ],
  darkMode: "class",
  presets: [sharedConfig as Config],
  theme: {
    extend: {
      colors: {
        // Override shared "brand" purple → Dream Planner orange per design guidelines
        brand: {
          50: "#FFF8F5",
          100: "#FFF3ED",
          200: "#FFE0CC",
          300: "#FFC4A3",
          400: "#FF9766",
          500: "#FF6B35",
          600: "#E85A24",
          700: "#C44A1A",
          800: "#A03A15",
          900: "#7C2D10",
          950: "#431407",
        },
      },
    },
  },
};

export default config;
