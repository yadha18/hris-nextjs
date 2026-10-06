import { createLogEntry } from "./models";

export function buildSlotChangeLogEntries(sbuName, previousSlots, nextSlots) {
  const jabatanNames = new Set([
    ...Object.keys(previousSlots),
    ...Object.keys(nextSlots),
  ]);

  return [...jabatanNames]
    .filter(
      (jabatanName) => previousSlots[jabatanName] !== nextSlots[jabatanName],
    )
    .map((jabatanName) =>
      createLogEntry({
        nip: "SLOT",
        name: sbuName,
        type: "slot jabatan",
        oldValue: `${jabatanName}: ${previousSlots[jabatanName] ?? "-"}`,
        newValue: `${jabatanName}: ${nextSlots[jabatanName] ?? "dihapus"}`,
        note: "Diubah oleh superadmin",
      }),
    );
}

export function buildSlotConfigFromEmployees(employees) {
  const slotConfig = {};
  employees.forEach(({ SBU, Jabatan }) => {
    if (!SBU || !Jabatan) return;
    slotConfig[SBU] ??= { total: 0, jabatan: {} };
    slotConfig[SBU].jabatan[Jabatan] =
      (slotConfig[SBU].jabatan[Jabatan] || 0) + 1;
    slotConfig[SBU].total += 1;
  });
  return slotConfig;
}
