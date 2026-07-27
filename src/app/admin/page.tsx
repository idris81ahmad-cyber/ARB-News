import type { Metadata } from 'next';
import { AdminDashboard } from '@/components/admin-dashboard';
import { isAdminConfigured } from '@/lib/source-control/auth';

export const metadata: Metadata = {
  title: 'Admin · Source control',
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  const configured = isAdminConfigured();
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <AdminDashboard configured={configured} />
    </div>
  );
}
