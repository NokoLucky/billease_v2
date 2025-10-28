
'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
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
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from './ui/form';
import { useAuth } from './auth-provider';
import { updateBill } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Bill, BillCategory } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from './ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const billSchema = z.object({
  name: z.string().min(1, 'Bill name is required'),
  amount: z.coerce.number().positive('Amount must be positive'),
  dueDate: z.date({ required_error: 'Due date is required' }),
  frequency: z.enum(['one-time', 'monthly', 'yearly']),
  category: z.string().min(1, 'Category is required'),
});

type BillFormValues = z.infer<typeof billSchema>;

type EditBillSheetProps = {
    bill: Bill;
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onBillUpdated: () => void;
}

export function EditBillSheet({ bill, isOpen, onOpenChange, onBillUpdated }: EditBillSheetProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const form = useForm<BillFormValues>({
    resolver: zodResolver(billSchema),
    defaultValues: {
      name: bill.name,
      amount: bill.amount,
      dueDate: new Date(bill.dueDate),
      frequency: bill.frequency,
      category: bill.category,
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: BillFormValues) => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to update a bill.',
      });
      return;
    }
    
    const billData = {
        name: values.name,
        amount: values.amount,
        dueDate: values.dueDate,
        frequency: values.frequency,
        category: values.category as BillCategory,
    };

    try {
      await updateBill(user.uid, bill.id, billData);
      toast({
        title: 'Success!',
        description: 'Your bill has been updated.',
      });
      onBillUpdated();
    } catch (error) {
        console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error updating bill',
        description: 'There was a problem saving your bill. Please try again.',
      });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Bill</SheetTitle>
          <SheetDescription>
            Update the details of your bill below.
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
                        <FormItem className='flex flex-col'>
                            <Label>Due Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full pl-3 text-left font-normal",
                                            !field.value && "text-muted-foreground"
                                        )}
                                        >
                                        {field.value ? (
                                            format(field.value, "PPP")
                                        ) : (
                                            <span>Pick a date</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) =>
                                            date < new Date("1900-01-01")
                                        }
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
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
                        Save Changes
                    </Button>
                </SheetFooter>
            </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

