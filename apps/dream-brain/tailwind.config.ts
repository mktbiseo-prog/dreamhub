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
};

export default config;
