"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import Button from "@/components/ui/Button";
import { FormField, TextControl } from "@/components/ui/FormField";
import InfoNote from "@/components/ui/InfoNote";
import Modal, { ModalActions } from "@/components/ui/Modal";
import {
  closeModal,
  grantSuperadminAccess,
  openModal,
  showToast,
} from "@/store/slices/uiSlice";

export default function SuperadminAuthModal({ pendingSbuName }) {
  const dispatch = useDispatch();
  const [password, setPassword] = useState("");
  const [hasWrongPassword, setHasWrongPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = async () => {
    setIsVerifying(true);
    try {
      const response = await fetch("/api/superadmin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (response.status === 401) {
        setHasWrongPassword(true);
        setPassword("");
        return;
      }
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      dispatch(grantSuperadminAccess());
      dispatch(showToast("🔓 Akses superadmin diberikan untuk sesi ini"));
      dispatch(openModal({ name: "editSlot", payload: pendingSbuName }));
    } catch {
      dispatch(
        showToast(
          "❌ Gagal memverifikasi password. Periksa koneksi atau konfigurasi server.",
          5000,
        ),
      );
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Modal
      title="🔒 Verifikasi Superadmin"
      onClose={() => dispatch(closeModal())}
      widthClass="max-w-[400px]"
    >
      <InfoNote>
        ℹ️ Mengedit slot fix jabatan memerlukan akses superadmin. Masukkan
        password untuk melanjutkan.
      </InfoNote>
      <FormField label="Password Superadmin">
        <TextControl
          type="password"
          autoFocus
          placeholder="••••••••"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && handleSubmit()}
        />
        {hasWrongPassword && (
          <div className="mt-2 text-xs text-danger">
            ❌ Password salah. Coba lagi.
          </div>
        )}
      </FormField>
      <ModalActions>
        <Button variant="secondary" onClick={() => dispatch(closeModal())}>
          Batal
        </Button>
        <Button disabled={isVerifying} onClick={handleSubmit}>
          {isVerifying ? "Memeriksa..." : "🔓 Verifikasi"}
        </Button>
      </ModalActions>
    </Modal>
  );
}
