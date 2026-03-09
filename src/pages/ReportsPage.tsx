import React from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonRefresher, IonRefresherContent, IonSkeletonText,
  IonList, IonItem, IonLabel,
} from '@ionic/react';
import { useBills } from '../lib/firestore';
import { BillCategory } from '../lib/types';

const categoryEmoji: Record<string, string> = {
  Housing: '🏠', Utilities: '⚡', Transportation: '🚗',
  Groceries: '🛒', Subscription: '📱', Other: '📌',
};
const categoryColor: Record<string, string> = {
  Housing: '#3b82f6', Utilities: '#f59e0b', Transportation: '#8b5cf6',
  Groceries: '#22c55e', Subscription: '#ec4899', Other: '#6b7280',
};

const ReportsPage: React.FC = () => {
  const { bills, loading, refetch } = useBills();

  const handleRefresh = async (e: CustomEvent) => {
    await refetch();
    (e.target as HTMLIonRefresherElement).complete();
  };

  const totalAmount = bills.reduce((s, b) => s + b.amount, 0);
  const paidAmount = bills.filter(b => b.isPaid).reduce((s, b) => s + b.amount, 0);
  const fmt = (n: number) => `R ${n.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`;

  const byCategory = bills.reduce((acc, bill) => {
    if (!acc[bill.category]) acc[bill.category] = { total: 0, count: 0 };
    acc[bill.category].total += bill.amount;
    acc[bill.category].count += 1;
    return acc;
  }, {} as Record<BillCategory, { total: number; count: number }>);

  const sortedCategories = Object.entries(byCategory).sort((a, b) => b[1].total - a[1].total);

  const sectionLabel = (text: string) => (
    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ion-color-medium)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '16px 16px 6px' }}>
      {text}
    </div>
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar><IonTitle>Reports</IonTitle></IonToolbar>
      </IonHeader>

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div style={{ paddingBottom: 80 }}>
          {loading ? (
            <div style={{ padding: 16 }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="stat-card" style={{ marginBottom: 12 }}>
                  <IonSkeletonText animated style={{ width: '60%', height: 14, marginBottom: 8 }} />
                  <IonSkeletonText animated style={{ width: '100%', height: 8, borderRadius: 8 }} />
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Summary */}
              {sectionLabel('Summary')}
              <IonList inset>
                <IonItem>
                  <IonLabel color="medium">Total Spend</IonLabel>
                  <IonLabel slot="end" style={{ textAlign: 'right', fontWeight: 800 }}>{fmt(totalAmount)}</IonLabel>
                </IonItem>
                <IonItem lines="none">
                  <IonLabel color="medium">Paid So Far</IonLabel>
                  <IonLabel slot="end" style={{ textAlign: 'right', fontWeight: 800, color: 'var(--be-green-600)' }}>{fmt(paidAmount)}</IonLabel>
                </IonItem>
              </IonList>

              {/* By Category */}
              {sectionLabel('Spend by Category')}
              {sortedCategories.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ion-color-medium)' }}>
                  <div style={{ fontSize: 40, marginBottom: 8 }}>📋</div>
                  <p style={{ fontWeight: 600 }}>No bills to report yet</p>
                </div>
              ) : (
                <IonList inset>
                  {sortedCategories.map(([cat, data], i, arr) => {
                    const pct = totalAmount > 0 ? (data.total / totalAmount) * 100 : 0;
                    const color = categoryColor[cat] ?? '#6b7280';
                    return (
                      <IonItem key={cat} lines={i === arr.length - 1 ? 'none' : 'inset'}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, marginRight: 12, flexShrink: 0 }}>
                          {categoryEmoji[cat]}
                        </div>
                        <IonLabel>
                          <h3 style={{ fontWeight: 700 }}>{cat}</h3>
                          <div style={{ marginTop: 6 }}>
                            <div style={{ height: 5, background: 'var(--be-green-100)', borderRadius: 99 }}>
                              <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99 }} />
                            </div>
                          </div>
                          <p style={{ fontSize: 11, color: 'var(--ion-color-medium)', marginTop: 3 }}>{data.count} bill{data.count !== 1 ? 's' : ''} · {pct.toFixed(0)}%</p>
                        </IonLabel>
                        <IonLabel slot="end" style={{ textAlign: 'right', fontWeight: 800, flexShrink: 0 }}>{fmt(data.total)}</IonLabel>
                      </IonItem>
                    );
                  })}
                </IonList>
              )}
            </>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ReportsPage;
