'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { Card, CardTitle } from '@/components/ui/Card';
import { FormField, SelectControl } from '@/components/ui/FormField';
import { DEFAULT_SBU, EMPLOYEE_STATUS_OPTIONS } from '@/lib/config';
import useEmployeeExport from '@/hooks/useEmployeeExport';

export default function EmployeeExportPanel() {
  const exportEmployees = useEmployeeExport();
  const [selectedSbu, setSelectedSbu] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  return (
    <Card className="bg-surface2">
      <CardTitle>⬇ Download Data per SBU / Tipe Karyawan</CardTitle>
      <div className="flex flex-col gap-2.5 md:flex-row md:items-end">
        <FormField label="SBU" className="mb-0 md:max-w-[260px]">
          <SelectControl placeholder="Semua SBU" options={DEFAULT_SBU} value={selectedSbu} onChange={(event) => setSelectedSbu(event.target.value)} />
        </FormField>
        <FormField label="Tipe Karyawan" className="mb-0 md:max-w-[200px]">
          <SelectControl placeholder="Semua Status" options={EMPLOYEE_STATUS_OPTIONS} value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)} />
        </FormField>
        <Button variant="success" onClick={() => exportEmployees({ sbu: selectedSbu, status: selectedStatus })}>⬇ Unduh Excel</Button>
      </div>
    </Card>
  );
}