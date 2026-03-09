import React, { useState } from 'react';
import {
  IonPage, IonContent, IonButton, IonInput, IonSelect,
  IonSelectOption, IonToast, IonIcon, IonDatetime, IonDatetimeButton, IonPopover,
} from '@ionic/react';
import {
  walletOutline, checkmarkCircleOutline, addCircleOutline,
  trendingUpOutline, sparklesOutline,
} from 'ionicons/icons';
import { useAuth } from '../components/AuthProvider';
import { addBill, updateProfile } from '../lib/firestore';
import { BillCategory } from '../lib/types';

// ─── Step definitions ─────────────────────────────────────────────────────────

const STEPS = [
  { id: 'welcome' },
  { id: 'how-it-works' },
  { id: 'financial' },
  { id: 'savings' },
  { id: 'first-bill' },
];

const categories: BillCategory[] = ['Housing', 'Utilities', 'Transportation', 'Groceries', 'Subscription', 'Other'];

// ─── Component ────────────────────────────────────────────────────────────────

const OnboardingPage: React.FC = () => {
  const { user } = useAuth();

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Financial step
  const [income, setIncome] = useState('');
  const [currency, setCurrency] = useState('ZAR');

  // Savings step
  const [savingsGoal, setSavingsGoal] = useState('');

  // First bill step
  const [billName, setBillName] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [billDueDate, setBillDueDate] = useState(new Date().toISOString());
  const [billCategory, setBillCategory] = useState<BillCategory>('Other');
  const [billFrequency, setBillFrequency] = useState<'monthly' | 'yearly' | 'one-time'>('monthly');

  const total = STEPS.length;
  const progress = ((step + 1) / total) * 100;

  // ─── Navigation ──────────────────────────────────────────────────────────────

  const next = () => {
    if (step < total - 1) setStep(s => s + 1);
  };

  const skip = () => {
    if (step < total - 1) setStep(s => s + 1);
    else complete();
  };

  const complete = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateProfile(user.uid, {
        income: parseFloat(income) || 0,
        savingsGoal: parseFloat(savingsGoal) || 0,
        currency,
        onboardingComplete: true,
        notifications: { dueSoon: true, paidConfirmation: true, savingsTips: false },
      });
      window.location.replace('/dashboard');
    } catch (e) {
      setToastMsg('Something went wrong. Please try again.');
      setShowToast(true);
    } finally {
      setSaving(false);
    }
  };

  const completeWithBill = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateProfile(user.uid, {
        income: parseFloat(income) || 0,
        savingsGoal: parseFloat(savingsGoal) || 0,
        currency,
        onboardingComplete: true,
        notifications: { dueSoon: true, paidConfirmation: true, savingsTips: false },
      });

      if (billName.trim() && billAmount) {
        await addBill(user.uid, {
          name: billName.trim(),
          amount: parseFloat(billAmount),
          dueDate: new Date(billDueDate),
          category: billCategory,
          frequency: billFrequency,
          isPaid: false,
        });
      }

      window.location.replace('/dashboard');
    } catch (e) {
      setToastMsg('Something went wrong. Please try again.');
      setShowToast(true);
    } finally {
      setSaving(false);
    }
  };

  // ─── Shared UI helpers ────────────────────────────────────────────────────────

  const ProgressBar = () => (
    <div style={{ padding: '16px 24px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: 'var(--ion-color-medium)', fontWeight: 600 }}>
          Step {step + 1} of {total}
        </span>
        <span style={{ fontSize: 12, color: 'var(--be-green-600)', fontWeight: 700 }}>
          {Math.round(progress)}%
        </span>
      </div>
      <div style={{ height: 6, background: 'var(--be-green-100)', borderRadius: 99 }}>
        <div style={{
          height: '100%', width: `${progress}%`,
          background: 'linear-gradient(90deg, var(--be-green-500), var(--be-green-600))',
          borderRadius: 99, transition: 'width 0.4s ease',
        }} />
      </div>
    </div>
  );

  const StepDots = () => (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
      {STEPS.map((_, i) => (
        <div key={i} style={{
          width: i === step ? 20 : 8, height: 8,
          borderRadius: 99,
          background: i === step ? 'var(--be-green-500)' : i < step ? 'var(--be-green-300, #86efac)' : 'var(--be-green-100)',
          transition: 'all 0.3s ease',
        }} />
      ))}
    </div>
  );

  const iconBox = (icon: string, bg: string) => (
    <div style={{
      width: 80, height: 80, borderRadius: 24,
      background: bg, display: 'flex', alignItems: 'center',
      justifyContent: 'center', margin: '0 auto 24px',
      boxShadow: '0 8px 32px rgba(34,197,94,0.2)',
    }}>
      <IonIcon icon={icon} style={{ fontSize: 40, color: 'white' }} />
    </div>
  );

  const fieldLabel = (text: string, optional?: boolean) => (
    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ion-text-color)', marginBottom: 6, display: 'flex', gap: 6, alignItems: 'center' }}>
      {text}
      {optional && <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--ion-color-medium)' }}>(optional)</span>}
    </div>
  );

  const beInput = {
    '--background': 'var(--ion-card-background)',
    '--color': 'var(--ion-text-color)',
    '--placeholder-color': 'var(--ion-color-medium)',
    '--padding-start': '14px',
    '--padding-end': '14px',
    border: '1.5px solid var(--be-border)',
    borderRadius: 10,
    width: '100%',
    display: 'block',
  } as React.CSSProperties;

  // ─── Steps ────────────────────────────────────────────────────────────────────

  const renderStep = () => {
    switch (STEPS[step].id) {

      // ── Step 1: Welcome ──────────────────────────────────────────────────────
      case 'welcome':
        return (
          <div style={{ textAlign: 'center', padding: '40px 24px 0' }}>
            {iconBox(walletOutline, 'linear-gradient(135deg, var(--be-green-500), var(--be-green-700))')}
            <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--ion-text-color)', letterSpacing: '-0.03em', margin: '0 0 12px' }}>
              Welcome to BillEase
            </h1>
            <p style={{ fontSize: 16, color: 'var(--ion-color-medium)', lineHeight: 1.6, margin: '0 0 40px' }}>
              The smart way to track and manage all your bills in one place.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
              {[
                { emoji: '📋', text: 'Track all your bills in one place' },
                { emoji: '🔄', text: 'Recurring bills reset automatically' },
                { emoji: '🤖', text: 'Import bills with AI from any text' },
                { emoji: '🌙', text: 'Full dark mode support' },
              ].map(f => (
                <div key={f.text} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: 'var(--ion-card-background)',
                  borderRadius: 12, padding: '12px 16px',
                  border: '1px solid var(--be-green-100)',
                  textAlign: 'left',
                }}>
                  <span style={{ fontSize: 22 }}>{f.emoji}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ion-text-color)' }}>{f.text}</span>
                </div>
              ))}
            </div>
            <IonButton expand="block" onClick={next}
              style={{ '--background': 'var(--be-green-500)', '--color': '#ffffff', '--border-radius': '14px', fontWeight: 700, height: 52 }}>
              Get Started
            </IonButton>
          </div>
        );

      // ── Step 2: How it works ─────────────────────────────────────────────────
      case 'how-it-works':
        return (
          <div style={{ padding: '32px 24px 0' }}>
            {iconBox(sparklesOutline, 'linear-gradient(135deg, #8b5cf6, #6d28d9)')}
            <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--ion-text-color)', letterSpacing: '-0.03em', textAlign: 'center', margin: '0 0 8px' }}>
              Here's how it works
            </h2>
            <p style={{ fontSize: 14, color: 'var(--ion-color-medium)', textAlign: 'center', lineHeight: 1.6, margin: '0 0 32px' }}>
              Three simple steps to stay on top of your bills
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 40 }}>
              {[
                { step: '1', title: 'Add your bills', desc: 'Manually or paste any text and let AI do it for you', color: 'var(--be-green-500)' },
                { step: '2', title: 'Track payments', desc: 'Mark bills as paid and see your progress each month', color: '#f59e0b' },
                { step: '3', title: 'Stay on budget', desc: 'See how much you have left after bills and set savings goals', color: '#3b82f6' },
              ].map(item => (
                <div key={item.step} style={{
                  display: 'flex', gap: 16, alignItems: 'flex-start',
                  background: 'var(--ion-card-background)',
                  borderRadius: 14, padding: '16px',
                  border: '1px solid var(--be-green-100)',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: item.color, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontWeight: 800, fontSize: 16, color: 'white',
                  }}>
                    {item.step}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--ion-text-color)', marginBottom: 4 }}>{item.title}</div>
                    <div style={{ fontSize: 13, color: 'var(--ion-color-medium)', lineHeight: 1.5 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <IonButton expand="block" onClick={next}
              style={{ '--background': 'var(--be-green-500)', '--color': '#ffffff', '--border-radius': '14px', fontWeight: 700, height: 52 }}>
              Continue
            </IonButton>
          </div>
        );

      // ── Step 3: Financial setup ──────────────────────────────────────────────
      case 'financial':
        return (
          <div style={{ padding: '32px 24px 0' }}>
            {iconBox(trendingUpOutline, 'linear-gradient(135deg, #f59e0b, #d97706)')}
            <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--ion-text-color)', letterSpacing: '-0.03em', textAlign: 'center', margin: '0 0 8px' }}>
              Your finances
            </h2>
            <p style={{ fontSize: 14, color: 'var(--ion-color-medium)', textAlign: 'center', lineHeight: 1.6, margin: '0 0 32px' }}>
              This helps BillEase calculate how much you have left after bills. You can always update this later.
            </p>

            <div style={{ marginBottom: 20 }}>
              {fieldLabel('Monthly Income', true)}
              <IonInput
                type="number"
                value={income}
                onIonInput={e => setIncome(e.detail.value ?? '')}
                placeholder="e.g. 25000"
                inputMode="decimal"
                style={beInput}
              />
            </div>

            <div style={{ marginBottom: 32 }}>
              {fieldLabel('Currency')}
              <div style={{
                background: 'var(--ion-card-background)',
                border: '1.5px solid var(--be-border)',
                borderRadius: 10, display: 'flex', alignItems: 'center',
                minHeight: 46, padding: '0 4px 0 0', overflow: 'hidden',
              }}>
                <IonSelect
                  value={currency}
                  onIonChange={e => setCurrency(e.detail.value)}
                  interface="action-sheet"
                  style={{ '--color': 'var(--ion-text-color)', width: '100%', paddingLeft: 14 }}
                >
                  <IonSelectOption value="ZAR">ZAR (R) — South African Rand</IonSelectOption>
                  <IonSelectOption value="USD">USD ($) — US Dollar</IonSelectOption>
                  <IonSelectOption value="EUR">EUR (€) — Euro</IonSelectOption>
                  <IonSelectOption value="GBP">GBP (£) — British Pound</IonSelectOption>
                  <IonSelectOption value="NGN">NGN (₦) — Nigerian Naira</IonSelectOption>
                  <IonSelectOption value="KES">KES (Ksh) — Kenyan Shilling</IonSelectOption>
                  <IonSelectOption value="GHS">GHS (₵) — Ghanaian Cedi</IonSelectOption>
                </IonSelect>
              </div>
            </div>

            <IonButton expand="block" onClick={next}
              style={{ '--background': 'var(--be-green-500)', '--color': '#ffffff', '--border-radius': '14px', fontWeight: 700, height: 52, marginBottom: 12 }}>
              Continue
            </IonButton>
            <IonButton expand="block" fill="clear" onClick={skip}
              style={{ '--color': 'var(--ion-color-medium)', height: 44 }}>
              Skip for now
            </IonButton>
          </div>
        );

      // ── Step 4: Savings goal ─────────────────────────────────────────────────
      case 'savings':
        return (
          <div style={{ padding: '32px 24px 0' }}>
            {iconBox(checkmarkCircleOutline, 'linear-gradient(135deg, #3b82f6, #1d4ed8)')}
            <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--ion-text-color)', letterSpacing: '-0.03em', textAlign: 'center', margin: '0 0 8px' }}>
              Set a savings goal
            </h2>
            <p style={{ fontSize: 14, color: 'var(--ion-color-medium)', textAlign: 'center', lineHeight: 1.6, margin: '0 0 32px' }}>
              How much do you want to save each month after paying your bills?
            </p>

            <div style={{ marginBottom: 16 }}>
              {fieldLabel('Monthly Savings Goal', true)}
              <IonInput
                type="number"
                value={savingsGoal}
                onIonInput={e => setSavingsGoal(e.detail.value ?? '')}
                placeholder="e.g. 2500"
                inputMode="decimal"
                style={beInput}
              />
            </div>

            {income && savingsGoal && parseFloat(savingsGoal) > 0 && (
              <div style={{
                background: 'var(--ion-card-background)',
                border: '1px solid var(--be-green-100)',
                borderRadius: 12, padding: '12px 16px', marginBottom: 24,
              }}>
                <div style={{ fontSize: 13, color: 'var(--ion-color-medium)', marginBottom: 4 }}>After saving</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--be-green-600)' }}>
                  {currency} {(parseFloat(income) - parseFloat(savingsGoal)).toLocaleString('en-ZA', { minimumFractionDigits: 2 })} remaining
                </div>
              </div>
            )}

            <IonButton expand="block" onClick={next}
              style={{ '--background': 'var(--be-green-500)', '--color': '#ffffff', '--border-radius': '14px', fontWeight: 700, height: 52, marginBottom: 12 }}>
              Continue
            </IonButton>
            <IonButton expand="block" fill="clear" onClick={skip}
              style={{ '--color': 'var(--ion-color-medium)', height: 44 }}>
              Skip for now
            </IonButton>
          </div>
        );

      // ── Step 5: First bill ───────────────────────────────────────────────────
      case 'first-bill':
        return (
          <div style={{ padding: '32px 24px 0' }}>
            {iconBox(addCircleOutline, 'linear-gradient(135deg, var(--be-green-500), var(--be-green-700))')}
            <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--ion-text-color)', letterSpacing: '-0.03em', textAlign: 'center', margin: '0 0 8px' }}>
              Add your first bill
            </h2>
            <p style={{ fontSize: 14, color: 'var(--ion-color-medium)', textAlign: 'center', lineHeight: 1.6, margin: '0 0 24px' }}>
              Start with one bill — you can always add more from the dashboard.
            </p>

            <div style={{ marginBottom: 14 }}>
              {fieldLabel('Bill Name')}
              <IonInput value={billName} onIonInput={e => setBillName(e.detail.value ?? '')}
                placeholder="e.g. Netflix, Rent, Electricity" style={beInput} />
            </div>

            <div style={{ marginBottom: 14 }}>
              {fieldLabel('Amount')}
              <IonInput type="number" value={billAmount} onIonInput={e => setBillAmount(e.detail.value ?? '')}
                placeholder="0.00" inputMode="decimal" style={beInput} />
            </div>

            <div style={{ marginBottom: 14 }}>
              {fieldLabel('Due Date')}
              <div style={{
                background: 'var(--ion-card-background)', border: '1.5px solid var(--be-border)',
                borderRadius: 10, minHeight: 46, display: 'flex', alignItems: 'center', padding: '0 14px',
              }}>
                <IonDatetimeButton datetime="onboarding-datetime" />
              </div>
              <IonPopover keepContentsMounted>
                <IonDatetime
                  id="onboarding-datetime"
                  value={billDueDate}
                  onIonChange={e => setBillDueDate(e.detail.value as string)}
                  presentation="date"
                  preferWheel
                  style={{ '--background': 'var(--ion-card-background)', '--color': 'var(--ion-text-color)', '--wheel-fade-background-rgb': 'var(--ion-card-background)' }}
                />
              </IonPopover>
            </div>

            <div style={{ marginBottom: 14 }}>
              {fieldLabel('Category')}
              <div style={{
                background: 'var(--ion-card-background)', border: '1.5px solid var(--be-border)',
                borderRadius: 10, display: 'flex', alignItems: 'center', minHeight: 46,
                padding: '0 4px 0 0', overflow: 'hidden',
              }}>
                <IonSelect value={billCategory} onIonChange={e => setBillCategory(e.detail.value)}
                  interface="action-sheet" style={{ '--color': 'var(--ion-text-color)', width: '100%', paddingLeft: 14 }}>
                  {categories.map(c => <IonSelectOption key={c} value={c}>{c}</IonSelectOption>)}
                </IonSelect>
              </div>
            </div>

            <div style={{ marginBottom: 32 }}>
              {fieldLabel('Frequency')}
              <div style={{
                background: 'var(--ion-card-background)', border: '1.5px solid var(--be-border)',
                borderRadius: 10, display: 'flex', alignItems: 'center', minHeight: 46,
                padding: '0 4px 0 0', overflow: 'hidden',
              }}>
                <IonSelect value={billFrequency} onIonChange={e => setBillFrequency(e.detail.value)}
                  interface="action-sheet" style={{ '--color': 'var(--ion-text-color)', width: '100%', paddingLeft: 14 }}>
                  <IonSelectOption value="monthly">Monthly</IonSelectOption>
                  <IonSelectOption value="yearly">Yearly</IonSelectOption>
                  <IonSelectOption value="one-time">One-time</IonSelectOption>
                </IonSelect>
              </div>
            </div>

            <IonButton expand="block" onClick={completeWithBill} disabled={saving}
              style={{ '--background': 'var(--be-green-500)', '--color': '#ffffff', '--border-radius': '14px', fontWeight: 700, height: 52, marginBottom: 12 }}>
              {saving ? 'Setting up...' : billName.trim() && billAmount ? '🎉 Finish Setup' : '🎉 Finish Setup'}
            </IonButton>
            <IonButton expand="block" fill="clear" onClick={complete} disabled={saving}
              style={{ '--color': 'var(--ion-color-medium)', height: 44 }}>
              Skip — I'll add bills later
            </IonButton>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <IonPage>
      <IonContent style={{ '--background': 'var(--ion-background-color)' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', paddingBottom: 40 }}>
          <ProgressBar />
          <div style={{ padding: '24px 0 0' }}>
            <StepDots />
            {renderStep()}
          </div>
        </div>

        <IonToast isOpen={showToast} message={toastMsg} duration={3000}
          onDidDismiss={() => setShowToast(false)} position="top" color="danger" />
      </IonContent>
    </IonPage>
  );
};

export default OnboardingPage;
