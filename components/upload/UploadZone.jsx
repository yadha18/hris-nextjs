'use client';

import { useRef, useState } from 'react';

export default function UploadZone({ onFileSelected }) {
  const fileInputRef = useRef(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const selectFirstFile = (fileList) => {
    const file = fileList?.[0];
    if (file) onFileSelected(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDraggingOver(false);
    selectFirstFile(event.dataTransfer.files);
  };

  const handleInputChange = (event) => {
    selectFirstFile(event.target.files);
    event.target.value = ''; // supaya file yang sama bisa dipilih ulang
  };

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ') && fileInputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDraggingOver(true);
        }}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={handleDrop}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-7 text-center transition md:p-12 ${
          isDraggingOver ? 'border-accent bg-accent/5' : 'border-line-strong bg-surface2 hover:border-accent hover:bg-accent/5'
        }`}
      >
        <div className="mb-3 text-[40px]">📊</div>
        <h3 className="mb-1.5 text-base font-semibold">Klik untuk pilih file atau seret ke sini</h3>
        <p className="text-[13px] text-fg-muted">Format: .xlsx atau .xls · Maks 10 MB</p>
      </div>
      <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleInputChange} />
    </>
  );
}