'use client';

import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { initializeState } from '@/store/slices/hrisSlice';
import { showToast } from '@/store/slices/uiSlice';
import DashboardPage from './dashboard/DashboardPage';
import JabatanPage from './settings/JabatanPage';
import KaryawanPage from './karyawan/KaryawanPage';
import LaptopDashboardPage from './laptop/LaptopDashboardPage';
import LaptopTablePage from './laptop/LaptopTablePage';
import LemburBulanPage from './lembur/LemburBulanPage';
import ModalRoot from './modals/ModalRoot';
import SbuGradePage from './settings/SbuGradePage';
import Sidebar from './layout/Sidebar';
import Toast from './layout/Toast';
import Topbar from './layout/Topbar';
import UploadPage from './upload/UploadPage';

const PAGE_COMPONENTS = {
  dashboard: DashboardPage,
  karyawan: KaryawanPage,
  upload: UploadPage,
  'lembur-bulan': LemburBulanPage,
  'dashboard-laptop': LaptopDashboardPage,
  laptop: LaptopTablePage,
  jabatan: JabatanPage,
  'sbu-grade': SbuGradePage,
};

export default function AppShell() {
  const dispatch = useDispatch();
  const activePage = useSelector((state) => state.ui.activePage);
  const hasStartedInitialization = useRef(false);

  useEffect(() => {
    if (hasStartedInitialization.current) return; // cegah double-run React Strict Mode
    hasStartedInitialization.current = true;

    dispatch(initializeState())
      .unwrap()
      .then(({ repairedIdCount, promotedToActiveCount }) => {
        const notices = [];
        if (repairedIdCount > 0) {
          notices.push(`🔧 ${repairedIdCount} data karyawan dengan ID duplikat berhasil diperbaiki otomatis.`);
        }
        if (promotedToActiveCount > 0) {
          notices.push(`🔄 ${promotedToActiveCount} karyawan otomatis diubah dari "Baru Masuk" menjadi "Aktif" (sudah genap 1 bulan)`);
        }
        if (notices.length) dispatch(showToast(notices.join(' '), 5000));
      })
      .catch(() => dispatch(showToast('❌ Gagal terhubung ke server database. Data tidak dapat dimuat.', 6000)));
  }, [dispatch]);

  const ActivePage = PAGE_COMPONENTS[activePage];

  return (
    <>
      <Topbar />
      <div className="flex h-[calc(100vh-56px)] flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 md:p-5 lg:p-7">
          <ActivePage />
        </main>
      </div>
      <ModalRoot />
      <Toast />
    </>
  );
}