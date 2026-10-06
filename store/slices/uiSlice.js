import { createSlice, nanoid } from "@reduxjs/toolkit";

const DEFAULT_TOAST_DURATION_MS = 3000;

function extractYear(monthLabel) {
  const yearMatch = String(monthLabel).match(/\b(20\d{2})\b/);
  return yearMatch ? Number(yearMatch[1]) : null;
}

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    activePage: "dashboard",
    selectedBulan: null, // contoh: 'Januari 2026'
    expandedLemburYears: [],
    isSidebarOpen: false,
    toast: null, // { id, message, durationMs, isVisible }
    activeModal: null, // { name, payload }
    isSuperadminAuthenticated: false,
    lemburViewTab: "dashboard",
  },
  reducers: {
    navigateTo(state, action) {
      state.activePage = action.payload;
      state.isSidebarOpen = false;
    },
    openLemburMonth(state, action) {
      const monthLabel = action.payload;
      const year = extractYear(monthLabel);

      state.activePage = "lembur-bulan";
      state.selectedBulan = monthLabel;
      state.isSidebarOpen = false;
      if (year && !state.expandedLemburYears.includes(year)) {
        state.expandedLemburYears.push(year);
      }
    },
    toggleLemburYear(state, action) {
      const year = action.payload;
      state.expandedLemburYears = state.expandedLemburYears.includes(year)
        ? state.expandedLemburYears.filter(
            (expandedYear) => expandedYear !== year,
          )
        : [...state.expandedLemburYears, year];
    },
    toggleSidebar(state) {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    setSidebarOpen(state, action) {
      state.isSidebarOpen = action.payload;
    },
    showToast: {
      reducer(state, action) {
        state.toast = action.payload;
      },
      prepare(message, durationMs = DEFAULT_TOAST_DURATION_MS) {
        return {
          payload: { id: nanoid(), message, durationMs, isVisible: true },
        };
      },
    },
    hideToast(state) {
      if (state.toast) state.toast.isVisible = false;
    },
    openModal(state, action) {
      state.activeModal = action.payload;
    },
    closeModal(state) {
      state.activeModal = null;
    },
    grantSuperadminAccess(state) {
      state.isSuperadminAuthenticated = true;
    },
    setLemburViewTab(state, action) {
      state.lemburViewTab = action.payload;
    },
  },
});

export const {
  navigateTo,
  openLemburMonth,
  toggleLemburYear,
  toggleSidebar,
  setSidebarOpen,
  showToast,
  hideToast,
  openModal,
  closeModal,
  grantSuperadminAccess,
  setLemburViewTab,
} = uiSlice.actions;
export default uiSlice.reducer;
