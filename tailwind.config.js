import { fontFamily } from "tailwindcss/defaultTheme"

module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lovePink: "#ff6f91",
        postcardBg: "#fdf6e3",
        postcardAccent: "#d4a373",
      },
      fontFamily: {
        script: ["'Great Vibes'", ...fontFamily.sans],
      },
      backgroundImage: {
        postcard: "url('/postcard-texture.jpg')",
      },
    },
  },
  plugins: [],
}
