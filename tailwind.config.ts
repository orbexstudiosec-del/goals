import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,js,jsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
      },
      colors: {
        // Marca: negro (color primario) + amarillo (accent). Esquema amarillo/negro.
        brand: {
          50: "#f6f6f6",
          100: "#ededed",
          200: "#d6d6d6",
          300: "#b4b4b4",
          400: "#8a8a8a",
          500: "#404040",
          600: "#171717",
          700: "#0a0a0a",
          800: "#000000",
          900: "#000000",
        },
        // Color secundario de la marca (amarillo) + negro/blanco
        accent: {
          50: "#fffbe6",
          100: "#fff4bf",
          200: "#ffe885",
          300: "#ffdd4d",
          400: "#ffd31a",
          500: "#ffd31a",
          600: "#e6b800",
          700: "#b38f00",
          DEFAULT: "#ffd31a",
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none",
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
