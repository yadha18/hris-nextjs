"use client";

import { useSelector } from "react-redux";
import CheckNewNipModal from "./CheckNewNipModal";
import ConfirmDeleteEmployeeModal from "./ConfirmDeleteEmployeeModal";
import DeleteAllEmployeesModal from "./DeleteAllEmployeesModal";
import EditEmployeeModal from "./EditEmployeeModal";
import EditSlotModal from "./EditSlotModal";
import EmployeeDetailModal from "./EmployeeDetailModal";
import StatusListModal from "./StatusListModal";
import SuperadminAuthModal from "./SuperadminAuthModal";
import EditLemburModal from "./EditLemburModal";
import ConfirmDeleteLemburModal from "./ConfirmDeleteLemburModal";
import DeleteAllLemburModal from "./DeleteAllLemburModal";
import EditLaptopModal from "./EditLaptopModal";
import ConfirmDeleteLaptopModal from "./ConfirmDeleteLaptopModal";
import DeleteAllLaptopsModal from "./DeleteAllLaptopsModal";
import LaptopHistoryModal from "./LaptopHistoryModal";
import ConfirmDeleteListItemModal from "./ConfirmDeleteListItemModal";

export default function ModalRoot() {
  const activeModal = useSelector((state) => state.ui.activeModal);
  if (!activeModal) return null;

  const { name, payload } = activeModal;
  // key memastikan state form di dalam modal ter-reset setiap kali modal dibuka ulang
  const modalKey = `${name}-${JSON.stringify(payload ?? null)}`;

  switch (name) {
    case "editEmployee":
      return <EditEmployeeModal key={modalKey} employeeId={payload} />;
    case "employeeDetail":
      return <EmployeeDetailModal key={modalKey} employeeId={payload} />;
    case "confirmDeleteEmployee":
      return <ConfirmDeleteEmployeeModal key={modalKey} employeeId={payload} />;
    case "deleteAllEmployees":
      return <DeleteAllEmployeesModal key={modalKey} />;
    case "checkNewNip":
      return <CheckNewNipModal key={modalKey} />;
    case "statusList":
      return <StatusListModal key={modalKey} status={payload} />;
    case "superadminAuth":
      return <SuperadminAuthModal key={modalKey} pendingSbuName={payload} />;
    case "editSlot":
      return <EditSlotModal key={modalKey} sbuName={payload} />;
    case "editLembur":
      return <EditLemburModal key={modalKey} entryId={payload} />;
    case "confirmDeleteLembur":
      return <ConfirmDeleteLemburModal key={modalKey} entryId={payload} />;
    case "deleteAllLembur":
      return <DeleteAllLemburModal key={modalKey} />;
    case "editLaptop":
      return (
        <EditLaptopModal
          key={modalKey}
          entryId={payload.entryId}
          prefillNip={payload.prefillNip}
        />
      );
    case "confirmDeleteLaptop":
      return <ConfirmDeleteLaptopModal key={modalKey} entryId={payload} />;
    case "deleteAllLaptops":
      return <DeleteAllLaptopsModal key={modalKey} />;
    case "laptopHistory":
      return <LaptopHistoryModal key={modalKey} nip={payload} />;
    case "confirmDeleteListItem":
      return (
        <ConfirmDeleteListItemModal
          key={modalKey}
          listKey={payload.listKey}
          name={payload.name}
        />
      );
    default:
      return null;
  }
}
