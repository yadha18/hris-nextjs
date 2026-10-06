export const DEFAULT_SBU = [
  "SUMATERA BAGIAN UTARA",
  "SUMATERA BAGIAN TENGAH",
  "SUMATERA BAGIAN SELATAN",
  "SULAWESI & INDONESIA TIMUR",
  "KALIMANTAN",
  "JAWA BAGIAN TIMUR",
  "JAWA BAGIAN TENGAH",
  "JAWA BAGIAN BARAT",
  "JAKARTA & BANTEN",
  "BALI & NUSA TENGGARA",
  "PUSAT",
];

export const DEFAULT_JABATAN = [
  "ACCOUNT EXECUTIVE GRADE 1",
  "ACCOUNT EXECUTIVE GRADE 2",
  "COLLECTION SBU",
  "ACCOUNT MANAGER JUNIOR",
  "ACCOUNT MANAGER SENIOR",
  "OFFICER MARKETING",
  "VALIDASI SBU",
  "ADMINISTRASI SALES",
  "COLLECTION PUSAT",
  "DATA ANALYST & DESIGN ENGINEER",
];

export const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export const DEFAULT_LEMBUR_YEARS = [2026, 2027];

export const DEFAULT_LEMBUR_YEAR = 2026; // dipakai bila teks Bulan tidak menyebut tahun
export const LEMBUR_BILLING_TYPES = ["SPPD 1 2", "Lembur"];
export const LEMBUR_MONTH_OPTIONS = DEFAULT_LEMBUR_YEARS.flatMap((year) =>
  MONTH_NAMES.map((monthName) => `${monthName} ${year}`),
);

export const LAPTOP_STATUS_OPTIONS = [
  "Aktif",
  "Belum Dikembalikan",
  "Sudah Dikembalikan",
];
export const LAPTOP_EXCLUDED_JABATAN = [
  "ACCOUNT EXECUTIVE GRADE 1",
  "ACCOUNT EXECUTIVE GRADE 2",
];

export const MAX_UPLOAD_FILE_SIZE_MB = 10;

export const STATUS_DEFINITIONS = {
  "Baru Masuk": { variant: "green", label: "🟢 Baru Masuk" },
  Aktif: { variant: "blue", label: "🔵 Aktif" },
  Resign: { variant: "red", label: "🔴 Resign" },
};

export const HARGA_SBU_GRADE = [
  {
    SBU: "SUMATERA BAGIAN UTARA",
    Grade: "OFFICER GRADE-1",
    HargaSatuan: 5978000,
    GajiPokok: 4379000,
  },
  {
    SBU: "SUMATERA BAGIAN TENGAH",
    Grade: "OFFICER GRADE-1",
    HargaSatuan: 5540000,
    GajiPokok: 4039000,
  },
  {
    SBU: "SUMATERA BAGIAN SELATAN",
    Grade: "OFFICER GRADE-1",
    HargaSatuan: 5799000,
    GajiPokok: 4235000,
  },
  {
    SBU: "JAWA BAGIAN BARAT",
    Grade: "OFFICER GRADE-1",
    HargaSatuan: 6501000,
    GajiPokok: 4786000,
  },
  {
    SBU: "JAKARTA & BANTEN",
    Grade: "OFFICER GRADE-1",
    HargaSatuan: 7794000,
    GajiPokok: 5788000,
  },
  {
    SBU: "PUSAT",
    Grade: "OFFICER GRADE-1",
    HargaSatuan: 7794000,
    GajiPokok: 5788000,
  },
  {
    SBU: "PUSAT",
    Grade: "OFFICER GRADE-8",
    HargaSatuan: 8823000,
    GajiPokok: 6590000,
  },
  {
    SBU: "JAWA BAGIAN TENGAH",
    Grade: "OFFICER GRADE-1",
    HargaSatuan: 5154000,
    GajiPokok: 3739000,
  },
  {
    SBU: "JAWA BAGIAN TIMUR",
    Grade: "OFFICER GRADE-1",
    HargaSatuan: 7215000,
    GajiPokok: 5342000,
  },
  {
    SBU: "KALIMANTAN",
    Grade: "OFFICER GRADE-1",
    HargaSatuan: 5363000,
    GajiPokok: 3896000,
  },
  {
    SBU: "BALI & NUSA TENGGARA",
    Grade: "OFFICER GRADE-1",
    HargaSatuan: 5266000,
    GajiPokok: 3829000,
  },
  {
    SBU: "SULAWESI & INDONESIA TIMUR",
    Grade: "OFFICER GRADE-1",
    HargaSatuan: 5744000,
    GajiPokok: 4190000,
  },
  {
    SBU: "SUMATERA BAGIAN UTARA",
    Grade: "MARKETING GRADE-23",
    HargaSatuan: 8724000,
    GajiPokok: 6287000,
  },
  {
    SBU: "SUMATERA BAGIAN TENGAH",
    Grade: "MARKETING GRADE-29",
    HargaSatuan: 8713000,
    GajiPokok: 6278000,
  },
  {
    SBU: "SUMATERA BAGIAN SELATAN",
    Grade: "MARKETING GRADE-25",
    HargaSatuan: 8675000,
    GajiPokok: 6248000,
  },
  {
    SBU: "JAWA BAGIAN BARAT",
    Grade: "MARKETING GRADE-16",
    HargaSatuan: 8624000,
    GajiPokok: 6207000,
  },
  {
    SBU: "JAKARTA & BANTEN",
    Grade: "MARKETING GRADE-9",
    HargaSatuan: 9297000,
    GajiPokok: 6704000,
  },
  {
    SBU: "JAWA BAGIAN TENGAH",
    Grade: "MARKETING GRADE-35",
    HargaSatuan: 8685000,
    GajiPokok: 6256000,
  },
  {
    SBU: "JAWA BAGIAN TIMUR",
    Grade: "MARKETING GRADE-10",
    HargaSatuan: 8733000,
    GajiPokok: 6294000,
  },
  {
    SBU: "KALIMANTAN",
    Grade: "MARKETING GRADE-31",
    HargaSatuan: 8628000,
    GajiPokok: 6210000,
  },
  {
    SBU: "BALI & NUSA TENGGARA",
    Grade: "MARKETING GRADE-33",
    HargaSatuan: 8685000,
    GajiPokok: 6256000,
  },
  {
    SBU: "SULAWESI & INDONESIA TIMUR",
    Grade: "MARKETING GRADE-26",
    HargaSatuan: 8695000,
    GajiPokok: 6264000,
  },
  {
    SBU: "SUMATERA BAGIAN UTARA",
    Grade: "SALES GRADE-1",
    HargaSatuan: 6514000,
    GajiPokok: 4552000,
  },
  {
    SBU: "SUMATERA BAGIAN UTARA",
    Grade: "SALES GRADE-2",
    HargaSatuan: 6784000,
    GajiPokok: 4769000,
  },
  {
    SBU: "SUMATERA BAGIAN TENGAH",
    Grade: "SALES GRADE-1",
    HargaSatuan: 6057000,
    GajiPokok: 4199000,
  },
  {
    SBU: "SUMATERA BAGIAN TENGAH",
    Grade: "SALES GRADE-2",
    HargaSatuan: 6322000,
    GajiPokok: 4398000,
  },
  {
    SBU: "SUMATERA BAGIAN SELATAN",
    Grade: "SALES GRADE-1",
    HargaSatuan: 6328000,
    GajiPokok: 4403000,
  },
  {
    SBU: "SUMATERA BAGIAN SELATAN",
    Grade: "SALES GRADE-2",
    HargaSatuan: 6590000,
    GajiPokok: 4613000,
  },
  {
    SBU: "JAWA BAGIAN BARAT",
    Grade: "SALES GRADE-1",
    HargaSatuan: 7060000,
    GajiPokok: 4975000,
  },
  {
    SBU: "JAWA BAGIAN BARAT",
    Grade: "SALES GRADE-2",
    HargaSatuan: 7357000,
    GajiPokok: 5212000,
  },
  {
    SBU: "JAKARTA & BANTEN",
    Grade: "SALES GRADE-1",
    HargaSatuan: 8386000,
    GajiPokok: 6017000,
  },
  {
    SBU: "JAKARTA & BANTEN",
    Grade: "SALES GRADE-2",
    HargaSatuan: 8744000,
    GajiPokok: 6303000,
  },
  {
    SBU: "JAWA BAGIAN TENGAH",
    Grade: "SALES GRADE-1",
    HargaSatuan: 5654000,
    GajiPokok: 3887000,
  },
  {
    SBU: "JAWA BAGIAN TENGAH",
    Grade: "SALES GRADE-2",
    HargaSatuan: 5900000,
    GajiPokok: 4072000,
  },
  {
    SBU: "JAWA BAGIAN TIMUR",
    Grade: "SALES GRADE-1",
    HargaSatuan: 7805000,
    GajiPokok: 5554000,
  },
  {
    SBU: "JAWA BAGIAN TIMUR",
    Grade: "SALES GRADE-2",
    HargaSatuan: 8136000,
    GajiPokok: 5818000,
  },
  {
    SBU: "KALIMANTAN",
    Grade: "SALES GRADE-1",
    HargaSatuan: 5872000,
    GajiPokok: 4050000,
  },
  {
    SBU: "KALIMANTAN",
    Grade: "SALES GRADE-2",
    HargaSatuan: 6129000,
    GajiPokok: 4243000,
  },
  {
    SBU: "BALI & NUSA TENGGARA",
    Grade: "SALES GRADE-1",
    HargaSatuan: 5786000,
    GajiPokok: 3981000,
  },
  {
    SBU: "BALI & NUSA TENGGARA",
    Grade: "SALES GRADE-2",
    HargaSatuan: 6022000,
    GajiPokok: 4171000,
  },
  {
    SBU: "SULAWESI & INDONESIA TIMUR",
    Grade: "SALES GRADE-1",
    HargaSatuan: 6269000,
    GajiPokok: 4356000,
  },
  {
    SBU: "SULAWESI & INDONESIA TIMUR",
    Grade: "SALES GRADE-2",
    HargaSatuan: 6528000,
    GajiPokok: 4563000,
  },
];

export const EMPLOYEE_STATUS_OPTIONS = Object.entries(STATUS_DEFINITIONS).map(
  ([value, { label }]) => ({ value, label }),
);

export const LAPTOP_STATUS_MISSING = "Belum Dapat Laptop"; // status virtual: belum tercatat punya laptop
export const LAPTOP_STATUS_NOT_ENTITLED = "Tidak Dapat Laptop"; // status virtual: jabatan tidak berhak laptop
export const LAPTOP_FILTER_STATUS_OPTIONS = [
  ...LAPTOP_STATUS_OPTIONS,
  LAPTOP_STATUS_MISSING,
  LAPTOP_STATUS_NOT_ENTITLED,
];
export const LAPTOP_TOTAL_LOCKED_VALUE = 138; // dikunci permanen, tidak dihitung dari data

export const LAPTOP_STATUS_VARIANTS = {
  Aktif: "green",
  "Belum Dikembalikan": "red",
  "Sudah Dikembalikan": "blue",
  [LAPTOP_STATUS_MISSING]: "gray",
  [LAPTOP_STATUS_NOT_ENTITLED]: "gray",
};
export const LAPTOP_LOG_VARIANTS = {
  "laptop upload": "green",
  "laptop tambah": "green",
  "laptop edit": "blue",
  "laptop hapus": "yellow",
  "laptop hapus semua": "red",
};

export const SHIRT_SIZES = ["S", "M", "L", "XL", "XXL", "3XL", "4XL"];
export const DEFAULT_PJTK = "PT. HALEYORA POWERINDO";
export const DEFAULT_NO_SP2K = "4500028490";

export const DEFAULT_GRADE = [
  "OFFICER GRADE-1",
  "OFFICER GRADE-8",
  "MARKETING GRADE-9",
  "MARKETING GRADE-10",
  "MARKETING GRADE-16",
  "MARKETING GRADE-23",
  "MARKETING GRADE-25",
  "MARKETING GRADE-26",
  "MARKETING GRADE-29",
  "MARKETING GRADE-31",
  "MARKETING GRADE-33",
  "MARKETING GRADE-35",
  "SALES GRADE-1",
  "SALES GRADE-2",
];

// SBU dicocokkan dengan "mengandung" alias; Jabatan dengan kecocokan persis
export const SBU_ALIAS_MAP = [
  {
    canonical: "SUMATERA BAGIAN UTARA",
    aliases: ["SBU", "SUMBAGUT", "PADANG SIDEMPUAN", "MEDAN", "ACEH"],
  },
  {
    canonical: "SUMATERA BAGIAN TENGAH",
    aliases: ["SBT", "SUMBAGTENG", "PEKANBARU", "PEKAN BARU"],
  },
  {
    canonical: "SUMATERA BAGIAN SELATAN",
    aliases: [
      "SBS",
      "SUMBAGSEL",
      "JAMBI",
      "PALEMBANG",
      "LAMPUNG",
      "BANGKA BELITUNG",
      "BELITUNG",
      "BENGKULU",
    ],
  },
  {
    canonical: "JAWA BAGIAN BARAT",
    aliases: ["JBB", "JABAR", "JAWA BARAT", "BANDUNG"],
  },
  {
    canonical: "JAWA BAGIAN TENGAH",
    aliases: ["JBTG", "JATENG", "JAWA TENGAH", "SEMARANG"],
  },
  {
    canonical: "JAWA BAGIAN TIMUR",
    aliases: ["JBT", "JATIM", "JAWA TIMUR", "SURABAYA", "MADIUN"],
  },
  {
    canonical: "JAKARTA & BANTEN",
    aliases: ["JKB", "JAKBAN", "JAKARTA & BANTEN", "JAKARTA", "BANTEN"],
  },
  {
    canonical: "KALIMANTAN",
    aliases: [
      "BALIKPAPAN",
      "PONTIANAK",
      "BANJARMASIN",
      "KAL",
      "KALTIM",
      "KALBAR",
      "KALTENG",
      "KALSEL",
      "SAMARINDA",
    ],
  },
  {
    canonical: "SULAWESI & INDONESIA TIMUR",
    aliases: [
      "RIT",
      "SIBT",
      "SIT",
      "SULAWESI",
      "MAKASSAR",
      "NTB",
      "NUSA TENGGARA BARAT",
    ],
  },
  {
    canonical: "BALI & NUSA TENGGARA",
    aliases: ["BNT", "BALI", "NTT", "NUSA TENGGARA TIMUR"],
  },
];

export const JABATAN_ALIAS_MAP = [
  { canonical: "VALIDASI SBU", aliases: ["VERIFICATOR"] },
  {
    canonical: "DATA ANALYST & DESIGN ENGINEER",
    aliases: ["DATA ANALYST & INFOGRAFIS ENGINEER"],
  },
  { canonical: "OFFICER MARKETING", aliases: ["OFFICER MARKETING RETAIL"] },
  {
    canonical: "ACCOUNT EXECUTIVE GRADE 1",
    aliases: ["ACCOUNT EXECUTIVE RETAIL GRADE 1"],
  },
  {
    canonical: "ACCOUNT EXECUTIVE GRADE 2",
    aliases: ["ACCOUNT EXECUTIVE RETAIL GRADE 2"],
  },
  {
    canonical: "ACCOUNT MANAGER JUNIOR",
    aliases: ["ACCOUNT MANAGER JUNIOR RETAIL"],
  },
  {
    canonical: "ACCOUNT MANAGER SENIOR",
    aliases: ["ACCOUNT MANAGER SENIOR RETAIL"],
  },
  { canonical: "COLLECTION PUSAT", aliases: ["COLLECTION"] },
  { canonical: "COLLECTION SBU", aliases: ["COLLECTION SBU"] },
];

export const MONTHLY_PAGU_STATIC = 15_000_000; // PAGU per bulan, angka tetap untuk setiap SBU
export const MAN_FEE_RATE = 0.07; // 7% dari total realisasi

export const NON_PO_CONFIG_LABELS = { paguNonPO: "PAGU Non PO", bnlp: "BNLP" };
export const LEMBUR_BILLING_VARIANTS = { "SPPD 1 2": "blue", Lembur: "yellow" };
export const LEMBUR_LOG_VARIANTS = {
  "lembur upload": "green",
  "lembur tambah": "green",
  "lembur edit": "blue",
  "lembur hapus": "yellow",
  "lembur config": "blue",
  "lembur tiket": "purple",
  "lembur hapus semua": "red",
};

export const NAMED_LISTS = {
  jabatan: {
    itemLabel: "Jabatan",
    addTitle: "➕ Tambah Jabatan",
    inputLabel: "Nama Jabatan",
    placeholder: "cth: MANAGER IT...",
    listTitle: "📋 Daftar Jabatan",
    emptyTitle: "Belum ada daftar jabatan",
  },
  subBidang: {
    itemLabel: "Sub Bidang",
    addTitle: "➕ Tambah Sub Bidang",
    inputLabel: "Nama Sub Bidang",
    placeholder: "cth: OPERASIONAL...",
    listTitle: "📋 Daftar Sub Bidang",
    emptyTitle: "Belum ada daftar Sub Bidang",
  },
};
