import React, { useState } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonButton, IonIcon, IonSearchbar, IonSegment,
  IonSegmentButton, IonLabel, IonRefresher, IonRefresherContent,
  IonFab, IonFabButton, IonSkeletonText,
} from '@ionic/react';
import { addOutline, documentTextOutline } from 'ionicons/icons';
import { useBills } from '../lib/firestore';
import { useProfile } from '../lib/firestore';
import { Bill } from '../lib/types';
import AddBillModal from '../components/AddBillModal';
import BillListItem from '../components/BillListItem';

const BillsPage: React.FC = () => {
  const { bills, loading, refetch } = useBills();
  const { profile } = useProfile();
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unpaid' | 'paid'>('all');
  const [search, setSearch] = useState('');

  const handleRefresh = async (e: CustomEvent) => {
    await refetch();
    (e.target as HTMLIonRefresherElement).complete();
  };

  const filtered = bills
    .filter(b => {
      if (filter === 'paid') return b.isPaid;
      if (filter === 'unpaid') return !b.isPaid;
      return true;
    })
    .filter(b => b.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>My Bills</IonTitle>
          <IonButtons slot="end">
            <IonButton routerLink="/bills/import" fill="clear" style={{ '--color': 'var(--be-green-600)', fontWeight: 600, fontSize: 13 }}>
              <IonIcon icon={documentTextOutline} slot="start" />
              Import
            </IonButton>
          </IonButtons>
        </IonToolbar>
        <IonToolbar>
          <IonSearchbar
            value={search}
            onIonInput={e => setSearch(e.detail.value ?? '')}
            placeholder="Search bills..."
            style={{ '--border-radius': '12px', '--background': 'var(--be-green-50)' }}
          />
        </IonToolbar>
        <IonToolbar>
          <IonSegment
            value={filter}
            onIonChange={e => setFilter(e.detail.value as any)}
            style={{ '--background': 'var(--be-green-50)', margin: '0 16px 8px' }}
          >
            <IonSegmentButton value="all"><IonLabel>All</IonLabel></IonSegmentButton>
            <IonSegmentButton value="unpaid"><IonLabel>Unpaid</IonLabel></IonSegmentButton>
            <IonSegmentButton value="paid"><IonLabel>Paid</IonLabel></IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div style={{ padding: '16px 16px 100px' }}>
          {/* Summary row */}
          {!loading && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <div style={{ flex: 1, background: 'white', borderRadius: 12, padding: '10px 14px', border: '1px solid var(--be-green-100)' }}>
                <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#111827' }}>{filtered.length} bills</div>
              </div>
              <div style={{ flex: 1, background: 'white', borderRadius: 12, padding: '10px 14px', border: '1px solid var(--be-green-100)' }}>
                <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Unpaid</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#d97706' }}>
                  {filtered.filter(b => !b.isPaid).length} bills
                </div>
              </div>
            </div>
          )}

          {loading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="bill-item">
                <IonSkeletonText animated style={{ width: 40, height: 40, borderRadius: 12 }} />
                <div style={{ flex: 1 }}>
                  <IonSkeletonText animated style={{ width: '60%', height: 14, marginBottom: 6 }} />
                  <IonSkeletonText animated style={{ width: '40%', height: 12 }} />
                </div>
                <IonSkeletonText animated style={{ width: 70, height: 16 }} />
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>📋</div>
              <p style={{ fontWeight: 700, fontSize: 16, color: '#374151' }}>No bills found</p>
              <p style={{ fontSize: 13 }}>
                {search ? 'Try a different search term' : 'Add your first bill using the + button'}
              </p>
            </div>
          ) : (
            filtered.map(bill => (
              <BillListItem key={bill.id} bill={bill} onUpdated={refetch} />
            ))
          )}
        </div>

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

export default BillsPage;
