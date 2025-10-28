
'use client';
import { BillsTable } from "@/components/bills-table";
import { AddBillSheet } from "@/components/add-bill-sheet";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useBills } from "@/lib/firestore";
import Link from "next/link";

export default function BillsPage() {
    const { bills, loading, refetch } = useBills();

    return (
        <div className="flex flex-col min-h-screen">
            <PageHeader title="My Bills">
                 <div className="flex flex-col md:flex-row gap-2">
                     <Button variant="outline" asChild>
                        <Link href="/bills/import">
                            <FileText className="mr-2" />
                            Import from Notes
                        </Link>
                    </Button>
                    <AddBillSheet onBillAdded={refetch}>
                        <Button>
                            <PlusCircle className="mr-2" />
                            Add Bill
                        </Button>
                    </AddBillSheet>
                </div>
            </PageHeader>
            <main className="flex-1 py-8 px-4 md:px-8">
                <BillsTable bills={bills} loading={loading} onBillUpdated={refetch} />
            </main>
        </div>
    );
}
