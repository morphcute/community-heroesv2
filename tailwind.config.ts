import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
        popover: "var(--popover)",
        "popover-foreground": "var(--popover-foreground)",
        primary: "var(--primary)",
        "primary-foreground": "var(--primary-foreground)",
        secondary: "var(--secondary)",
        "secondary-foreground": "var(--secondary-foreground)",
        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",
        accent: "var(--accent)",
        "accent-foreground": "var(--accent-foreground)",
        destructive: "var(--destructive)",
        "destructive-foreground": "var(--destructive-foreground)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        "esports-yellow": "#FFD700",
        "esports-gold": "#FACC15",
        "esports-amber": "#F59E0B",
        "esports-dark": "#0a0a0a",
        "esports-panel": "#121212",
        "esports-surface": "#1a1a1a",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "float-slow": "float 6s ease-in-out infinite",
        "float-slower": "float 8s ease-in-out infinite",
        "shine": "shine 1.5s ease-in-out infinite",
        "float": "float 4s ease-in-out infinite",
        "float-fast": "float 3s ease-in-out infinite",
        "pulse-fast": "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-subtle": "bounce-subtle 2s infinite",
        "slide-in-up": "slide-in-up 0.6s ease-out forwards",
        "slide-in-down": "slide-in-down 0.6s ease-out forwards",
        "slide-in-left": "slide-in-left 0.6s ease-out forwards",
        "slide-in-right": "slide-in-right 0.6s ease-out forwards",
        "fade-in-up": "fade-in-up 0.6s ease-out forwards",
        "fade-in-down": "fade-in-down 0.6s ease-out forwards",
        "scale-in": "scale-in 0.4s ease-out forwards",
        "rotate-in": "rotate-in 0.6s ease-out forwards",
        "flip-in": "flip-in 0.6s ease-out forwards",
        "skeleton-shimmer": "skeleton-shimmer 1.5s ease-in-out infinite",
        "skeleton-wave": "skeleton-wave 2s ease-in-out infinite",
        "skeleton-pulse": "skeleton-pulse 1.5s ease-in-out infinite",
        "skeleton-glow": "skeleton-glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        glow: {
          "from": { boxShadow: "0 0 10px -5px var(--primary)" },
          "to": { boxShadow: "0 0 20px 5px var(--primary)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-10px) rotate(2deg)" },
        },
        shine: {
          "0%": { transform: "skewX(-15deg) translateX(-150%)" },
          "100%": { transform: "skewX(-15deg) translateX(150%)" },
        },
        "slide-in-up": {
          "from": { transform: "translateY(30px)", opacity: "0" },
          "to": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-in-down": {
          "from": { transform: "translateY(-30px)", opacity: "0" },
          "to": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-in-left": {
          "from": { transform: "translateX(-30px)", opacity: "0" },
          "to": { transform: "translateX(0)", opacity: "1" },
        },
        "slide-in-right": {
          "from": { transform: "translateX(30px)", opacity: "0" },
          "to": { transform: "translateX(0)", opacity: "1" },
        },
        "fade-in-up": {
          "from": { transform: "translateY(20px)", opacity: "0" },
          "to": { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in-down": {
          "from": { transform: "translateY(-20px)", opacity: "0" },
          "to": { transform: "translateY(0)", opacity: "1" },
        },
        "scale-in": {
          "from": { transform: "scale(0.9)", opacity: "0" },
          "to": { transform: "scale(1)", opacity: "1" },
        },
        "rotate-in": {
          "from": { transform: "rotate(-5deg)", opacity: "0" },
          "to": { transform: "rotate(0deg)", opacity: "1" },
        },
        "flip-in": {
          "from": { transform: "perspective(400px) rotateY(-15deg)", opacity: "0" },
          "to": { transform: "perspective(400px) rotateY(0deg)", opacity: "1" },
        },
        "bounce-subtle": {
          "0%, 20%, 50%, 80%, 100%": { transform: "translateY(0)" },
          "40%": { transform: "translateY(-3px)" },
          "60%": { transform: "translateY(-2px)" },
        },
        "skeleton-shimmer": {
          "0%": { backgroundPosition: "-200px 0" },
          "100%": { backgroundPosition: "calc(200px + 100%) 0" },
        },
        "skeleton-wave": {
          "0%": { transform: "translateX(-100%)" },
          "50%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "skeleton-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
        "skeleton-glow": {
          "0%": { boxShadow: "0 0 5px rgba(255, 215, 0, 0.2)" },
          "100%": { boxShadow: "0 0 20px rgba(255, 215, 0, 0.4)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;