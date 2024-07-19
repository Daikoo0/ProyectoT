/** @type {import('tailwindcss').Config} */


export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./public/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      width: {
        '7/10': '70%',
        '3/10': '30%',
      }
    }
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
  daisyui: {
    themes: [
      "lofi","light", "dark", "cupcake", "bumblebee", "emerald", "corporate", "synthwave",
      "retro", "cyberpunk", "valentine", "halloween", "garden", "forest", "aqua", "pastel", "wireframe", "black", "dracula",
      "cmyk", "autumn", "business", "acid", "lemonade", "night", "coffee", "winter",
      "dim", "nord", "sunset",
      {
        tamara: {

          "primary": "#1e40af",
          "secondary": "#fde68a",
          "accent": "#FF00F3",
          "neutral": "#ffffff",
          "base-100": "#000000",
          "info": "#00ffee",
          "success": "#1BFF00",
          "warning": "#fce803",
          "error": "#FF0000",
        },
      }
    ],
  },
}

