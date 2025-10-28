"use client";
import React, { useTransition } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { categories } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { format, isThisMonth, parseISO } from 'date-fns';
import type { Bill } from '@/lib/types';
import { useAuth } from './auth-provider';
import { updateBill } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';

type RecentBillsProps = {
    bills: Bill[];
    loading: boolean;
    onBillUpdated: () => void;
}

export function RecentBills({ bills, loading, onBillUpdated }: RecentBillsProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    // Filter bills for current month only and sort by due date (ascending)
    const currentMonthBills = bills
        .filter(bill => isThisMonth(parseISO(bill.dueDate)))
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    const handleTogglePaid = (bill: Bill) => {
        if (!user) return;
        startTransition(async () => {
            try {
                await updateBill(user.uid, bill.id, { isPaid: !bill.isPaid });
                onBillUpdated();
                toast({ title: 'Success', description: `${bill.name} marked as ${!bill.isPaid ? 'paid' : 'unpaid'}.` });
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to update bill status.' });
            }
        });
    };

    const getCategoryIcon = (categoryName: string) => {
        const category = categories.find(c => c.name === categoryName);
        return category ? <category.icon className="w-5 h-5" /> : null;
    }
    
    if (loading) {
        return (
             <Card>
                <CardContent className="p-0">
                    <div className="divide-y divide-border">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex items-center gap-4 p-4">
                                <Skeleton className="h-10 w-10 rounded-lg" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                                <div className="text-right space-y-2">
                                   <Skeleton className="h-6 w-20" />
                                </div>
                                <div className="pl-4">
                                    <Skeleton className="h-6 w-6" />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (currentMonthBills.length === 0 && !loading) {
        return (
            <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                    No bills due this month. You're all caught up! 🎉
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardContent className="p-0">
                <div className="divide-y divide-border">
                {currentMonthBills.map(bill => (
                    <div key={bill.id} className={cn("flex items-center gap-4 p-4 transition-all duration-300", bill.isPaid && "bg-secondary/50")}>
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary text-secondary-foreground">
                            {getCategoryIcon(bill.category)}
                        </div>
                        <div className="flex-1">
                            <p className={cn("font-semibold", bill.isPaid && "line-through text-muted-foreground")}>{bill.name}</p>
                            <p className="text-sm text-muted-foreground">Due {format(new Date(bill.dueDate), 'MMM dd, yyyy')}</p>
                        </div>
                        <div className="text-right">
                           <p className={cn("font-bold text-lg", bill.isPaid && "line-through text-muted-foreground")}>R{bill.amount.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center pl-4">
                            <Checkbox 
                                id={`paid-${bill.id}`} 
                                checked={bill.isPaid} 
                                onCheckedChange={() => handleTogglePaid(bill)} 
                                className="w-6 h-6" 
                                disabled={isPending}
                            />
                            <label htmlFor={`paid-${bill.id}`} className="sr-only">
                                Mark {bill.name} as {bill.isPaid ? 'unpaid' : 'paid'}
                            </label>
                        </div>
                    </div>
                ))}
                </div>
            </CardContent>
        </Card>
    )
}