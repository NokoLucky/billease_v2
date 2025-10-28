'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { categories } from '@/lib/mock-data';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from './ui/form';
import { useAuth } from './auth-provider';
import { addBill } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { BillCategory, BillInput } from '@/lib/types';
import { MobileDatePicker } from './mobile-date-picker';


const billSchema = z.object({
  name: z.string().min(1, 'Bill name is required'),
  amount: z.coerce.number().positive('Amount must be positive'),
  dueDate: z.date({ required_error: 'Due date is required' }),
  frequency: z.enum(['one-time', 'monthly', 'yearly']),
  category: z.string().min(1, 'Category is required'),
});

type BillFormValues = z.infer<typeof billSchema>;

export function AddBillSheet({ children, onBillAdded }: { children: React.ReactNode, onBillAdded: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const form = useForm<BillFormValues>({
    resolver: zodResolver(billSchema),
    defaultValues: {
      name: '',
      amount: 0,
      dueDate: undefined,
      frequency: 'monthly',
      category: '',
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: BillFormValues) => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to add a bill.',
      });
      return;
    }
    
    const billData: BillInput = {
        name: values.name,
        amount: values.amount,
        dueDate: values.dueDate,
        frequency: values.frequency,
        category: values.category as BillCategory,
        isPaid: false,
    };

    try {
      await addBill(user.uid, billData);
      toast({
        title: 'Success!',
        description: 'Your bill has been added.',
      });
      onBillAdded();
      form.reset();
      setIsOpen(false);
    } catch (error) {
        console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error adding bill',
        description: 'There was a problem saving your bill. Please try again.',
      });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add a New Bill</SheetTitle>
          <SheetDescription>
            Enter the details of your new bill below.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                 <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                             <Label>Name</Label>
                             <FormControl>
                                <Input placeholder="e.g., Netflix, Rent" {...field} />
                             </FormControl>
                             <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                        <FormItem>
                            <Label>Amount</Label>
                             <FormControl>
                               <Input type="number" placeholder="0.00" {...field} />
                             </FormControl>
                             <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <Label>Due Date</Label>
                      <MobileDatePicker
                        value={field.value}
                        onChange={field.onChange}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                    control={form.control}
                    name="frequency"
                    render={({ field }) => (
                         <FormItem>
                            <Label>Frequency</Label>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                 <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select frequency" />
                                    </SelectTrigger>
                                 </FormControl>
                                <SelectContent>
                                    <SelectItem value="one-time">One-time</SelectItem>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                    <SelectItem value="yearly">Yearly</SelectItem>
                                </SelectContent>
                            </Select>
                             <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                         <FormItem>
                            <Label>Category</Label>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                 <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                 </FormControl>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.name} value={cat.name}>{cat.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                             <FormMessage />
                        </FormItem>
                    )}
                />

                <SheetFooter>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Bill
                    </Button>
                </SheetFooter>
            </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
