
'use client';
import { CalendarView } from "@/components/calendar-view";
import { PageHeader } from "@/components/page-header";
import { useBills } from "@/lib/firestore";
import { Loader2 } from "lucide-react";

export default function CalendarPage() {
    const { bills, loading } = useBills();

    return (
        <div className="flex flex-col min-h-screen">
            <PageHeader title="Bills Calendar" />
            <main className="flex-1 py-8 px-4 md:px-8">
                {loading ? (
                    <div className="flex h-64 w-full items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : (
                    <CalendarView bills={bills} />
                )}
            </main>
        </div>
    );
}
