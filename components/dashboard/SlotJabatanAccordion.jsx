"use client";

import { Fragment, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "@/components/ui/Button";
import DataTable, { Td } from "@/components/ui/DataTable";
import DisclosureArrow from "@/components/ui/DisclosureArrow";
import EmptyState from "@/components/ui/EmptyState";
import { selectSlotSummary } from "@/lib/selectors";
import { toggleSetMember } from "@/lib/utils";
import { openModal } from "@/store/slices/uiSlice";

const SLOT_TABLE_HEADERS = [
  "Jabatan",
  { label: "Slot Fix", align: "center" },
  { label: "Terisi", align: "center" },
  { label: "Sisa", align: "center" },
];

function getRemainingSlotsTextClass(remainingSlots) {
  if (remainingSlots < 0) return "text-danger";
  if (remainingSlots === 0) return "text-success";
  return "text-warning";
}

function JabatanSlotRow({ jabatanSlot, isOpen, onToggle }) {
  const { jabatanName, fixedSlots, occupants, remainingSlots } = jabatanSlot;

  return (
    <>
      <tr
        className="cursor-pointer hover:bg-white/[0.03]"
        onClick={onToggle}
        title="Klik untuk lihat rincian nama karyawan"
      >
        <Td className="pl-6 text-xs text-fg-muted">
          <DisclosureArrow isOpen={isOpen} sizeClass="mr-1.5 text-[9px]" />
          {jabatanName}
        </Td>
        <Td className="text-center font-mono text-xs">{fixedSlots}</Td>
        <Td className="text-center font-mono text-xs">{occupants.length}</Td>
        <Td
          className={`text-center font-mono text-xs font-semibold ${getRemainingSlotsTextClass(remainingSlots)}`}
        >
          {remainingSlots}
        </Td>
      </tr>
      {isOpen && (
        <tr>
          <td colSpan={4} className="bg-bg p-0">
            <div className="flex flex-col gap-1.5 pb-3.5 pl-12 pr-5 pt-2.5">
              {occupants.length ? (
                occupants.map((employee) => (
                  <div
                    key={employee.id}
                    className="flex items-center justify-between gap-3 rounded-[7px] border border-line bg-surface px-3 py-[7px] text-[12.5px]"
                  >
                    <span>{employee.Nama}</span>
                    <span className="font-mono text-[11px] text-fg-muted">
                      {employee.NIP}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-1.5 text-xs text-fg-subtle">
                  Belum ada karyawan di jabatan ini.
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function SbuSlotPanel({
  sbuSlot,
  isOpen,
  openJabatanKeys,
  onToggle,
  onToggleJabatan,
  onEdit,
}) {
  const {
    sbuName,
    jabatanSlots,
    totalFixedSlots,
    occupiedSlots,
    remainingSlots,
  } = sbuSlot;

  return (
    <div className="overflow-hidden rounded-[10px] border border-line">
      <div className="flex items-center gap-3 bg-surface2 py-2.5 pl-4 pr-2.5 transition hover:bg-line">
        <button
          type="button"
          onClick={onToggle}
          className="flex min-w-0 flex-1 cursor-pointer flex-wrap items-center gap-x-3 gap-y-1 text-left"
        >
          <DisclosureArrow isOpen={isOpen} />
          <span className="flex-1 text-[13.5px] font-bold text-fg">
            {sbuName}
          </span>
          <span className="flex flex-wrap gap-4 text-xs text-fg-muted">
            <span className="font-mono">
              Fix: <strong className="text-fg">{totalFixedSlots}</strong>
            </span>
            <span className="font-mono">
              Terisi: <strong className="text-fg">{occupiedSlots}</strong>
            </span>
            <span
              className={`font-mono ${getRemainingSlotsTextClass(remainingSlots)}`}
            >
              Sisa: <strong>{remainingSlots}</strong>
            </span>
          </span>
        </button>
        <Button
          variant="secondary"
          size="sm"
          className="shrink-0 whitespace-nowrap"
          title="Edit slot fix (khusus superadmin)"
          onClick={onEdit}
        >
          🔒 Edit
        </Button>
      </div>

      {isOpen && (
        <DataTable headers={SLOT_TABLE_HEADERS} bordered={false}>
          {jabatanSlots.map((jabatanSlot) => {
            const jabatanKey = `${sbuName}::${jabatanSlot.jabatanName}`;
            return (
              <Fragment key={jabatanKey}>
                <JabatanSlotRow
                  jabatanSlot={jabatanSlot}
                  isOpen={openJabatanKeys.has(jabatanKey)}
                  onToggle={() => onToggleJabatan(jabatanKey)}
                />
              </Fragment>
            );
          })}
        </DataTable>
      )}
    </div>
  );
}

export default function SlotJabatanAccordion() {
  const dispatch = useDispatch();
  const { sbuSlots } = useSelector(selectSlotSummary);
  const isSuperadminAuthenticated = useSelector(
    (state) => state.ui.isSuperadminAuthenticated,
  );
  const [openSbuNames, setOpenSbuNames] = useState(() => new Set());
  const [openJabatanKeys, setOpenJabatanKeys] = useState(() => new Set());

  if (!sbuSlots.length) {
    return (
      <EmptyState
        icon="📊"
        title="Belum ada Slot Jabatan"
        description="Slot Jabatan per SBU akan otomatis terbentuk mengikuti jumlah karyawan pada file Excel yang pertama kali Anda upload."
      />
    );
  }

  const requestSlotEdit = (sbuName) => {
    const modalName = isSuperadminAuthenticated ? "editSlot" : "superadminAuth";
    dispatch(openModal({ name: modalName, payload: sbuName }));
  };

  return (
    <div className="flex flex-col gap-2.5">
      {sbuSlots.map((sbuSlot) => (
        <SbuSlotPanel
          key={sbuSlot.sbuName}
          sbuSlot={sbuSlot}
          isOpen={openSbuNames.has(sbuSlot.sbuName)}
          openJabatanKeys={openJabatanKeys}
          onToggle={() =>
            setOpenSbuNames((previous) =>
              toggleSetMember(previous, sbuSlot.sbuName),
            )
          }
          onToggleJabatan={(jabatanKey) =>
            setOpenJabatanKeys((previous) =>
              toggleSetMember(previous, jabatanKey),
            )
          }
          onEdit={() => requestSlotEdit(sbuSlot.sbuName)}
        />
      ))}
    </div>
  );
}
