
'use client';
import { ReportsCharts } from "@/components/reports-charts";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useBills } from "@/lib/firestore";
import type { Bill } from "@/lib/types";

export default function ReportsPage() {
    const { bills, loading } = useBills();

    const handleExportCSV = () => {
        if (!bills || bills.length === 0) {
            alert("No bills to export.");
            return;
        }

        const headers = ["ID", "Name", "Amount", "Due Date", "Category", "Status", "Frequency"];
        const csvContent = [
            headers.join(','),
            ...bills.map(bill => [
                bill.id,
                `"${bill.name.replace(/"/g, '""')}"`, // Handle quotes in names
                bill.amount,
                new Date(bill.dueDate).toLocaleDateString(),
                bill.category,
                bill.isPaid ? 'Paid' : 'Unpaid',
                bill.frequency
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "bills_export.csv");
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <PageHeader title="Reports & History">
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={handleExportCSV} disabled={loading || bills.length === 0}>
                        <Download className="mr-2" />
                        Export CSV
                    </Button>
                    <Button variant="outline">
                        <Download className="mr-2" />
                        Export PDF
                    </Button>
                </div>
            </PageHeader>
            <main className="flex-1 py-8 px-4 md:px-8">
                {loading ? (
                     <div className="flex h-64 w-full items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : (
                    <ReportsCharts bills={bills} />
                )}
            </main>
        </div>
    );
}
