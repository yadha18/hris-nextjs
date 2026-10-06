'use client';

import { useState } from 'react';
import { formatRupiah, parseNominal } from '@/lib/utils';
import { TextControl } from './FormField';

// Pemanggil memakai `key` berisi nilai terbaru agar draft ikut tersinkron bila nilai berubah dari luar
export default function CurrencyInput({ value, onCommit }) {
  const [draftText, setDraftText] = useState(formatRupiah(value));

  const commitDraft = () => {
    const parsedValue = Math.max(0, parseNominal(draftText));
    setDraftText(formatRupiah(parsedValue));
    if (parsedValue !== value) onCommit(parsedValue);
  };

  return (
    <TextControl
      type="text"
      inputMode="numeric"
      value={draftText}
      onChange={(event) => setDraftText(event.target.value)}
      onBlur={commitDraft}
      onKeyDown={(event) => event.key === 'Enter' && event.currentTarget.blur()}
      className="min-w-[130px] font-mono"
    />
  );
}