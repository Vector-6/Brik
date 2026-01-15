/**
 * Rewards Page
 * Main page component for the /rewards route
 */

import { Metadata } from 'next';
import RewardsPageClient from './RewardsPageClient';

export const metadata: Metadata = {
  title: 'Rewards - Brik',
  description: 'Earn points, cashback, and rewards for swapping on Brik',
  robots: {
    index: true,
    follow: true,
  },
};

export default function RewardsPage() {
  return <RewardsPageClient />;
}
