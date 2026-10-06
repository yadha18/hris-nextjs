"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Modal, { ModalActions } from "@/components/ui/Modal";

export default function ProofThumbnail({
  laptop,
  sizeClass = "h-10 w-10",
  emptyLabel = "—",
}) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  if (!laptop.BuktiBA)
    return <span className="text-[11px] text-fg-muted">{emptyLabel}</span>;

  return (
    <>
      <button
        type="button"
        title="Lihat gambar"
        onClick={() => setIsViewerOpen(true)}
        className="cursor-pointer"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={laptop.BuktiBA}
          alt="Bukti Berita Acara"
          className={`${sizeClass} rounded-md object-cover`}
        />
      </button>
      {isViewerOpen && (
        <Modal
          title={`${laptop.NamaPerangkat} — ${laptop.SerialNumber}`}
          onClose={() => setIsViewerOpen(false)}
          widthClass="max-w-[480px]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={laptop.BuktiBA}
            alt="Bukti Berita Acara"
            className="w-full rounded-[10px] border border-line"
          />
          <ModalActions>
            <Button variant="secondary" onClick={() => setIsViewerOpen(false)}>
              Tutup
            </Button>
          </ModalActions>
        </Modal>
      )}
    </>
  );
}
