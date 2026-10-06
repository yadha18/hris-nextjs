"use client";

import { Fragment, useState } from "react";
import DataTable, { Td } from "@/components/ui/DataTable";
import DisclosureArrow from "@/components/ui/DisclosureArrow";
import Pill from "@/components/ui/Pill";
import { LAPTOP_STATUS_VARIANTS } from "@/lib/config";
import { LAPTOP_COUNT_COLUMNS } from "@/lib/laptopService";
import { toggleSetMember } from "@/lib/utils";

const TABLE_HEADERS = [
  "",
  "SBU",
  ...LAPTOP_COUNT_COLUMNS.map(({ header }) => ({
    label: header,
    align: "center",
  })),
];
const DETAIL_COLUMN_SPAN = TABLE_HEADERS.length;

function CountCells({ counts }) {
  return LAPTOP_COUNT_COLUMNS.map(({ key, isBold, isMuted }) => (
    <Td
      key={key}
      className={`text-center font-mono text-xs ${isBold ? "font-semibold" : ""} ${isMuted ? "text-fg-muted" : ""}`}
    >
      {counts[key]}
    </Td>
  ));
}

function JabatanMembers({ members }) {
  return (
    <tr>
      <td colSpan={DETAIL_COLUMN_SPAN} className="bg-bg p-0">
        <div className="flex flex-col gap-1.5 pb-3.5 pl-12 pr-5 pt-2.5">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between gap-3 rounded-[7px] border border-line bg-surface px-3 py-[7px] text-[12.5px]"
            >
              <span>{member.NamaPengguna || "(tanpa nama)"}</span>
              <span className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-fg-muted">
                  {member.NIP || "-"}
                </span>
                <Pill variant={LAPTOP_STATUS_VARIANTS[member.Status] ?? "gray"}>
                  {member.Status || "Belum Diisi"}
                </Pill>
              </span>
            </div>
          ))}
        </div>
      </td>
    </tr>
  );
}

export default function LaptopSbuBreakdown({ sbuRows }) {
  const [openSbuNames, setOpenSbuNames] = useState(() => new Set());
  const [openJabatanKeys, setOpenJabatanKeys] = useState(() => new Set());

  return (
    <DataTable headers={TABLE_HEADERS} minWidthClass="min-w-[1000px]">
      {sbuRows.map(({ sbuName, counts, jabatanRows }) => {
        const isSbuOpen = openSbuNames.has(sbuName);
        return (
          <Fragment key={sbuName}>
            <tr
              className="cursor-pointer hover:bg-white/[0.03]"
              title="Klik untuk lihat breakdown per Jabatan"
              onClick={() =>
                setOpenSbuNames((previous) =>
                  toggleSetMember(previous, sbuName),
                )
              }
            >
              <Td className="w-[22px] text-center">
                <DisclosureArrow isOpen={isSbuOpen} />
              </Td>
              <Td className="font-medium">{sbuName}</Td>
              <CountCells counts={counts} />
            </tr>

            {isSbuOpen && !jabatanRows.length && (
              <tr>
                <td
                  colSpan={DETAIL_COLUMN_SPAN}
                  className="bg-surface2 px-3 py-2 text-xs text-fg-muted"
                >
                  Tidak ada data di SBU ini
                </td>
              </tr>
            )}

            {isSbuOpen &&
              jabatanRows.map(
                ({ jabatanName, counts: jabatanCounts, members }) => {
                  const jabatanKey = `${sbuName}::${jabatanName}`;
                  const isJabatanOpen = openJabatanKeys.has(jabatanKey);
                  return (
                    <Fragment key={jabatanKey}>
                      <tr
                        className="cursor-pointer bg-surface2 text-xs hover:bg-white/[0.03]"
                        title="Klik untuk lihat rincian nama karyawan"
                        onClick={() =>
                          setOpenJabatanKeys((previous) =>
                            toggleSetMember(previous, jabatanKey),
                          )
                        }
                      >
                        <Td />
                        <Td className="pl-[26px] text-fg-muted">
                          <DisclosureArrow
                            isOpen={isJabatanOpen}
                            sizeClass="mr-1.5 text-[9px]"
                          />
                          ↳ {jabatanName}
                        </Td>
                        <CountCells counts={jabatanCounts} />
                      </tr>
                      {isJabatanOpen && <JabatanMembers members={members} />}
                    </Fragment>
                  );
                },
              )}
          </Fragment>
        );
      })}
    </DataTable>
  );
}
