/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Deep ink blue — structure, header, nav. Evokes a school exercise-book cover.
        ink: {
          50: "#EEF3F5",
          100: "#D7E2E8",
          300: "#7C9BAA",
          500: "#2E5A6E",
          700: "#1B3A4B",
          800: "#142C39",
          900: "#0E1F28",
        },
        // Warm clay/terracotta — primary accent, like brick and laterite earth.
        clay: {
          50: "#FBF0E8",
          100: "#F5DCC8",
          300: "#E0A579",
          500: "#C96E40",
          600: "#B15A30",
          700: "#8F4625",
        },
        // Paper — warm off-white background, easy on the eyes for long reading.
        paper: {
          DEFAULT: "#FAF6EE",
          dim: "#F1EBDC",
        },
        // Forest green — published / success / completed.
        leaf: {
          50: "#EBF2EA",
          300: "#8FB596",
          500: "#2F5233",
          600: "#264428",
        },
        // Muted gold — pending / in-review / in-progress.
        gold: {
          50: "#FAF1E2",
          300: "#E4BD7D",
          500: "#D4A256",
          600: "#B5832F",
        },
        // Charcoal — primary text, softer than pure black.
        ink_text: "#2A2A28",
      },
      fontFamily: {
        display: ["'Roboto Slab'", "ui-serif", "Georgia", "serif"],
        body: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        shelf: "0 2px 0 rgba(27,58,75,0.08), 0 8px 16px -8px rgba(27,58,75,0.18)",
      },
      borderRadius: {
        card: "10px",
      },
    },
  },
  plugins: [],
};
