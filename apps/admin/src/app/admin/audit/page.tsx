import { AuditLogCenter } from '@/components/audit/AuditLogCenter';
import { Header } from '@/components/layout/Header';

export default function AuditPage() {
  return (
    <div>
      <Header
        title="Audit Trail Logs"
        subtitle="Immutable security logs, administrative operation records, and payload diffs"
      />
      <div className="p-8">
        <AuditLogCenter />
      </div>
    </div>
  );
}
