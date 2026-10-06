"use client";

import { useDispatch } from "react-redux";
import Button from "@/components/ui/Button";
import DataTable, { Td } from "@/components/ui/DataTable";
import Pill from "@/components/ui/Pill";
import StatusPill from "@/components/ui/StatusPill";
import { formatRupiah } from "@/lib/utils";
import { openModal } from "@/store/slices/uiSlice";

const dashIfEmpty = (value) => value || "—";

function OptionalPill({ variant, value }) {
  return value ? <Pill variant={variant}>{value}</Pill> : "—";
}

const EMPLOYEE_COLUMNS = [
  {
    label: "NIP",
    cellClass: "font-mono text-xs",
    render: (employee) => employee.NIP,
  },
  {
    label: "Nama",
    render: (employee, { openDetail }) => (
      <button
        type="button"
        onClick={openDetail}
        title="Lihat detail karyawan"
        className="cursor-pointer font-medium text-accent-light"
      >
        {employee.Nama}
      </button>
    ),
  },
  {
    label: "NIK",
    cellClass: "font-mono text-xs",
    render: (employee) => dashIfEmpty(employee.NIK),
  },
  {
    label: "Grade",
    render: (employee) => (
      <OptionalPill variant="purple" value={employee.Grade} />
    ),
  },
  {
    label: "Jabatan",
    render: (employee) => <Pill variant="blue">{employee.Jabatan}</Pill>,
  },
  { label: "SBU", render: (employee) => employee.SBU },
  {
    label: "Gaji Pokok",
    cellClass: "font-mono text-xs",
    render: (employee) => formatRupiah(employee.GajiPokok),
  },
  {
    label: "Harga Satuan",
    cellClass: "font-mono text-xs",
    render: (employee) => formatRupiah(employee.HargaSatuan),
  },
  { label: "PJTK", render: (employee) => dashIfEmpty(employee.PJTK) },
  {
    label: "No. SP2K",
    cellClass: "font-mono text-xs",
    render: (employee) => dashIfEmpty(employee.NoSP2K),
  },
  { label: "Nama TL", render: (employee) => dashIfEmpty(employee.NamaTL) },
  {
    label: "Sub Bidang",
    render: (employee) => (
      <OptionalPill variant="gray" value={employee.SubBidang} />
    ),
  },
  { label: "BKO Jabatan", render: (employee) => employee.BKOJabatan },
  { label: "BKO SBU", render: (employee) => employee.BKOSBU },
  {
    label: "NIP Baru",
    cellClass: "font-mono text-xs",
    render: (employee) => employee.NIPBaru,
  },
  { label: "Email Pribadi", render: (employee) => dashIfEmpty(employee.Email) },
  {
    label: "Email Korporat",
    render: (employee) => dashIfEmpty(employee.EmailKorporat),
  },
  {
    label: "Nama Akun ICRM",
    render: (employee) => dashIfEmpty(employee.NamaAkunICRM),
  },
  { label: "No. Telp", render: (employee) => dashIfEmpty(employee.NoTelp) },
  {
    label: "Ukuran Baju",
    render: (employee) => (
      <OptionalPill variant="gray" value={employee.UkuranBaju} />
    ),
  },
  {
    label: "Tgl Masuk",
    cellClass: "text-xs text-fg-muted",
    render: (employee) => dashIfEmpty(employee.TglMasuk),
  },
  {
    label: "Tgl Keluar",
    cellClass: "text-xs text-fg-muted",
    render: (employee) => dashIfEmpty(employee.TglKeluar),
  },
  {
    label: "Tgl Update",
    cellClass: "text-xs text-fg-muted",
    render: (employee) => employee.TglUpdate,
  },
  {
    label: "Status",
    render: (employee) => (
      <>
        <StatusPill status={employee.Status} />
        {employee.StatusCatatan && (
          <>
            <br />
            <span className="text-[10px] text-fg-muted">
              {employee.StatusCatatan}
            </span>
          </>
        )}
      </>
    ),
  },
];

const TABLE_HEADERS = ["Aksi", ...EMPLOYEE_COLUMNS.map(({ label }) => label)];

export default function EmployeeTable({ employees }) {
  const dispatch = useDispatch();

  return (
    <DataTable headers={TABLE_HEADERS} minWidthClass="min-w-[1200px]">
      {employees.map((employee) => {
        const showModal = (name) => () =>
          dispatch(openModal({ name, payload: employee.id }));
        return (
          <tr key={employee.id} className="hover:bg-white/[0.02]">
            <Td>
              <div className="flex gap-1">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={showModal("employeeDetail")}
                >
                  🔍 Detail
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={showModal("editEmployee")}
                >
                  ✏️ Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={showModal("confirmDeleteEmployee")}
                >
                  🗑 Hapus
                </Button>
              </div>
            </Td>
            {EMPLOYEE_COLUMNS.map(({ label, cellClass = "", render }) => (
              <Td key={label} className={cellClass}>
                {render(employee, { openDetail: showModal("employeeDetail") })}
              </Td>
            ))}
          </tr>
        );
      })}
    </DataTable>
  );
}
