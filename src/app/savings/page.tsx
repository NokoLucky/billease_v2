
'use client';

import { SavingsManager } from '@/components/savings-manager';
import { PageHeader } from '@/components/page-header';
import { useBills } from '@/lib/firestore';
import { Loader2 } from 'lucide-react';

export default function SavingsPage() {
    const { bills, loading } = useBills();

    return (
        <div className="flex flex-col min-h-screen">
            <PageHeader title="Savings Goals & Tips" />
            <main className="flex-1 py-8 px-4 md:px-8">
                 {loading ? (
                     <div className="flex h-64 w-full items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : (
                    <SavingsManager bills={bills} />
                )}
            </main>
        </div>
    );
}
