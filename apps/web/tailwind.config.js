import plugin from 'tailwindcss/plugin';
import tailwindcssAnimate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'selector',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Existing hand-picked palette (kept; still used across the site).
        'custom-gray': '#48434f',
        'wash-dark': 'rgb(35, 39, 47)',
        'shiki-dark': '#16181d',

        // shadcn/ui semantic tokens — resolve to the CSS variables in styles.css.
        // Existing components specify explicit `border-slate-*` colors, so
        // adding these (and the border DEFAULT) does not re-style them.
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },

        // Terminal skin semantic tokens — utilities (bg-term, text-ink,
        // border-line, text-amber…) resolve to the --t-* custom properties
        // in styles.css, which flip with html[data-theme] / html.dark. So
        // utilities carry the dark-mode swap for free, no dark: variants.
        paper: 'var(--t-bg)',
        term: 'var(--t-term)',
        panel: 'var(--t-panel)',
        sel: 'var(--t-sel)',
        line: 'var(--t-line)',
        ink: 'var(--t-text)',
        heading: 'var(--t-heading)',
        dim: 'var(--t-dim)',
        faint: 'var(--t-faint)',
        amber: 'var(--t-amber)',
        'amber-ink': 'var(--t-amber-ink)',
        cyan: 'var(--t-cyan)',
        green: 'var(--t-green)',
        red: 'var(--t-red)',
        violet: 'var(--t-violet)',
        tmux: 'var(--t-tmux-bg)',
        'tmux-ink': 'var(--t-tmux-ink)',
      },
      fontFamily: {
        // --t-mono flips with the theme attributes like the colors above.
        mono: ['var(--t-mono)'],
      },
      borderColor: {
        DEFAULT: 'hsl(var(--border))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      borderWidth: {
        10: '10px',
      },
      lineHeight: {
        16: '4rem',
      },
    },
  },
  plugins: [
    tailwindcssAnimate,
    // Devices without hover (touch): reveal hover-gated UI by default.
    plugin(({ addVariant }) => {
      addVariant('hover-none', '@media not (hover: hover)');
    }),
  ],
};
