import type { Metadata } from 'next';
import AdminLogin from '@/components/features/admin/AdminLogin';

export const metadata: Metadata = {
  title: 'Admin Login - Brik',
  description: 'Admin panel login for Brik platform',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#1C1C1C] via-[#1A1A24] to-[#1C1C1C] flex items-center justify-center p-4">
      <AdminLogin />
    </main>
  );
}
