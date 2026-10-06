'use client';

import { useMemo } from 'react';
import { useSelector } from 'react-redux';

const BAR_WIDTH = 90;
const BAR_GAP = 60;
const CHART_HEIGHT = 160;
const CHART_LEFT_PADDING = 40;

const CHART_BARS = [
  { label: 'Baru Masuk', status: 'Baru Masuk', fillClass: 'fill-success' },
  { label: 'Aktif', status: 'Aktif', fillClass: 'fill-accent-light' },
  { label: 'Resign', status: 'Resign', fillClass: 'fill-danger' },
];

function buildCurrentMonthChart(employees) {
  const now = new Date();
  const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthLabel = now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  const updatedThisMonth = employees.filter((employee) => (employee.TglUpdate || '').startsWith(monthPrefix));
  const bars = CHART_BARS.map((bar) => ({
    ...bar,
    value: updatedThisMonth.filter((employee) => employee.Status === bar.status).length,
  }));
  const maxValue = Math.max(1, ...bars.map(({ value }) => value));

  return { monthLabel, bars, maxValue };
}

export default function EmployeeTypeChart() {
  const employees = useSelector((state) => state.hris.karyawan);
  const { monthLabel, bars, maxValue } = useMemo(() => buildCurrentMonthChart(employees), [employees]);
  const svgWidth = bars.length * (BAR_WIDTH + BAR_GAP) + CHART_LEFT_PADDING;

  return (
    <>
      <div className="mb-3 text-xs text-fg-muted">
        Periode: <strong className="text-fg">{monthLabel}</strong> (berdasarkan tanggal update data)
      </div>
      <svg viewBox={`0 0 ${svgWidth} 210`} className="h-auto w-full max-w-[480px]">
        <line x1="0" y1={CHART_HEIGHT + 20} x2={svgWidth} y2={CHART_HEIGHT + 20} className="stroke-line-strong" strokeWidth="1" />
        {bars.map(({ label, value, fillClass }, index) => {
          const barX = CHART_LEFT_PADDING + index * (BAR_WIDTH + BAR_GAP);
          const barHeight = (value / maxValue) * CHART_HEIGHT;
          const barY = CHART_HEIGHT - barHeight + 20;
          const centerX = barX + BAR_WIDTH / 2;

          return (
            <g key={label}>
              <text x={centerX} y={barY - 10} textAnchor="middle" className="fill-fg font-mono text-[15px] font-bold">{value}</text>
              <rect x={barX} y={barY} width={BAR_WIDTH} height={barHeight} rx="6" className={`${fillClass} opacity-85`} />
              <text x={centerX} y={CHART_HEIGHT + 42} textAnchor="middle" className="fill-fg-muted text-xs">{label}</text>
            </g>
          );
        })}
      </svg>
    </>
  );
}