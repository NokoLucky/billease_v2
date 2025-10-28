
'use client';

import React, { useState, useMemo, useTransition } from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { categories } from '@/lib/mock-data';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from './ui/button';
import { ArrowUpDown, MoreHorizontal, Loader2, Trash2, Pencil } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Bill } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useAuth } from './auth-provider';
import { updateBill, deleteBill } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Skeleton } from './ui/skeleton';
import { EditBillSheet } from './edit-bill-sheet';

type BillsTableProps = {
    bills: Bill[];
    loading: boolean;
    onBillUpdated: () => void;
}

export function BillsTable({ bills, loading, onBillUpdated }: BillsTableProps) {
    const [filter, setFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [sortConfig, setSortConfig] = useState<{ key: keyof Bill, direction: 'asc' | 'desc' } | null>({ key: 'dueDate', direction: 'asc' });
    const { user } = useAuth();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const [editingBill, setEditingBill] = useState<Bill | null>(null);

    const handleSort = (key: keyof Bill) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedBills = useMemo(() => {
        let sortableItems = [...bills];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [bills, sortConfig]);

    const filteredBills = useMemo(() => {
        return sortedBills.filter(bill => {
            const nameMatch = bill.name.toLowerCase().includes(filter.toLowerCase());
            const categoryMatch = categoryFilter === 'All' || bill.category === categoryFilter;
            return nameMatch && categoryMatch;
        });
    }, [sortedBills, filter, categoryFilter]);
    
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

    const handleDeleteBill = (billId: string) => {
         if (!user) return;
        startTransition(async () => {
            try {
                await deleteBill(user.uid, billId);
                onBillUpdated();
                toast({ title: 'Success', description: 'Bill deleted successfully.' });
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete bill.' });
            }
        });
    }
    
    const getCategoryIcon = (categoryName: string) => {
        const category = categories.find(c => c.name === categoryName);
        return category ? <category.icon className="w-5 h-5 mr-2" /> : null;
    }

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="flex flex-col md:flex-row items-center gap-4 py-4">
                    <Skeleton className="h-10 w-full md:max-w-sm" />
                    <Skeleton className="h-10 w-full md:w-[180px]" />
                </div>
                <Skeleton className="h-64 w-full" />
            </div>
        )
    }

  return (
    <>
    <div className="w-full">
        <div className="flex flex-col md:flex-row items-center gap-4 py-4">
            <Input
                placeholder="Filter bills by name..."
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                className="w-full md:max-w-sm"
                disabled={isPending}
            />
            <Select value={categoryFilter} onValueChange={setCategoryFilter} disabled={isPending}>
                <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="All">All Categories</SelectItem>
                    {categories.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
                </SelectContent>
            </Select>
            {isPending && <Loader2 className="h-5 w-5 animate-spin" />}
        </div>
        
        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
            {filteredBills.map(bill => (
                 <Card key={bill.id} data-state={bill.isPaid ? "selected" : ""}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg">{bill.name}</CardTitle>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleTogglePaid(bill)}>
                                    {bill.isPaid ? 'Mark as Unpaid' : 'Mark as Paid'}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setEditingBill(bill)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit Bill
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                                             <Trash2 className="mr-2 h-4 w-4"/>
                                            Delete
                                        </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete the bill for {bill.name}.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction className='bg-destructive hover:bg-destructive/90' onClick={() => handleDeleteBill(bill.id)}>Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-center mb-4">
                             <Badge variant={bill.isPaid ? 'secondary' : 'destructive'}>
                                {bill.isPaid ? 'Paid' : 'Due'}
                            </Badge>
                             <p className="font-bold font-mono text-lg">R{bill.amount.toFixed(2)}</p>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-2">
                             <div className="flex items-center">
                                {getCategoryIcon(bill.category)}
                                {bill.category}
                            </div>
                            <p>Due: {format(new Date(bill.dueDate), 'MMM dd, yyyy')}</p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>

        {/* Desktop Table View */}
        <Card className="hidden md:block">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Status</TableHead>
                        <TableHead>
                            <Button variant="ghost" onClick={() => handleSort('name')} disabled={isPending}>
                                Bill
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
                        </TableHead>
                        <TableHead>
                            <Button variant="ghost" onClick={() => handleSort('category')} disabled={isPending}>
                                Category
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
                        </TableHead>
                        <TableHead className="text-right">
                             <Button variant="ghost" onClick={() => handleSort('amount')} disabled={isPending}>
                                Amount
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
                        </TableHead>
                        <TableHead>
                             <Button variant="ghost" onClick={() => handleSort('dueDate')} disabled={isPending}>
                                Due Date
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
                        </TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredBills.map(bill => (
                        <TableRow key={bill.id} data-state={bill.isPaid ? "selected" : ""}>
                            <TableCell>
                                <Badge variant={bill.isPaid ? 'secondary' : 'destructive'}>
                                    {bill.isPaid ? 'Paid' : 'Due'}
                                </Badge>
                            </TableCell>
                            <TableCell className="font-medium">{bill.name}</TableCell>
                            <TableCell>
                                <div className="flex items-center">
                                    {getCategoryIcon(bill.category)}
                                    {bill.category}
                                </div>
                            </TableCell>
                            <TableCell className="text-right font-mono">R{bill.amount.toFixed(2)}</TableCell>
                            <TableCell>{format(new Date(bill.dueDate), 'MMM dd, yyyy')}</TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
                                        <span className="sr-only">Open menu</span>
                                        <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => handleTogglePaid(bill)}>
                                            {bill.isPaid ? 'Mark as Unpaid' : 'Mark as Paid'}
                                        </DropdownMenuItem>
                                         <DropdownMenuItem onClick={() => setEditingBill(bill)}>
                                            <Pencil className="mr-2 h-4 w-4" />
                                            Edit Bill
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                                                    <Trash2 className="mr-2 h-4 w-4"/>
                                                    Delete
                                                </DropdownMenuItem>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the bill for {bill.name}.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction className='bg-destructive hover:bg-destructive/90' onClick={() => handleDeleteBill(bill.id)}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
        {filteredBills.length === 0 && !loading && (
            <div className="text-center text-muted-foreground pt-8">
                You have no bills. Add one to get started!
            </div>
        )}
    </div>
    {editingBill && (
        <EditBillSheet 
            bill={editingBill}
            isOpen={!!editingBill}
            onOpenChange={(open) => !open && setEditingBill(null)}
            onBillUpdated={() => {
                setEditingBill(null);
                onBillUpdated();
            }}
        />
    )}
    </>
  );
}
