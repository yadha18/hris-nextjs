'use client';

const THEME_STORAGE_KEY = 'hris_theme';

function toggleTheme() {
  const rootElement = document.documentElement;
  const nextTheme = rootElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  rootElement.setAttribute('data-theme', nextTheme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  } catch {}
}

export default function ThemeToggle() {
  return (
    <button
      type="button"
      onClick={toggleTheme}
      title="Ganti Light/Dark Mode"
      aria-label="Toggle Light/Dark Mode"
      className="relative flex h-[27px] w-[52px] shrink-0 cursor-pointer items-center justify-between rounded-full border border-line-strong bg-surface2 px-1.5 transition-colors hover:border-accent"
    >
      <span className="relative z-10 text-xs leading-none opacity-70">🌙</span>
      <span className="relative z-10 text-xs leading-none opacity-70">☀️</span>
      <span className="absolute left-0.5 top-0.5 h-[21px] w-[21px] rounded-full bg-accent shadow-md transition-all duration-200 light:left-[calc(100%-23px)] light:bg-warning" />
    </button>
  );
}