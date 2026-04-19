import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Plus Jakarta Sans", "sans-serif"],
      },
      colors: {
        // Primary Color
        primary: {
          50: "#EDF0FF",
          100: "#D9E2FF",
          200: "#B0C6FF",
          300: "#85A9FF",
          400: "#558DFF",
          500: "#2671EE",
          600: "#0058CA",
          700: "#00429B",
          800: "#00429B",
          900: "#001945",
        },

        // Secondary Color
        secondary: {
          50: "#001945",
          100: "#BAC3FF",
          200: "#DEE0FF",
          300: "#96A5FF",
          400: "#7689F1",
          500: "#5C6FD5",
          600: "#4255BB",
          700: "#273CA1",
          800: "#05218B",
          900: "#00105B",
        },

        // Tertiary Color
        tertiary: {
          50: "#FFEBFA",
          100: "#FFD6FA",
          200: "#FFA9FE",
          300: "#E48BE6",
          400: "#C771C9",
          500: "#AA57AD",
          600: "#8E3E92",
          700: "#722479",
          800: "#580460",
          900: "#36003C",
        },

        // Neutral Color
        neutral: {
          50: "#F0F1F2",
          100: "#E1E3E4",
          200: "#C5C7C8",
          300: "#AAABAC",
          400: "#8F9192",
          500: "#757778",
          600: "#5C5F60",
          700: "#454748",
          800: "#2E3132",
          900: "#191C1D",
        },
      },
    },
  },
  plugins: [],
};

export default config;
