
'use client';

import React, { useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from './ui/switch';
import { useProfile } from '@/lib/firestore';
import { Form, FormControl, FormField, FormItem, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';

const settingsSchema = z.object({
  income: z.coerce.number().min(0, 'Income must be a positive number'),
  savingsGoal: z.coerce.number().min(0, 'Savings goal must be a positive number'),
  currency: z.string(),
  notifications: z.object({
    dueSoon: z.boolean(),
    paidConfirmation: z.boolean(),
    savingsTips: z.boolean(),
  })
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export function SettingsForm() {
    const { profile, loading, update } = useProfile();
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    
    const form = useForm<SettingsFormValues>({
        resolver: zodResolver(settingsSchema),
        defaultValues: {
            income: 25000,
            savingsGoal: 2500,
            currency: 'ZAR',
            notifications: {
                dueSoon: true,
                paidConfirmation: true,
                savingsTips: false,
            }
        }
    });

    useEffect(() => {
        if (profile) {
            form.reset({
                income: profile.income,
                savingsGoal: profile.savingsGoal,
                currency: profile.currency,
                notifications: profile.notifications || { dueSoon: true, paidConfirmation: true, savingsTips: false }
            });
        }
    }, [profile, form]);

    const onSubmit = (values: SettingsFormValues) => {
        startTransition(async () => {
            try {
                await update(values);
                toast({
                    title: 'Success!',
                    description: 'Your settings have been saved.',
                });
            } catch (error) {
                 toast({
                    variant: 'destructive',
                    title: 'Error saving settings',
                    description: 'There was a problem saving your settings. Please try again.',
                });
            }
        });
    };

    if (loading) {
        return (
            <div className="space-y-8">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-64 w-full" />
                <div className="flex justify-end">
                    <Skeleton className="h-10 w-32" />
                </div>
            </div>
        )
    }

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Financials</CardTitle>
                    <CardDescription>Set your income, savings goal, and currency.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <FormField
                        control={form.control}
                        name="income"
                        render={({ field }) => (
                            <FormItem>
                                <Label>Monthly Income</Label>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="savingsGoal"
                        render={({ field }) => (
                            <FormItem>
                                <Label>Monthly Savings Goal</Label>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="currency"
                        render={({ field }) => (
                            <FormItem>
                                <Label>Currency</Label>
                                 <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select currency" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="ZAR">ZAR - South African Rand</SelectItem>
                                        <SelectItem value="USD">USD - United States Dollar</SelectItem>
                                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                                        <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                                        <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>Manage your notification preferences.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField
                        control={form.control}
                        name="notifications.dueSoon"
                        render={({ field }) => (
                            <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                                <Label htmlFor="due-soon" className="font-medium">Bills Due Soon</Label>
                                <FormControl>
                                    <Switch
                                        id="due-soon"
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="notifications.paidConfirmation"
                        render={({ field }) => (
                            <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                                <Label htmlFor="bill-paid" className="font-medium">Bill Paid Confirmation</Label>
                                 <FormControl>
                                    <Switch
                                        id="bill-paid"
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="notifications.savingsTips"
                        render={({ field }) => (
                            <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                                <Label htmlFor="savings-tips" className="font-medium">Weekly Savings Tips</Label>
                                 <FormControl>
                                    <Switch
                                        id="savings-tips"
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Preferences
                </Button>
            </div>
        </form>
    </Form>
  );
}
