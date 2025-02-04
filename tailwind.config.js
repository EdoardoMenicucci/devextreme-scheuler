/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        "bg-primary": "#111827", // gray-900
        "bg-secondary": "#1F2937", // gray-800

        // Accent
        accent: "#4F46E5", // indigo-600
        "accent-hover": "#4338CA", // indigo-700
        "accent-light": "#818CF8", // indigo-400

        // Typography
        "text-primary": "#FFFFFF",
        "text-secondary": "#D1D5DB", // gray-300

        // Borders / Separators
        border: "#374151", // gray-700

        // States
        success: "#059669", // green-600
        danger: "#DC2626", // red-600
      },
    },
  },
  plugins: [],
};

