/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./contexts/**/*.{js,jsx,ts,tsx}",
    "./services/**/*.{js,jsx,ts,tsx}",
    "./utils/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        rubik: ["Rubik-Regular", "sans-serif"],
        "rubik-bold": ["Rubik-Bold", "sans-serif"],
        "rubik-extraBold": ["Rubik-ExtraBold", "sans-serif"],
        "rubik-medium": ["Rubik-Medium", "sans-serif"],
        "rubik-light": ["Rubik-Light", "sans-serif"],
        "rubik-semiBold": ["Rubik-SemiBold", "sans-serif"],
      },
      colors: {
        // Primary color scheme (Cyan-based from Figma)
        primary: {
          50: "#ecfeff",    // cyan-50
          100: "#cffafe",   // cyan-100
          200: "#a5f3fc",   // cyan-200
          300: "#67e8f9",   // cyan-300
          400: "#22d3ee",   // cyan-400
          500: "#06b6d4",   // cyan-500
          600: "#0891b2",   // cyan-600 - Main primary
          700: "#0e7490",   // cyan-700
          800: "#155e75",   // cyan-800
          900: "#164e63",   // cyan-900
        },
        // Secondary colors (Slate-based)
        secondary: {
          50: "#f8fafc",    // slate-50
          100: "#f1f5f9",   // slate-100
          200: "#e2e8f0",   // slate-200
          300: "#cbd5e1",   // slate-300
          400: "#94a3b8",   // slate-400
          500: "#64748b",   // slate-500 - Main secondary
          600: "#475569",   // slate-600
          700: "#334155",   // slate-700
          800: "#1e293b",   // slate-800
          900: "#0f172a",   // slate-900
        },
        // Background colors
        background: {
          DEFAULT: "#ffffff",
          secondary: "#f8fafc", // slate-50
          muted: "#f1f5f9",     // slate-100
        },
        // Text colors
        text: {
          primary: "#0f172a",   // slate-900
          secondary: "#64748b", // slate-500
          muted: "#94a3b8",     // slate-400
          inverse: "#ffffff",
        },
        // Status colors
        success: {
          50: "#f0fdf4",
          500: "#10b981",      // emerald-500
          600: "#059669",      // emerald-600
        },
        warning: {
          50: "#fffbeb",
          500: "#f59e0b",      // amber-500
          600: "#d97706",      // amber-600
        },
        error: {
          50: "#fef2f2",
          500: "#ef4444",      // red-500
          600: "#dc2626",      // red-600
        },
        // Keep existing for compatibility
        accent: {
          100: "#f8fafc",      // Updated to slate-50
        },
        black: {
          DEFAULT: "#000000",
          100: "#94a3b8",      // Updated to slate-400
          200: "#64748b",      // Updated to slate-500
          300: "#1e293b",      // Updated to slate-800
        },
        danger: "#ef4444",     // Updated to red-500
      },
      // Add spacing scale
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      // Add border radius
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      // Add shadows
      boxShadow: {
        'soft': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'medium': '0 8px 24px rgba(0, 0, 0, 0.12)',
        'strong': '0 16px 40px rgba(0, 0, 0, 0.16)',
        'button': '0 4px 8px rgba(8, 145, 178, 0.2)', // Primary button shadow
      },
      // Add component sizes for consistency
      height: {
        'input': '52px',
        'button': '48px',
        'banner': '320px',
      },
      width: {
        'input': '100%',
        'button': '100%',
      },
      // Add animation timings
      transitionDuration: {
        '250': '250ms',
        '400': '400ms',
      },
    },
  },
  plugins: [],
};