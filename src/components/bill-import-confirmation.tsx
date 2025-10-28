
'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from './auth-provider';
import { addBill } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { ParsedBill } from '@/ai/flows/import-bills-flow';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { format } from 'date-fns';
import { categories } from '@/lib/mock-data';

type BillImportConfirmationProps = {
  bills: ParsedBill[];
  onCancel: () => void;
};

export function BillImportConfirmation({ bills, onCancel }: BillImportConfirmationProps) {
  const [selectedBills, setSelectedBills] = useState<ParsedBill[]>(bills);
  const [isPending, startTransition] = useTransition();
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleToggleBill = (bill: ParsedBill, checked: boolean) => {
    if (checked) {
      setSelectedBills((prev) => [...prev, bill]);
    } else {
      setSelectedBills((prev) => prev.filter((b) => b.name !== bill.name && b.amount !== bill.amount));
    }
  };

  const handleImport = () => {
    if (!user) {
      toast({ variant: 'destructive', title: 'You must be logged in.' });
      return;
    }
    if (selectedBills.length === 0) {
      toast({ variant: 'destructive', title: 'No bills selected.' });
      return;
    }

    startTransition(async () => {
      let successCount = 0;
      let errorCount = 0;

      for (const bill of selectedBills) {
        try {
          const dueDate = new Date(bill.dueDate);
          if (isNaN(dueDate.getTime())) {
            throw new Error(`Invalid date for bill: ${bill.name}`);
          }
          await addBill(user.uid, {
            ...bill,
            dueDate: dueDate,
            isPaid: false, // Always import as unpaid
          });
          successCount++;
        } catch (error) {
          console.error(`Failed to import bill: ${bill.name}`, error);
          errorCount++;
        }
      }

      toast({
        title: 'Import Complete',
        description: `${successCount} bills imported successfully. ${errorCount > 0 ? `${errorCount} failed.` : ''}`,
      });
      router.push('/bills');
    });
  };

  const getCategoryIcon = (categoryName: string) => {
    const category = categories.find(c => c.name === categoryName);
    return category ? <category.icon className="w-5 h-5 text-muted-foreground" /> : null;
  }

  return (
    <div className="flex flex-col min-h-screen">
       <div className="flex-1 py-8 px-4 md:px-8 flex items-start justify-center">
        <Card className="w-full max-w-3xl">
          <CardHeader>
            <CardTitle>Confirm Your Bills</CardTitle>
            <CardDescription>
              We've extracted the following bills from your notes. Please review and uncheck any you don't want to import.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {bills.length === 0 ? (
                 <Alert>
                    <AlertTitle>No Bills Found</AlertTitle>
                    <AlertDescription>
                        We couldn't parse any bills from your notes. Please try again.
                    </AlertDescription>
                </Alert>
            ) : (
                <div className="space-y-4">
                    {bills.map((bill, index) => (
                        <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                           <Checkbox
                                id={`bill-${index}`}
                                checked={selectedBills.some(b => b.name === bill.name && b.amount === bill.amount)}
                                onCheckedChange={(checked) => handleToggleBill(bill, !!checked)}
                                className="w-5 h-5"
                           />
                           <label htmlFor={`bill-${index}`} className="flex-1 grid grid-cols-2 md:grid-cols-4 items-center gap-4 cursor-pointer">
                                <span className="font-semibold truncate">{bill.name}</span>
                               <span className="font-mono text-right md:text-left">R{bill.amount.toFixed(2)}</span>
                               <span>{format(new Date(bill.dueDate), 'PPP')}</span>
                               <span className="flex items-center gap-2">
                                   {getCategoryIcon(bill.category)}
                                   {bill.category}
                               </span>
                           </label>
                        </div>
                    ))}
                </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
             <Button variant="outline" onClick={onCancel} disabled={isPending}>
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={isPending || selectedBills.length === 0}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Import {selectedBills.length} {selectedBills.length === 1 ? 'Bill' : 'Bills'}
            </Button>
          </CardFooter>
        </Card>
       </div>
    </div>
  );
}
