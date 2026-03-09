import React from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonIcon, IonButtons, IonList, IonItem, IonLabel,
} from '@ionic/react';
import { logOutOutline, settingsOutline } from 'ionicons/icons';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAuth } from '../components/AuthProvider';
import { useProfile } from '../lib/firestore';
import { useBills } from '../lib/firestore';
import { useHistory } from 'react-router-dom';
import { removePushToken } from '../lib/pushNotifications';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { bills } = useBills();
  const history = useHistory();

  const handleSignOut = async () => {
    if (user) await removePushToken(user.uid);
    await signOut(auth);
    history.push('/auth/signin');
  };

  const fmt = (n: number) => `R ${n.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`;
  const totalBills = bills.reduce((s, b) => s + b.amount, 0);
  const paidCount = bills.filter(b => b.isPaid).length;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Profile</IonTitle>
          <IonButtons slot="end">
            <IonButton fill="clear" routerLink="/settings">
              <IonIcon icon={settingsOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div style={{ paddingBottom: 80 }}>

          {/* Avatar */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 16px 24px' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--be-green-500), var(--be-green-700))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, fontWeight: 800, color: 'white', marginBottom: 12,
              boxShadow: '0 4px 20px rgba(34,197,94,0.3)',
            }}>
              {user?.email?.[0].toUpperCase()}
            </div>
            <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--ion-text-color)' }}>
              {user?.displayName || 'BillEase User'}
            </div>
            <div style={{ fontSize: 13, color: 'var(--ion-color-medium)', marginTop: 2 }}>{user?.email}</div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, padding: '0 16px 8px' }}>
            {[
              { label: 'Bills', value: bills.length },
              { label: 'Paid', value: paidCount },
              { label: 'Unpaid', value: bills.length - paidCount },
            ].map(s => (
              <div key={s.label} className="stat-card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ion-text-color)' }}>{s.value}</div>
                <div style={{ fontSize: 11, color: 'var(--ion-color-medium)', fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Financial profile */}
          {profile && (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ion-color-medium)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '16px 16px 6px' }}>
                Financial Profile
              </div>
              <IonList inset>
                {[
                  { label: 'Monthly Income', value: fmt(profile.income) },
                  { label: 'Savings Goal', value: fmt(profile.savingsGoal) },
                  { label: 'Currency', value: profile.currency },
                  { label: 'Total Monthly Bills', value: fmt(totalBills) },
                ].map((row, i, arr) => (
                  <IonItem key={row.label} lines={i === arr.length - 1 ? 'none' : 'inset'}>
                    <IonLabel color="medium">{row.label}</IonLabel>
                    <IonLabel slot="end" style={{ textAlign: 'right', fontWeight: 700 }}>{row.value}</IonLabel>
                  </IonItem>
                ))}
              </IonList>
            </>
          )}

          {/* Sign out */}
          <div style={{ padding: '8px 16px' }}>
            <IonButton expand="block" fill="outline" onClick={handleSignOut}
              style={{ '--border-color': '#ef4444', '--color': '#ef4444', '--border-radius': '14px', height: 50, fontWeight: 700 }}>
              <IonIcon icon={logOutOutline} slot="start" />
              Sign Out
            </IonButton>
          </div>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default ProfilePage;
