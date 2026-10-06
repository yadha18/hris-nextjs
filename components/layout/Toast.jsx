'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { hideToast } from '@/store/slices/uiSlice';

export default function Toast() {
  const dispatch = useDispatch();
  const toast = useSelector((state) => state.ui.toast);

  useEffect(() => {
    if (!toast?.isVisible) return;
    const hideTimer = setTimeout(() => dispatch(hideToast()), toast.durationMs);
    return () => clearTimeout(hideTimer);
  }, [toast, dispatch]);

  const isVisible = Boolean(toast?.isVisible);

  return (
    <div
      className={`fixed bottom-4 left-3 right-3 z-999 rounded-[10px] border border-line-strong bg-surface2 px-[18px] py-3 text-[13.5px] font-medium transition-all duration-300 md:bottom-6 md:left-auto md:right-6 md:max-w-xs ${
        isVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-20 opacity-0'
      }`}
    >
      {toast?.message}
    </div>
  );
}