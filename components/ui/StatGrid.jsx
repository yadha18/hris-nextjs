// StatGrid.jsx
const DESKTOP_COLUMNS_CLASS = {
  2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4', 5: 'lg:grid-cols-5', 6: 'lg:grid-cols-6',
};

export default function StatGrid({ desktopColumns = 5, children }) {
  return (
    <div className={`mb-6 grid grid-cols-1 gap-2 min-[481px]:grid-cols-2 min-[481px]:gap-2.5 md:grid-cols-3 md:gap-3.5 ${DESKTOP_COLUMNS_CLASS[desktopColumns]}`}>
      {children}
    </div>
  );
}