import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        // Automotive Dashboard Colors
        neon: {
          blue: "hsl(var(--neon-blue))",
          green: "hsl(var(--neon-green))",
          purple: "hsl(var(--neon-purple))",
        },
        gauge: {
          bg: "hsl(var(--gauge-bg))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'gauge': 'var(--panel-shadow)',
        'gauge-glow': 'var(--panel-glow)',
        'neon': '0 0 20px hsl(var(--neon-blue) / 0.3)',
        'neon-lg': '0 0 30px hsl(var(--neon-blue) / 0.4)',
      },
      animation: {
        'pulse-neon': 'pulse-neon 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        'pulse-neon': {
          '0%, 100%': {
            boxShadow: '0 0 5px hsl(var(--neon-blue) / 0.5)',
          },
          '50%': {
            boxShadow: '0 0 20px hsl(var(--neon-blue) / 0.8)',
          },
        },
        'glow': {
          '0%': {
            boxShadow: '0 0 5px hsl(var(--neon-blue) / 0.3)',
          },
          '100%': {
            boxShadow: '0 0 20px hsl(var(--neon-blue) / 0.6)',
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;