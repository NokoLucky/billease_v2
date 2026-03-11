import React, { useState } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonButton, IonIcon, IonRefresher, IonRefresherContent, IonSkeletonText,
  IonModal, IonFab, IonFabButton,
} from '@ionic/react';
import { addOutline, walletOutline } from 'ionicons/icons';
import { format } from 'date-fns';
import { useBills } from '../lib/firestore';
import { useAuth } from '../components/AuthProvider';
import { useProfile } from '../lib/firestore';
import { Bill } from '../lib/types';
import AddBillModal from '../components/AddBillModal';
import BillListItem from '../components/BillListItem';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { bills, loading, refetch } = useBills();
  const { profile } = useProfile();
  const [showAddModal, setShowAddModal] = useState(false);

  const currency = profile?.currency ?? 'ZAR';
  const fmt = (n: number) => `${currency} ${n.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`;

  const totalBills = bills.reduce((s, b) => s + b.amount, 0);
  const paidBills = bills.filter(b => b.isPaid);
  const unpaidBills = bills.filter(b => !b.isPaid);
  const totalPaid = paidBills.reduce((s, b) => s + b.amount, 0);
  const totalUnpaid = unpaidBills.reduce((s, b) => s + b.amount, 0);

  const now = new Date();
  const overdueBills = unpaidBills.filter(b => new Date(b.dueDate) < now);

  const currentMonth = format(now, 'MMMM yyyy');

  const handleRefresh = async (e: CustomEvent) => {
    await refetch();
    (e.target as HTMLIonRefresherElement).complete();
  };

  const recentBills = [...bills]
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  return (
    <IonPage>
      {/* IonHeader + IonToolbar automatically handles iOS safe area / notch */}
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonIcon icon={walletOutline} style={{ fontSize: 24, color: 'var(--be-green-600)', marginLeft: 8 }} />
          </IonButtons>
          <IonTitle>
            <span className="billease-logo">BillEase</span>
          </IonTitle>
          <IonButtons slot="end">
            <IonButton routerLink="/profile" fill="clear">
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'var(--be-green-100)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, color: 'var(--be-green-700)', fontSize: 13,
              }}>
                {user?.email?.[0].toUpperCase()}
              </div>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen={false}>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div style={{ padding: '24px 16px 100px' }}>

          {/* ── Month label ── */}
          <p style={{ margin: '0 0 14px', fontSize: 13, color: 'var(--ion-color-medium)', fontWeight: 600 }}>
            {currentMonth}
          </p>

          {/* ── Stat cards ── */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="stat-card">
                  <IonSkeletonText animated style={{ width: '60%', height: 12, marginBottom: 8 }} />
                  <IonSkeletonText animated style={{ width: '80%', height: 22 }} />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#dcfce7' }}>💳</div>
                <div className="stat-label">Total Bills</div>
                <div className="stat-value" style={{ fontSize: '1.1rem' }}>{fmt(totalBills)}</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#dcfce7' }}>✅</div>
                <div className="stat-label">Paid</div>
                <div className="stat-value" style={{ fontSize: '1.1rem', color: 'var(--be-green-600)' }}>{fmt(totalPaid)}</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#fef3c7' }}>⏳</div>
                <div className="stat-label">Unpaid</div>
                <div className="stat-value" style={{ fontSize: '1.1rem', color: '#d97706' }}>{fmt(totalUnpaid)}</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: overdueBills.length > 0 ? '#fee2e2' : '#dcfce7' }}>
                  {overdueBills.length > 0 ? '⚠️' : '🎉'}
                </div>
                <div className="stat-label">Overdue</div>
                <div className="stat-value" style={{ fontSize: '1.1rem', color: overdueBills.length > 0 ? '#dc2626' : '#16a34a' }}>
                  {overdueBills.length} bill{overdueBills.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          )}

          {/* ── Upcoming bills ── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <p className="section-title" style={{ margin: 0 }}>Upcoming Bills</p>
            <IonButton fill="clear" size="small" routerLink="/bills" style={{ '--color': 'var(--be-green-600)', fontWeight: 700 }}>
              See All
            </IonButton>
          </div>

          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="bill-item">
                <IonSkeletonText animated style={{ width: 40, height: 40, borderRadius: 12 }} />
                <div style={{ flex: 1 }}>
                  <IonSkeletonText animated style={{ width: '60%', height: 14, marginBottom: 6 }} />
                  <IonSkeletonText animated style={{ width: '40%', height: 12 }} />
                </div>
                <IonSkeletonText animated style={{ width: 70, height: 16 }} />
              </div>
            ))
          ) : recentBills.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
              <p style={{ fontWeight: 600 }}>No bills yet!</p>
              <p style={{ fontSize: 13 }}>Tap + to add your first bill</p>
            </div>
          ) : (
            recentBills.map(bill => (
              <BillListItem key={bill.id} bill={bill} onUpdated={refetch} />
            ))
          )}
        </div>

        {/* ── FAB Add Button ── */}
        <IonFab vertical="bottom" horizontal="end" slot="fixed" style={{ marginBottom: 'calc(56px + env(safe-area-inset-bottom) + 16px)' }}>
          <IonFabButton onClick={() => setShowAddModal(true)} style={{ '--background': 'var(--be-green-500)', '--background-activated': 'var(--be-green-600)', '--color': '#ffffff' }}>
            <IonIcon icon={addOutline} />
          </IonFabButton>
        </IonFab>
      </IonContent>

      <AddBillModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onBillAdded={refetch}
      />
    </IonPage>
  );
};

export default DashboardPage;
