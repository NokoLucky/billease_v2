
'use client';

import React, { useState, useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { format, isSameDay } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import type { Bill } from '@/lib/types';
import { cn } from '@/lib/utils';

export function CalendarView({ bills }: { bills: Bill[]}) {
    const [date, setDate] = useState<Date | undefined>(new Date());

    const billsByDate = useMemo(() => {
        const map = new Map<string, Bill[]>();
        bills.forEach(bill => {
            const day = format(new Date(bill.dueDate), 'yyyy-MM-dd');
            if (!map.has(day)) {
                map.set(day, []);
            }
            map.get(day)!.push(bill);
        });
        return map;
    }, [bills]);

    const selectedDayBills = date ? bills.filter(bill => isSameDay(new Date(bill.dueDate), date)) : [];
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="p-4"
                    classNames={{
                        day: cn("h-16 w-16 text-base"),
                        head_cell: "w-16",
                        caption_label: "text-xl font-headline",
                    }}
                    modifiers={{
                        due: Array.from(billsByDate.keys()).map(d => new Date(d + 'T12:00:00Z'))
                    }}
                    modifiersStyles={{
                        due: {
                            borderColor: 'hsl(var(--primary))',
                            color: 'hsl(var(--primary))',
                            borderWidth: '2px',
                        },
                    }}
                />
            </Card>

            <div className="space-y-4">
                <h2 className="text-2xl font-bold font-headline">
                    Bills due on {date ? format(date, 'MMM dd') : '...'}
                </h2>
                <Card>
                    <CardContent className="p-4">
                        {selectedDayBills.length > 0 ? (
                            <ul className="space-y-4">
                                {selectedDayBills.map(bill => (
                                    <li key={bill.id} className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold">{bill.name}</p>
                                            <Badge variant={bill.isPaid ? 'secondary' : 'outline'}>{bill.category}</Badge>
                                        </div>
                                        <p className="font-bold font-mono">R{bill.amount.toFixed(2)}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-muted-foreground">No bills due on this day.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
