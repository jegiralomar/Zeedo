import { TeamManagementCenter } from '@/components/team/TeamManagementCenter';
import { Header } from '@/components/layout/Header';

export default function TeamPage() {
  return (
    <div>
      <Header
        title="Admin Team & Roles"
        subtitle="Manage administrative staff accounts, configure operational roles, and enforce security policies"
      />
      <div className="p-8">
        <TeamManagementCenter />
      </div>
    </div>
  );
}
