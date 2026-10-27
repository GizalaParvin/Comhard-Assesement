/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        sla: {
          healthy: '#10b981', // green (<50%)
          warning: '#eab308', // yellow (50-80%)
          risk: '#f97316',    // orange (80-100%)
          breached: '#ef4444' // red (>100%)
        }
      }
    },
  },
  plugins: [],
}
