import React, { useState } from 'react';
import {
  IonModal, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonButton, IonInput, IonSelect, IonSelectOption,
  IonToast, IonDatetime, IonDatetimeButton, IonPopover, IonToggle, IonItem, IonLabel,
} from '@ionic/react';
import { addBill } from '../lib/firestore';
import { useAuth } from './AuthProvider';
import { BillCategory } from '../lib/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onBillAdded: () => void;
}

const categories: BillCategory[] = ['Housing', 'Utilities', 'Transportation', 'Groceries', 'Subscription', 'Other'];

const AddBillModal: React.FC<Props> = ({ isOpen, onClose, onBillAdded }) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString());
  const [category, setCategory] = useState<BillCategory>('Other');
  const [frequency, setFrequency] = useState<'monthly' | 'yearly' | 'one-time'>('monthly');
  const [isPaid, setIsPaid] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const handleSave = async () => {
    if (!user || !name.trim() || !amount) {
      setToastMsg('Please fill in name and amount.');
      setShowToast(true);
      return;
    }
    setSaving(true);
    try {
      await addBill(user.uid, {
        name: name.trim(),
        amount: parseFloat(amount),
        dueDate: new Date(dueDate),
        category,
        frequency,
        isPaid,
      });
      onBillAdded();
      resetForm();
      onClose();
    } catch (e) {
      setToastMsg('Failed to add bill. Please try again.');
      setShowToast(true);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setName('');
    setAmount('');
    setDueDate(new Date().toISOString());
    setCategory('Other');
    setFrequency('monthly');
    setIsPaid(false);
  };

  return (
    <>
      <IonModal isOpen={isOpen} onDidDismiss={onClose} initialBreakpoint={0.9} breakpoints={[0, 0.9, 1]}>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton fill="clear" onClick={onClose} style={{ '--color': '#6b7280' }}>Cancel</IonButton>
            </IonButtons>
            <IonTitle>Add Bill</IonTitle>
            <IonButtons slot="end">
              <IonButton fill="solid" onClick={handleSave} disabled={saving}
                style={{ '--background': 'var(--be-green-500)', '--border-radius': '10px', fontWeight: 700 }}>
                {saving ? 'Saving...' : 'Save'}
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent style={{ '--background': 'var(--ion-background-color)' }}>
          <div style={{ padding: '16px 16px 40px' }}>

            {/* Name & Amount */}
            <div className="form-card">
              <div style={{ marginBottom: 14 }}>
                <label className="field-label">Bill Name</label>
                <IonInput
                  className="be-input"
                  type="text"
                  value={name}
                  onIonInput={e => setName(e.detail.value ?? '')}
                  placeholder="e.g. Netflix, Rent, Electricity"
                />
              </div>
              <div>
                <label className="field-label">Amount (R)</label>
                <IonInput
                  className="be-input"
                  type="number"
                  value={amount}
                  onIonInput={e => setAmount(e.detail.value ?? '')}
                  placeholder="0.00"
                  inputMode="decimal"
                />
              </div>
            </div>

            {/* Category & Frequency */}
            <div className="form-card">
              <div style={{ marginBottom: 14 }}>
                <label className="field-label">Category</label>
                <div className="be-select-wrap">
                  <IonSelect
                    value={category}
                    onIonChange={e => setCategory(e.detail.value)}
                    interface="action-sheet"
                    placeholder="Select category"
                  >
                    {categories.map(c => <IonSelectOption key={c} value={c}>{c}</IonSelectOption>)}
                  </IonSelect>
                </div>
              </div>
              <div>
                <label className="field-label">Frequency</label>
                <div className="be-select-wrap">
                  <IonSelect
                    value={frequency}
                    onIonChange={e => setFrequency(e.detail.value)}
                    interface="action-sheet"
                    placeholder="Select frequency"
                  >
                    <IonSelectOption value="monthly">Monthly</IonSelectOption>
                    <IonSelectOption value="yearly">Yearly</IonSelectOption>
                    <IonSelectOption value="one-time">One-time</IonSelectOption>
                  </IonSelect>
                </div>
              </div>
            </div>

            {/* Due Date */}
            <div className="form-card">
              <label className="field-label">Due Date</label>
              <div className="be-date-wrap">
                <IonDatetimeButton datetime="add-bill-datetime" />
              </div>
              <IonPopover keepContentsMounted>
                <IonDatetime
                  id="add-bill-datetime"
                  value={dueDate}
                  onIonChange={e => setDueDate(e.detail.value as string)}
                  presentation="date"
                  preferWheel
                  style={{ '--background': 'var(--ion-card-background)', '--color': 'var(--ion-text-color)', '--wheel-fade-background-rgb': 'var(--ion-card-background)' }}
                />
              </IonPopover>
            </div>

            {/* Already Paid */}
            <div className="form-card" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, color: 'var(--ion-text-color)', fontSize: 14 }}>Already Paid?</span>
                <IonToggle
                  checked={isPaid}
                  onIonChange={e => setIsPaid(e.detail.checked)}
                  style={{ '--track-background-checked': 'var(--be-green-500)' }}
                />
              </div>
            </div>

          </div>
        </IonContent>
      </IonModal>

      <IonToast
        isOpen={showToast}
        message={toastMsg}
        duration={2500}
        onDidDismiss={() => setShowToast(false)}
        position="top"
      />
    </>
  );
};

export default AddBillModal;
