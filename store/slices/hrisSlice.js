import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { DEFAULT_JABATAN } from "@/lib/config";
import { runEmployeeMaintenance } from "@/lib/employeeMaintenance";
import { normalizeLoadedLembur } from "@/lib/lemburService";
import { normalizeLoadedLaptops } from "@/lib/laptopService";
import { syncLaptopStatusWithResignedEmployees } from "@/lib/laptopService";

const STATE_ENDPOINT = "/api/state";

// Penanda bahwa ada permintaan simpan yang datang saat penyimpanan sebelumnya masih berjalan
let hasPendingSaveRequest = false;

export const fetchState = createAsyncThunk("hris/fetchState", async () => {
  const response = await fetch(STATE_ENDPOINT, { cache: "no-store" });
  if (!response.ok)
    throw new Error(`Gagal memuat data (HTTP ${response.status})`);
  return response.json();
});

export const saveState = createAsyncThunk(
  "hris/saveState",
  async (_, { getState, dispatch }) => {
    const {
      karyawan,
      jabatan,
      log,
      slotConfig,
      lembur,
      lemburSbuConfig,
      tiketHPI,
      laptop,
      subBidang,
    } = getState().hris;

    try {
      const response = await fetch(STATE_ENDPOINT, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          karyawan,
          jabatan,
          log,
          slotConfig,
          lembur,
          lemburSbuConfig,
          tiketHPI,
          laptop,
          subBidang,
        }),
      });
      if (!response.ok)
        throw new Error(`Gagal menyimpan data (HTTP ${response.status})`);
    } finally {
      if (hasPendingSaveRequest) {
        hasPendingSaveRequest = false;
        setTimeout(() => dispatch(saveState()), 0); // simpan ulang dengan data terbaru
      }
    }
  },
  {
    condition: (_, { getState }) => {
      if (getState().hris.isSaving) {
        hasPendingSaveRequest = true;
        return false;
      }
      return true;
    },
  },
);

const initialState = {
  karyawan: [],
  jabatan: DEFAULT_JABATAN.map((nama) => ({ nama })),
  subBidang: [],
  log: [],
  slotConfig: {},
  lembur: [],
  lemburSbuConfig: {},
  tiketHPI: 0,
  laptop: [],
  loadStatus: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  isSaving: false,
  errorMessage: null,
};

const hrisSlice = createSlice({
  name: "hris",
  initialState,
  reducers: {
    // Reducer domain (tambah/edit/hapus karyawan, lembur, laptop) ditambahkan di Fase 4
    employeesMaintained(state, action) {
      state.karyawan = action.payload.employees;
      state.log.push(...action.payload.logEntries);
    },
    employeeAdded(state, action) {
      state.karyawan.unshift(action.payload);
    },
    employeeUpdated(state, action) {
      const { employee, logEntries } = action.payload;
      const employeeIndex = state.karyawan.findIndex(
        (existing) => existing.id === employee.id,
      );
      if (employeeIndex !== -1) state.karyawan[employeeIndex] = employee;
      state.log.push(...logEntries);
    },
    employeeDeleted(state, action) {
      const { employeeId, logEntry } = action.payload;
      state.karyawan = state.karyawan.filter(
        (employee) => employee.id !== employeeId,
      );
      state.log.push(logEntry);
    },
    allEmployeesDeleted(state, action) {
      state.karyawan = [];
      state.log.push(action.payload);
    },
    // NIP lama diganti NIP baru; data Lembur & Laptop yang memakai NIP lama ikut disesuaikan
    employeeNipsReplaced(state, action) {
      const { replacements, logEntries } = action.payload;
      replacements.forEach(({ employeeId, oldNip, newNip }) => {
        const employee = state.karyawan.find(
          (existing) => existing.id === employeeId,
        );
        if (!employee) return;
        employee.NIP = newNip;
        employee.NIPBaru = "";
        state.lembur.forEach((entry) => {
          if (entry.NIP === oldNip) entry.NIP = newNip;
        });
        state.laptop.forEach((entry) => {
          if (entry.NIP === oldNip) entry.NIP = newNip;
        });
      });
      state.log.push(...logEntries);
    },
    slotConfigUpdated(state, action) {
      const { sbuName, jabatanSlots, logEntries } = action.payload;
      state.slotConfig[sbuName] = {
        total: Object.values(jabatanSlots).reduce(
          (sum, slotCount) => sum + slotCount,
          0,
        ),
        jabatan: jabatanSlots,
      };
      state.log.push(...logEntries);
    },
    uploadApplied(state, action) {
      const { logEntries, ...replacedCollections } = action.payload;
      Object.assign(state, replacedCollections);
      state.log.push(...logEntries);
    },
    lemburEntrySaved(state, action) {
      const { entry, logEntry } = action.payload;
      const entryIndex = state.lembur.findIndex(
        (existing) => existing.id === entry.id,
      );
      if (entryIndex === -1) state.lembur.push(entry);
      else state.lembur[entryIndex] = entry;
      state.log.push(logEntry);
    },
    lemburEntryDeleted(state, action) {
      const { entryId, logEntry } = action.payload;
      state.lembur = state.lembur.filter((entry) => entry.id !== entryId);
      state.log.push(logEntry);
    },
    lemburMonthCleared(state, action) {
      const { monthLabel, logEntry } = action.payload;
      state.lembur = state.lembur.filter((entry) => entry.Bulan !== monthLabel);
      state.log.push(logEntry);
    },
    lemburSbuConfigUpdated(state, action) {
      const { sbuName, field, value, logEntry } = action.payload;
      state.lemburSbuConfig[sbuName] = {
        paguNonPO: 0,
        bnlp: 0,
        ...state.lemburSbuConfig[sbuName],
        [field]: value,
      };
      state.log.push(logEntry);
    },
    laptopEntrySaved(state, action) {
      const { entry, logEntry } = action.payload;
      const entryIndex = state.laptop.findIndex(
        (existing) => existing.id === entry.id,
      );
      if (entryIndex === -1) state.laptop.push(entry);
      else state.laptop[entryIndex] = entry;
      state.log.push(logEntry);
    },
    laptopEntryDeleted(state, action) {
      const { entryId, logEntry } = action.payload;
      state.laptop = state.laptop.filter((entry) => entry.id !== entryId);
      state.log.push(logEntry);
    },
    allLaptopsDeleted(state, action) {
      state.laptop = [];
      state.log.push(action.payload);
    },
    namedListItemAdded(state, action) {
      const { listKey, name } = action.payload;
      state[listKey].push({ nama: name });
    },
    namedListItemRemoved(state, action) {
      const { listKey, name } = action.payload;
      state[listKey] = state[listKey].filter((item) => item.nama !== name);
    },
    laptopStatusesSynced(state, action) {
      state.laptop = action.payload.laptops;
      state.log.push(...action.payload.logEntries);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchState.pending, (state) => {
        state.loadStatus = "loading";
        state.errorMessage = null;
      })
      .addCase(fetchState.fulfilled, (state, action) => {
        const data = action.payload;
        const asArray = (value) => (Array.isArray(value) ? value : []);

        state.karyawan = asArray(data.karyawan);
        state.log = asArray(data.log);
        state.lembur = normalizeLoadedLembur(
          asArray(data.lembur),
          state.karyawan,
        );
        state.laptop = normalizeLoadedLaptops(
          asArray(data.laptop),
          state.karyawan,
        );
        state.subBidang = asArray(data.subBidang);
        state.jabatan = asArray(data.jabatan).length
          ? data.jabatan
          : state.jabatan;
        state.slotConfig = data.slotConfig || {};
        state.lemburSbuConfig = data.lemburSbuConfig || {};
        state.tiketHPI = Number(data.tiketHPI) || 0;
        state.loadStatus = "succeeded";
      })
      .addCase(fetchState.rejected, (state, action) => {
        state.loadStatus = "failed";
        state.errorMessage = action.error.message;
      })
      .addCase(saveState.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(saveState.fulfilled, (state) => {
        state.isSaving = false;
      })
      .addCase(saveState.rejected, (state, action) => {
        state.isSaving = false;
        state.errorMessage = action.error.message;
      });
  },
});

export const {
  employeesMaintained,
  employeeAdded,
  employeeUpdated,
  employeeDeleted,
  allEmployeesDeleted,
  employeeNipsReplaced,
  slotConfigUpdated,
  uploadApplied,
  lemburEntrySaved,
  lemburEntryDeleted,
  lemburMonthCleared,
  lemburSbuConfigUpdated,
  laptopEntrySaved,
  laptopEntryDeleted,
  allLaptopsDeleted,
  namedListItemAdded,
  namedListItemRemoved,
  laptopStatusesSynced,
} = hrisSlice.actions;

// Pengganti UI.init(): muat data → rawat data → simpan jika ada perubahan
export const initializeState = createAsyncThunk(
  "hris/initialize",
  async (_, { dispatch, getState }) => {
    await dispatch(fetchState()).unwrap();

    const maintenance = runEmployeeMaintenance(getState().hris.karyawan);
    if (maintenance.hasChanges) {
      dispatch(
        employeesMaintained({
          employees: maintenance.employees,
          logEntries: maintenance.logEntries,
        }),
      );
    }

    const { laptop, karyawan } = getState().hris;
    const laptopSync = syncLaptopStatusWithResignedEmployees(laptop, karyawan);
    if (laptopSync.syncedCount > 0) dispatch(laptopStatusesSynced(laptopSync));

    if (maintenance.hasChanges || laptopSync.syncedCount > 0)
      dispatch(saveState());
    return {
      ...maintenance.summary,
      syncedLaptopCount: laptopSync.syncedCount,
    };
  },
);

export default hrisSlice.reducer;
