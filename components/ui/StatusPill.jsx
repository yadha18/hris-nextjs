import { STATUS_DEFINITIONS } from '@/lib/config';
import Pill from './Pill';

export default function StatusPill({ status }) {
  const definition = STATUS_DEFINITIONS[status] ?? { variant: 'gray', label: status || '—' };
  return <Pill variant={definition.variant}>{definition.label}</Pill>;
}