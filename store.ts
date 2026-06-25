@import "tailwindcss";

@theme {
  --color-brand-400: #F87171;
  --color-brand-500: #DC2626;
  --color-brand-600: #B91C1C;
  --color-zinc-400: #9ca3af;
  --color-zinc-500: #6b7280;
  --color-zinc-700: #444444;
  --color-zinc-800: #333333;
  --color-zinc-900: #1A1A1A;
  --color-zinc-950: #000000;
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
}

body {
  font-family: var(--font-sans);
  background-color: var(--color-zinc-950);
  color: white;
}

.custom-scroll::-webkit-scrollbar {
  width: 6px;
}
.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: var(--color-brand-500);
  border-radius: 10px;
}

