import type { Metadata } from 'next';
import AdminDashboard from '../../../components/features/admin/AdminDashboard';
import AdminProtectedRoute from '../../../components/features/admin/AdminProtectedRoute';

export const metadata: Metadata = {
  title: 'Admin Dashboard - Brik',
  description: 'Manage tokens and platform settings',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminDashboardPage() {
  return (
    <AdminProtectedRoute>
      <main className="min-h-screen bg-gradient-to-br pt-24 from-[#1C1C1C] via-[#1A1A24] to-[#1C1C1C]">
        <AdminDashboard />
      </main>
    </AdminProtectedRoute>
  );
}
