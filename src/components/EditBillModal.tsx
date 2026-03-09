import React, { useState, useEffect } from 'react';
import {
  IonModal, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonButton, IonItem, IonLabel, IonInput,
  IonSelect, IonSelectOption, IonToast, IonDatetime,
  IonDatetimeButton, IonPopover, IonToggle,
} from '@ionic/react';
import { updateBill } from '../lib/firestore';
import { useAuth } from './AuthProvider';
import { Bill, BillCategory } from '../lib/types';

interface Props {
  isOpen: boolean;
  bill: Bill;
  onClose: () => void;
  onBillUpdated: () => void;
}

const categories: BillCategory[] = ['Housing', 'Utilities', 'Transportation', 'Groceries', 'Subscription', 'Other'];

const EditBillModal: React.FC<Props> = ({ isOpen, bill, onClose, onBillUpdated }) => {
  const { user } = useAuth();
  const [name, setName] = useState(bill.name);
  const [amount, setAmount] = useState(String(bill.amount));
  const [dueDate, setDueDate] = useState(bill.dueDate);
  const [category, setCategory] = useState<BillCategory>(bill.category);
  const [frequency, setFrequency] = useState(bill.frequency);
  const [isPaid, setIsPaid] = useState(bill.isPaid);
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    setName(bill.name);
    setAmount(String(bill.amount));
    setDueDate(bill.dueDate);
    setCategory(bill.category);
    setFrequency(bill.frequency);
    setIsPaid(bill.isPaid);
  }, [bill]);

  const handleSave = async () => {
    if (!user || !name.trim() || !amount) {
      setToastMsg('Please fill in name and amount.');
      setShowToast(true);
      return;
    }
    setSaving(true);
    try {
      await updateBill(user.uid, bill.id, {
        name: name.trim(),
        amount: parseFloat(amount),
        dueDate: new Date(dueDate),
        category,
        frequency,
        isPaid,
      });
      onBillUpdated();
      onClose();
    } catch (e) {
      setToastMsg('Failed to update bill.');
      setShowToast(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <IonModal isOpen={isOpen} onDidDismiss={onClose} initialBreakpoint={0.85} breakpoints={[0, 0.85, 1]}>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton fill="clear" onClick={onClose} style={{ '--color': '#6b7280' }}>Cancel</IonButton>
            </IonButtons>
            <IonTitle>Edit Bill</IonTitle>
            <IonButtons slot="end">
              <IonButton fill="solid" onClick={handleSave} disabled={saving}
                style={{ '--background': 'var(--be-green-500)', '--color': '#ffffff', '--border-radius': '10px', fontWeight: 700 }}>
                {saving ? 'Saving...' : 'Update'}
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent style={{ '--background': 'var(--be-green-50)' }}>
          <div style={{ padding: '16px' }}>
            <div className="form-card" style={{ margin: 0, marginBottom: 16 }}>
              <IonItem lines="none" style={{ '--background': 'transparent', '--padding-start': 0 }}>
                <IonLabel position="stacked" style={{ fontWeight: 700, color: '#374151', marginBottom: 6 }}>Bill Name</IonLabel>
                <IonInput value={name} onIonInput={e => setName(e.detail.value ?? '')}
                  style={{ '--background': 'var(--be-green-50)', borderRadius: 10, border: '1px solid var(--be-green-100)', '--padding-start': '12px' }} />
              </IonItem>
              <IonItem lines="none" style={{ '--background': 'transparent', '--padding-start': 0, marginTop: 16 }}>
                <IonLabel position="stacked" style={{ fontWeight: 700, color: '#374151', marginBottom: 6 }}>Amount (R)</IonLabel>
                <IonInput type="number" value={amount} onIonInput={e => setAmount(e.detail.value ?? '')} inputMode="decimal"
                  style={{ '--background': 'var(--be-green-50)', borderRadius: 10, border: '1px solid var(--be-green-100)', '--padding-start': '12px' }} />
              </IonItem>
            </div>

            <div className="form-card" style={{ margin: 0, marginBottom: 16 }}>
              <IonItem lines="none" style={{ '--background': 'transparent', '--padding-start': 0 }}>
                <IonLabel position="stacked" style={{ fontWeight: 700, color: '#374151', marginBottom: 6 }}>Category</IonLabel>
                <IonSelect value={category} onIonChange={e => setCategory(e.detail.value)} interface="action-sheet"
                  style={{ '--background': 'var(--be-green-50)', borderRadius: 10, border: '1px solid var(--be-green-100)', width: '100%', paddingLeft: 12 }}>
                  {categories.map(c => <IonSelectOption key={c} value={c}>{c}</IonSelectOption>)}
                </IonSelect>
              </IonItem>
              <IonItem lines="none" style={{ '--background': 'transparent', '--padding-start': 0, marginTop: 16 }}>
                <IonLabel position="stacked" style={{ fontWeight: 700, color: '#374151', marginBottom: 6 }}>Frequency</IonLabel>
                <IonSelect value={frequency} onIonChange={e => setFrequency(e.detail.value)} interface="action-sheet"
                  style={{ '--background': 'var(--be-green-50)', borderRadius: 10, border: '1px solid var(--be-green-100)', width: '100%', paddingLeft: 12 }}>
                  <IonSelectOption value="monthly">Monthly</IonSelectOption>
                  <IonSelectOption value="yearly">Yearly</IonSelectOption>
                  <IonSelectOption value="one-time">One-time</IonSelectOption>
                </IonSelect>
              </IonItem>
            </div>

            <div className="form-card" style={{ margin: 0, marginBottom: 16 }}>
              <div style={{ fontWeight: 700, color: '#374151', marginBottom: 10, fontSize: 14 }}>Due Date</div>
              <IonDatetimeButton datetime="edit-datetime" />
              <IonPopover keepContentsMounted>
                <IonDatetime id="edit-datetime" value={dueDate} onIonChange={e => setDueDate(e.detail.value as string)} presentation="date" preferWheel />
              </IonPopover>
            </div>

            <div className="form-card" style={{ margin: 0 }}>
              <IonItem lines="none" style={{ '--background': 'transparent', '--padding-start': 0 }}>
                <IonLabel style={{ fontWeight: 700, color: '#374151' }}>Mark as Paid</IonLabel>
                <IonToggle checked={isPaid} onIonChange={e => setIsPaid(e.detail.checked)}
                  style={{ '--track-background-checked': 'var(--be-green-500)' }} slot="end" />
              </IonItem>
            </div>
          </div>
        </IonContent>
      </IonModal>

      <IonToast isOpen={showToast} message={toastMsg} duration={2500} onDidDismiss={() => setShowToast(false)} position="top" />
    </>
  );
};

export default EditBillModal;
