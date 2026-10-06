'use client';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Card, CardTitle } from '@/components/ui/Card';
import PageHeader from '@/components/ui/PageHeader';
import { MAX_UPLOAD_FILE_SIZE_MB } from '@/lib/config';
import { parseUploadFile } from '@/lib/excel';
import { UPLOAD_TYPES } from '@/lib/upload/uploadRegistry';
import { confirmUpload } from '@/store/hrisActions';
import { showToast } from '@/store/slices/uiSlice';
import UploadPreview from './UploadPreview';
import UploadTypeSelector from './UploadTypeSelector';
import UploadZone from './UploadZone';

export default function UploadPage() {
  const dispatch = useDispatch();
  const [uploadType, setUploadType] = useState('karyawan');
  const [previewRows, setPreviewRows] = useState(null);

  const handleTypeChange = (nextUploadType) => {
    setUploadType(nextUploadType);
    setPreviewRows(null);
  };

  const handleFileSelected = async (file) => {
    if (file.size > MAX_UPLOAD_FILE_SIZE_MB * 1024 * 1024) {
      return dispatch(showToast(`❌ Ukuran file melebihi ${MAX_UPLOAD_FILE_SIZE_MB} MB!`));
    }

    try {
      const rows = await parseUploadFile(file, UPLOAD_TYPES[uploadType]);
      if (!rows.length) {
        setPreviewRows(null);
        return dispatch(showToast('❌ Tidak ada baris data yang dapat dibaca. Periksa nama kolom pada baris pertama.', 5000));
      }
      setPreviewRows(rows);
      dispatch(showToast(`✅ Berhasil membaca ${rows.length} baris data`));
    } catch {
      dispatch(showToast('❌ Gagal membaca file. Pastikan formatnya .xlsx / .xls yang valid.', 5000));
    }
  };

  const handleCancel = () => {
    setPreviewRows(null);
    dispatch(showToast('ℹ️ Review upload dibatalkan'));
  };

  const handleConfirm = () => {
    dispatch(confirmUpload({ uploadType, rows: previewRows }));
    setPreviewRows(null);
  };

  return (
    <>
      <PageHeader
        title="Upload Data"
        description="Pilih jenis data yang ingin diupload, lalu pilih file Excel (.xlsx / .xls). Maks 10 MB."
      />
      <UploadTypeSelector selectedType={uploadType} onSelect={handleTypeChange} />
      <Card>
        <CardTitle>📂 Pilih File Excel</CardTitle>
        <UploadZone onFileSelected={handleFileSelected} />
      </Card>
      {previewRows && (
        <UploadPreview uploadType={uploadType} rows={previewRows} onCancel={handleCancel} onConfirm={handleConfirm} />
      )}
    </>
  );
}