const DOCUMENTS_ENDPOINT = "/api/documents";

export const getTrackingDocumentUrl = (fileId) =>
  `${DOCUMENTS_ENDPOINT}/${fileId}`;

export async function uploadTrackingDocument(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(DOCUMENTS_ENDPOINT, {
    method: "POST",
    body: formData,
  });
  if (response.status === 413)
    throw new Error("Ukuran file terlalu besar untuk diterima server.");

  const result = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(
      result.message || `Gagal mengupload dokumen (HTTP ${response.status})`,
    );

  const { fileId, fileName, fileSize, contentType } = result;
  return { fileId, fileName, fileSize, contentType };
}

// Pembersihan berjalan di latar belakang; kegagalan tidak boleh mengganggu alur utama
export const deleteTrackingDocument = (fileId) =>
  fetch(getTrackingDocumentUrl(fileId), { method: "DELETE" }).catch(() => {});
