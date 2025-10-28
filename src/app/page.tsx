'use client';
import { AddBillSheet } from '@/components/add-bill-sheet';
import { DashboardOverview } from '@/components/dashboard-overview';
import { RecentBills } from '@/components/recent-bills';
import { Button } from '@/components/ui/button';
import { PlusCircle, Calendar } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { useAuth } from '@/components/auth-provider';
import { useBills } from '@/lib/firestore';
import { format } from 'date-fns';

export default function Home() {
  const { user } = useAuth();
  const { bills, loading, refetch } = useBills();
  
  if (!user) return null;

  // Get current month name for the section title
  const currentMonth = format(new Date(), 'MMMM yyyy');

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader title="Dashboard">
        <AddBillSheet onBillAdded={refetch}>
          <Button>
            <PlusCircle className="mr-2" />
            Add Bill
          </Button>
        </AddBillSheet>
      </PageHeader>
      <main className="flex-1 py-8 px-4 md:px-8">
        <DashboardOverview bills={bills} loading={loading} />
        <div className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5" />
              <h2 className="text-2xl font-bold font-headline">Bills for {currentMonth}</h2>
            </div>
            <RecentBills bills={bills} loading={loading} onBillUpdated={refetch} />
        </div>
      </main>
    </div>
  );
}