import Button from '@/components/ui/Button';
import { Card, CardTitle } from '@/components/ui/Card';
import { UPLOAD_TYPES } from '@/lib/upload/uploadRegistry';
import { UPLOAD_TYPE_CONTENT } from './uploadTypeContent';

export default function UploadTypeSelector({ selectedType, onSelect }) {
  return (
    <Card>
      <CardTitle>🗂️ Jenis Data</CardTitle>
      <div className="flex flex-wrap gap-2.5">
        {Object.entries(UPLOAD_TYPES).map(([typeKey, { icon, label }]) => (
          <Button key={typeKey} variant={typeKey === selectedType ? 'primary' : 'secondary'} onClick={() => onSelect(typeKey)}>
            {icon} {label}
          </Button>
        ))}
      </div>
      <div className="mt-3 text-xs leading-relaxed text-fg-muted">{UPLOAD_TYPE_CONTENT[selectedType].description}</div>
    </Card>
  );
}