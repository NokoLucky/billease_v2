
"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { format } from 'date-fns';
import type { Bill } from "@/lib/types";
import { Skeleton } from "./ui/skeleton";
import { useProfile } from "@/lib/firestore";
import { Progress } from "./ui/progress";

type DashboardOverviewProps = {
  bills: Bill[];
  loading: boolean;
}

export function DashboardOverview({ bills, loading: billsLoading }: DashboardOverviewProps) {
  const { profile, loading: profileLoading } = useProfile();
  
  const upcomingBills = bills.filter(b => !b.isPaid && new Date(b.dueDate) >= new Date());
  const nextDueBill = upcomingBills.length > 0 ? upcomingBills.sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0] : null;
  const totalUpcoming = upcomingBills.reduce((acc, bill) => acc + bill.amount, 0);

  const totalPaid = bills.filter(b => b.isPaid).reduce((acc, bill) => acc + bill.amount, 0);
  
  const fundsAfterBills = (profile?.income || 0) - totalUpcoming;
  const savingsProgress = profile && profile.income > 0
    ? Math.max(0, Math.min(100, (fundsAfterBills / profile.income) * 100))
    : 0;
  
  const loading = billsLoading || profileLoading;

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Next Due Bill</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
        <Card>
           <CardHeader>
            <CardTitle>Savings Goal</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Next Due Bill</CardTitle>
        </CardHeader>
        <CardContent>
          {nextDueBill ? (
            <>
              <p className="text-2xl font-bold font-headline">R{nextDueBill.amount.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">{nextDueBill.name} - Due {format(new Date(nextDueBill.dueDate), 'PPP')}</p>
            </>
          ) : (
            <p className="text-muted-foreground">No upcoming bills!</p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Total Upcoming</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold font-headline">R{totalUpcoming.toFixed(2)}</p>
          <p className="text-sm text-muted-foreground">{upcomingBills.length} bills remaining</p>
        </CardContent>
      </Card>
      {/* <Card>
        <CardHeader>
            <CardTitle>Savings Goal Progress</CardTitle>
             <CardDescription>
                You've achieved R{profile && fundsAfterBills > profile.savingsGoal ? profile.savingsGoal.toFixed(2) : Math.max(0, fundsAfterBills - (profile?.income || 0) + (profile?.savingsGoal || 0)).toFixed(2) } of your R{profile ? profile.savingsGoal.toFixed(2) : '0.00'} goal.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Progress value={savingsProgress} className="h-4" />
            <p className="text-right text-sm text-muted-foreground mt-2">{savingsProgress.toFixed(0)}%</p>
        </CardContent>
      </Card> */}
    </div>
  );
}
