"use client";

import Button from "@/components/ui/Button";
import Modal, { ModalActions } from "@/components/ui/Modal";
import { getTrackingDocumentUrl } from "@/lib/trackingDocuments";

export function DownloadLink({ documentInfo }) {
  return (
    <a
      href={getTrackingDocumentUrl(documentInfo.fileId, { download: true })}
      download={documentInfo.fileName}
      className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-line-strong bg-surface2 px-2.5 py-[5px] text-xs font-medium transition hover:border-accent hover:text-accent-light"
    >
      ⬇ Unduh
    </a>
  );
}

export default function DocumentPreviewModal({ documentInfo, onClose }) {
  const documentUrl = getTrackingDocumentUrl(documentInfo.fileId);
  const isPdf = documentInfo.contentType === "application/pdf";

  return (
    <Modal
      title={`📎 ${documentInfo.fileName}`}
      onClose={onClose}
      widthClass="max-w-[900px]"
    >
      {isPdf ? (
        <iframe
          src={documentUrl}
          title={documentInfo.fileName}
          className="h-[70vh] w-full rounded-lg border border-line bg-white"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={documentUrl}
          alt={documentInfo.fileName}
          className="mx-auto max-h-[70vh] max-w-full rounded-lg border border-line object-contain"
        />
      )}

      <p className="mt-2.5 text-[11px] text-fg-muted">
        Pratinjau tidak tampil di HP atau browser tertentu?{" "}
        <a
          href={documentUrl}
          target="_blank"
          rel="noreferrer"
          className="text-accent-light"
        >
          Buka di tab baru
        </a>{" "}
        atau gunakan Unduh.
      </p>

      <ModalActions>
        <DownloadLink documentInfo={documentInfo} />
        <Button variant="secondary" onClick={onClose}>
          Tutup
        </Button>
      </ModalActions>
    </Modal>
  );
}
