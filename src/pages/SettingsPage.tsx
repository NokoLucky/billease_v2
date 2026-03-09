import React, { useState, useEffect } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonItem, IonLabel, IonInput, IonSelect, IonSelectOption,
  IonToggle, IonButton, IonToast, IonNote, IonList, IonIcon,
} from '@ionic/react';
import { checkmarkCircle } from 'ionicons/icons';
import { useProfile } from '../lib/firestore';
import { useTheme } from '../components/ThemeProvider';

const SettingsPage: React.FC = () => {
  const { profile, loading, update } = useProfile();
  const { theme, setTheme } = useTheme();
  const [income, setIncome] = useState('');
  const [savingsGoal, setSavingsGoal] = useState('');
  const [currency, setCurrency] = useState('ZAR');
  const [dueSoon, setDueSoon] = useState(true);
  const [paidConfirmation, setPaidConfirmation] = useState(true);
  const [savingsTips, setSavingsTips] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (profile) {
      setIncome(String(profile.income));
      setSavingsGoal(String(profile.savingsGoal));
      setCurrency(profile.currency);
      setDueSoon(profile.notifications?.dueSoon ?? true);
      setPaidConfirmation(profile.notifications?.paidConfirmation ?? true);
      setSavingsTips(profile.notifications?.savingsTips ?? false);
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await update({
        income: parseFloat(income) || 0,
        savingsGoal: parseFloat(savingsGoal) || 0,
        currency,
        notifications: { dueSoon, paidConfirmation, savingsTips },
      });
      setShowToast(true);
    } finally {
      setSaving(false);
    }
  };

  const sectionLabel = (text: string) => (
    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ion-color-medium)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '16px 16px 6px' }}>
      {text}
    </div>
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div style={{ paddingBottom: 80 }}>

          {/* Appearance */}
          {sectionLabel('Appearance')}
          <IonList inset>
            {([
              { value: 'light', emoji: '☀️', label: 'Light Mode' },
              { value: 'dark', emoji: '🌙', label: 'Dark Mode' },
              { value: 'system', emoji: '⚙️', label: 'System (follow device)' },
            ] as const).map(({ value, emoji, label }, i, arr) => (
              <IonItem
                key={value}
                lines={i === arr.length - 1 ? 'none' : 'inset'}
                button
                detail={false}
                onClick={() => setTheme(value)}
              >
                <span style={{ fontSize: 18, marginRight: 12 }}>{emoji}</span>
                <IonLabel style={{ fontWeight: theme === value ? 700 : 400 }}>{label}</IonLabel>
                {theme === value && (
                  <IonIcon slot="end" icon={checkmarkCircle} style={{ color: 'var(--be-green-500)', fontSize: 22 }} />
                )}
              </IonItem>
            ))}
          </IonList>

          {/* Financial */}
          {sectionLabel('Financial')}
          <IonList inset>
            <IonItem>
              <IonLabel position="stacked">Monthly Income</IonLabel>
              <IonInput type="number" value={income} inputMode="decimal" placeholder="25000"
                onIonInput={e => setIncome(e.detail.value ?? '')} />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Savings Goal</IonLabel>
              <IonInput type="number" value={savingsGoal} inputMode="decimal" placeholder="2500"
                onIonInput={e => setSavingsGoal(e.detail.value ?? '')} />
            </IonItem>
            <IonItem lines="none">
              <IonLabel position="stacked">Currency</IonLabel>
              <IonSelect value={currency} interface="action-sheet" onIonChange={e => setCurrency(e.detail.value)}>
                <IonSelectOption value="ZAR">ZAR (R)</IonSelectOption>
                <IonSelectOption value="USD">USD ($)</IonSelectOption>
                <IonSelectOption value="EUR">EUR (€)</IonSelectOption>
                <IonSelectOption value="GBP">GBP (£)</IonSelectOption>
              </IonSelect>
            </IonItem>
          </IonList>

          {/* Notifications */}
          {sectionLabel('Notifications')}
          <IonList inset>
            <IonItem>
              <IonLabel>
                <h3>Due Soon Reminders</h3>
                <IonNote>Get notified when bills are approaching</IonNote>
              </IonLabel>
              <IonToggle slot="end" checked={dueSoon} onIonChange={e => setDueSoon(e.detail.checked)} />
            </IonItem>
            <IonItem>
              <IonLabel>
                <h3>Payment Confirmations</h3>
                <IonNote>Notify when a bill is marked as paid</IonNote>
              </IonLabel>
              <IonToggle slot="end" checked={paidConfirmation} onIonChange={e => setPaidConfirmation(e.detail.checked)} />
            </IonItem>
            <IonItem lines="none">
              <IonLabel>
                <h3>Savings Tips</h3>
                <IonNote>Receive helpful financial tips</IonNote>
              </IonLabel>
              <IonToggle slot="end" checked={savingsTips} onIonChange={e => setSavingsTips(e.detail.checked)} />
            </IonItem>
          </IonList>

          <div style={{ padding: '8px 16px' }}>
            <IonButton expand="block" onClick={handleSave} disabled={saving || loading}
              style={{ '--background': 'var(--be-green-500)', '--color': '#ffffff', '--border-radius': '14px', fontWeight: 700, height: 52 }}>
              {saving ? 'Saving...' : 'Save Settings'}
            </IonButton>
          </div>

        </div>

        <IonToast isOpen={showToast} message="✅ Settings saved!" duration={2000}
          position="top" onDidDismiss={() => setShowToast(false)} />
      </IonContent>
    </IonPage>
  );
};

export default SettingsPage;
