import React from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonRefresher, IonRefresherContent, IonSkeletonText,
  IonList, IonItem, IonLabel,
} from '@ionic/react';
import { useBills, useProfile } from '../lib/firestore';

const SavingsPage: React.FC = () => {
  const { bills, loading: billsLoading, refetch: refetchBills } = useBills();
  const { profile, loading: profileLoading, refetch: refetchProfile } = useProfile();
  const loading = billsLoading || profileLoading;

  const handleRefresh = async (e: CustomEvent) => {
    await Promise.all([refetchBills(), refetchProfile()]);
    (e.target as HTMLIonRefresherElement).complete();
  };

  const income = profile?.income ?? 0;
  const savingsGoal = profile?.savingsGoal ?? 0;
  const fmt = (n: number) => `R ${n.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`;

  const totalBills = bills.reduce((s, b) => s + b.amount, 0);
  const paidBills = bills.filter(b => b.isPaid);
  const totalPaid = paidBills.reduce((s, b) => s + b.amount, 0);
  const remainingAfterBills = income - totalBills;
  const savingsAfterGoal = remainingAfterBills - savingsGoal;
  const savingsProgress = savingsGoal > 0 ? Math.min((remainingAfterBills / savingsGoal) * 100, 100) : 0;
  const progressPct = totalBills > 0 ? (totalPaid / totalBills) * 100 : 0;

  const sectionLabel = (text: string) => (
    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ion-color-medium)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '16px 16px 6px' }}>
      {text}
    </div>
  );

  if (loading) return (
    <IonPage>
      <IonHeader><IonToolbar><IonTitle>Savings</IonTitle></IonToolbar></IonHeader>
      <IonContent>
        <div style={{ padding: 16 }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="stat-card" style={{ marginBottom: 12 }}>
              <IonSkeletonText animated style={{ width: '50%', height: 12, marginBottom: 8 }} />
              <IonSkeletonText animated style={{ width: '70%', height: 20 }} />
            </div>
          ))}
        </div>
      </IonContent>
    </IonPage>
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar><IonTitle>Savings</IonTitle></IonToolbar>
      </IonHeader>

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div style={{ paddingBottom: 80 }}>

          {/* Monthly Overview */}
          {sectionLabel('Monthly Overview')}
          <IonList inset>
            <IonItem>
              <IonLabel color="medium">Monthly Income</IonLabel>
              <IonLabel slot="end" style={{ textAlign: 'right', fontWeight: 700 }}>{fmt(income)}</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel color="medium">Total Bills</IonLabel>
              <IonLabel slot="end" style={{ textAlign: 'right', fontWeight: 700, color: '#dc2626' }}>{fmt(totalBills)}</IonLabel>
            </IonItem>
            <IonItem lines="none">
              <IonLabel><strong>After Bills</strong></IonLabel>
              <IonLabel slot="end" style={{ textAlign: 'right', fontWeight: 800, fontSize: 17, color: remainingAfterBills >= 0 ? 'var(--be-green-600)' : '#dc2626' }}>
                {fmt(remainingAfterBills)}
              </IonLabel>
            </IonItem>
          </IonList>

          {/* Savings Goal */}
          {sectionLabel('Savings Goal')}
          <IonList inset>
            <IonItem>
              <IonLabel color="medium">Target</IonLabel>
              <IonLabel slot="end" style={{ textAlign: 'right', fontWeight: 700 }}>{fmt(savingsGoal)}</IonLabel>
            </IonItem>
            <IonItem lines="none">
              <div style={{ width: '100%', padding: '8px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: 'var(--ion-color-medium)' }}>Progress</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--be-green-600)' }}>{savingsProgress.toFixed(0)}%</span>
                </div>
                <div className="savings-progress">
                  <div className="savings-progress-fill" style={{ width: `${savingsProgress}%` }} />
                </div>
                <div style={{
                  marginTop: 10, padding: '10px 12px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                  background: savingsAfterGoal >= 0 ? '#dcfce7' : '#fee2e2',
                  color: savingsAfterGoal >= 0 ? 'var(--be-green-700)' : '#b91c1c',
                }}>
                  {savingsAfterGoal >= 0
                    ? `🎉 You can save ${fmt(savingsGoal)} and still have ${fmt(savingsAfterGoal)} left!`
                    : `⚠️ You're ${fmt(Math.abs(savingsAfterGoal))} short of your goal.`}
                </div>
              </div>
            </IonItem>
          </IonList>

          {/* Bills Progress */}
          {sectionLabel('Bills Payment Progress')}
          <IonList inset>
            <IonItem>
              <IonLabel color="medium">{paidBills.length} of {bills.length} paid</IonLabel>
              <IonLabel slot="end" style={{ textAlign: 'right', fontWeight: 700, color: 'var(--be-green-600)' }}>{fmt(totalPaid)}</IonLabel>
            </IonItem>
            <IonItem lines="none">
              <div style={{ width: '100%', padding: '4px 0 8px' }}>
                <div className="savings-progress">
                  <div className="savings-progress-fill" style={{ width: `${progressPct}%` }} />
                </div>
                <div style={{ fontSize: 12, color: 'var(--ion-color-medium)', marginTop: 6 }}>{progressPct.toFixed(0)}% of bills paid this month</div>
              </div>
            </IonItem>
          </IonList>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default SavingsPage;
