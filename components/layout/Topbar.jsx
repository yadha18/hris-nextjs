'use client';

import { useDispatch, useSelector } from 'react-redux';
import { toggleSidebar } from '@/store/slices/uiSlice';
import ThemeToggle from './ThemeToggle';

export default function Topbar() {
  const dispatch = useDispatch();
  const totalLogEntries = useSelector((state) => state.hris.log.length);

  return (
    <header className="sticky top-0 z-100 flex h-14 items-center gap-2 border-b border-line bg-surface px-3.5 md:gap-3 md:px-7">
      <button
        type="button"
        onClick={() => dispatch(toggleSidebar())}
        title="Menu"
        aria-label="Buka/tutup menu"
        className="flex h-8 w-8 shrink-0 cursor-pointer flex-col justify-center gap-1 rounded-md p-1 hover:bg-surface2 md:hidden"
      >
        <span className="block h-0.5 w-full rounded-sm bg-fg" />
        <span className="block h-0.5 w-full rounded-sm bg-fg" />
        <span className="block h-0.5 w-full rounded-sm bg-fg" />
      </button>

      <div className="text-[13px] font-bold tracking-[0.04em] text-accent-light md:text-[15px]">
        HRIS <span className="font-normal text-fg-muted">/ Jabatan Karyawan</span>
      </div>

      <div className="flex-1" />

      {totalLogEntries > 0 && (
        <span className="hidden rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-white md:inline-block">
          {totalLogEntries} perubahan
        </span>
      )}
      <ThemeToggle />
    </header>
  );
}