
'use client';

import React, { useMemo } from 'react';
import { Bar, BarChart, Pie, PieChart, Cell, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { eachMonthOfInterval, format, startOfYear, subMonths } from 'date-fns';
import type { ChartConfig } from "@/components/ui/chart";
import type { Bill } from '@/lib/types';

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

export function ReportsCharts({ bills }: { bills: Bill[] }) {
    const paidBillsByMonth = useMemo(() => {
        const months = eachMonthOfInterval({
            start: startOfYear(subMonths(new Date(), 5)),
            end: new Date()
        });

        const data = months.map(month => ({
            name: format(month, 'MMM'),
            total: 0
        }));
        
        bills.filter(b => b.isPaid).forEach(bill => {
            const monthIndex = new Date(bill.dueDate).getMonth();
            const year = new Date(bill.dueDate).getFullYear();
            const currentYear = new Date().getFullYear();
            if(year === currentYear) {
                const monthName = format(new Date(bill.dueDate), 'MMM');
                const targetMonth = data.find(d => d.name === monthName);
                if (targetMonth) {
                    targetMonth.total += bill.amount;
                }
            }
        });

        return data;
    }, [bills]);
    
    const spendingByCategory = useMemo(() => {
        const data: { [key: string]: number } = {};
        bills.filter(b => b.isPaid).forEach(bill => {
            if (!data[bill.category]) {
                data[bill.category] = 0;
            }
            data[bill.category] += bill.amount;
        });
        return Object.entries(data).map(([name, value]) => ({ name, value: Number(value.toFixed(2)) }));
    }, [bills]);

    const barChartConfig: ChartConfig = {
      total: { label: "Total Paid", color: "hsl(var(--chart-1))" },
    };

    const pieChartConfig = useMemo(() => {
        if (spendingByCategory.length === 0) return {};
        return spendingByCategory.reduce((acc, category, index) => {
            acc[category.name] = {
                label: category.name,
                color: COLORS[index % COLORS.length]
            };
            return acc;
        }, {} as ChartConfig);
    }, [spendingByCategory]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <Card>
                <CardHeader>
                    <CardTitle>Bills Paid Over Time</CardTitle>
                    <CardDescription>Last 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={barChartConfig} className="h-[300px] w-full">
                         <BarChart data={paidBillsByMonth} accessibilityLayer>
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <XAxis dataKey="name" tickLine={false} axisLine={false} />
                            <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `R${value}`} />
                            <Bar dataKey="total" fill="var(--color-total)" radius={4} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Spending by Category</CardTitle>
                    <CardDescription>Breakdown of paid bills by category</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center">
                    {spendingByCategory.length > 0 ? (
                        <ChartContainer config={pieChartConfig} className="h-[300px] w-full">
                            <PieChart>
                                <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                                <Pie data={spendingByCategory} dataKey="value" nameKey="name" innerRadius={60}>
                                    {spendingByCategory.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={pieChartConfig[entry.name]?.color} />
                                    ))}
                                </Pie>
                                <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                            </PieChart>
                        </ChartContainer>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                            No paid bills to display.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
