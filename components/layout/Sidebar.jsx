'use client';

import { useDispatch, useSelector } from 'react-redux';
import { MONTH_NAMES } from '@/lib/config';
import { selectLemburYears } from '@/lib/selectors';
import { navigateTo, openLemburMonth, toggleLemburYear, setSidebarOpen } from '@/store/slices/uiSlice';

const MENU_ITEMS = [{ page: 'upload', icon: '📂', label: 'Upload Data' }];
const EMPLOYEE_ITEMS = [
  { page: 'dashboard', icon: '📊', label: 'Dashboard Karyawan' },
  { page: 'karyawan', icon: '👥', label: 'Tabel Data Karyawan' },
];
const LAPTOP_ITEMS = [
  { page: 'dashboard-laptop', icon: '💻', label: 'Dashboard Laptop' },
  { page: 'laptop', icon: '🧾', label: 'Tabel Monitoring Laptop' },
];
const SETTINGS_ITEMS = [
  { page: 'jabatan', icon: '📋', label: 'Daftar Jabatan' },
  { page: 'sbu-grade', icon: '📐', label: 'Kombinasi SBU & Grade' },
];

function NavLabel({ children }) {
  return (
    <div className="px-2 pb-1 pt-2.5 text-[10px] font-semibold uppercase tracking-widest text-fg-subtle">
      {children}
    </div>
  );
}

function NavButton({ icon, label, isActive, onClick, isSubItem = false, trailing = null }) {
  const stateClass = isActive
    ? 'bg-accent/15 text-accent-light'
    : 'text-fg-muted hover:bg-surface2 hover:text-fg';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full cursor-pointer items-center rounded-lg py-[9px] pr-3 text-left font-medium transition ${
        isSubItem ? 'pl-[30px] text-[12.5px]' : 'pl-3 text-[13.5px]'
      } ${trailing ? 'justify-between' : 'gap-2.5'} ${stateClass}`}
    >
      <span className="flex items-center gap-2.5">
        {icon && <span className="w-5 text-center text-base">{icon}</span>}
        {label}
      </span>
      {trailing}
    </button>
  );
}

function NavSection({ label, items, activePage, onNavigate }) {
  return (
    <>
      <NavLabel>{label}</NavLabel>
      {items.map(({ page, icon, label: itemLabel }) => (
        <NavButton
          key={page}
          icon={icon}
          label={itemLabel}
          isActive={activePage === page}
          onClick={() => onNavigate(page)}
        />
      ))}
    </>
  );
}

function LemburYearGroup({ year }) {
  const dispatch = useDispatch();
  const { activePage, selectedBulan, expandedLemburYears } = useSelector((state) => state.ui);
  const isExpanded = expandedLemburYears.includes(year);

  return (
    <>
      <NavButton
        icon="📅"
        label={String(year)}
        isActive={false}
        onClick={() => dispatch(toggleLemburYear(year))}
        trailing={<span className="text-[11px]">{isExpanded ? '▾' : '▸'}</span>}
      />
      {isExpanded &&
        MONTH_NAMES.map((monthName) => {
          const monthLabel = `${monthName} ${year}`;
          return (
            <NavButton
              key={monthLabel}
              label={monthName}
              isSubItem
              isActive={activePage === 'lembur-bulan' && selectedBulan === monthLabel}
              onClick={() => dispatch(openLemburMonth(monthLabel))}
            />
          );
        })}
    </>
  );
}

export default function Sidebar() {
  const dispatch = useDispatch();
  const activePage = useSelector((state) => state.ui.activePage);
  const isSidebarOpen = useSelector((state) => state.ui.isSidebarOpen);
  const lemburYears = useSelector(selectLemburYears);

  const handleNavigate = (page) => dispatch(navigateTo(page));

  return (
    <>
      {isSidebarOpen && (
        <div
          className="fixed inset-x-0 bottom-0 top-14 z-140 bg-black/50 md:hidden"
          onClick={() => dispatch(setSidebarOpen(false))}
        />
      )}

      <nav
        className={`fixed bottom-0 left-0 top-14 z-150 flex w-[78vw] max-w-[280px] flex-col gap-1 overflow-y-auto border-r border-line bg-surface px-3 py-5 shadow-[4px_0_24px_rgba(0,0,0,0.35)] transition-transform duration-200 md:static md:w-[190px] md:max-w-none md:shrink-0 md:translate-x-0 md:shadow-none lg:w-[220px] ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <NavSection label="Menu" items={MENU_ITEMS} activePage={activePage} onNavigate={handleNavigate} />
        <NavSection label="Data Informasi Karyawan" items={EMPLOYEE_ITEMS} activePage={activePage} onNavigate={handleNavigate} />

        <NavLabel>Data Lembur dan SPPD Karyawan</NavLabel>
        {lemburYears.map((year) => (
          <LemburYearGroup key={year} year={year} />
        ))}

        <NavSection label="Monitoring Pengadaan Laptop" items={LAPTOP_ITEMS} activePage={activePage} onNavigate={handleNavigate} />
        <NavSection label="Pengaturan" items={SETTINGS_ITEMS} activePage={activePage} onNavigate={handleNavigate} />
      </nav>
    </>
  );
}