const { hairlineWidth } = require("nativewind/theme");
const { colors } = require("./src/themes/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        sans: ["TitilliumRegular"],
        // Titillium no pacote @expo-google-fonts não traz peso 500; 600 é o mais próximo de "medium"
        "sans-medium": ["TitilliumSemiBold"],
        "sans-semibold": ["TitilliumSemiBold"],
        "sans-regular": ["TitilliumRegular"],
        "sans-bold": ["TitilliumBold"],
      },
      colors: {
        background: colors.background,
        foreground: colors.foreground,

        primary: {
          DEFAULT: colors.primary,
          foreground: "#000000",
        },

        secondary: {
          DEFAULT: colors.secondary,
          foreground: "#000000",
        },

        border: "#262626",
        input: "#262626",
        ring: colors.primary,
      },
      borderWidth: {
        hairline: hairlineWidth(),
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
