import React, { useState } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonBackButton, IonButton, IonTextarea,
  IonToast, IonLoading, IonCheckbox, IonItem, IonLabel,
} from '@ionic/react';
import { importBillsFromText } from '../lib/api-client';
import { addBill } from '../lib/firestore';
import { useAuth } from '../components/AuthProvider';
import { ParsedBill } from '../lib/types';
import { format } from 'date-fns';

const BillImportPage: React.FC = () => {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [parsedBills, setParsedBills] = useState<ParsedBill[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [step, setStep] = useState<'input' | 'confirm'>('input');

  const handleParse = async () => {
    if (!text.trim()) return;
    setParsing(true);
    try {
      const result = await importBillsFromText({ text });
      setParsedBills(result.bills);
      setSelected(new Set(result.bills.map((_, i) => i)));
      setStep('confirm');
    } catch (e: any) {
      setToastMsg(e.message ?? 'Failed to parse bills. Please try again.');
      setShowToast(true);
    } finally {
      setParsing(false);
    }
  };

  const handleImport = async () => {
    if (!user || selected.size === 0) return;
    setSaving(true);
    try {
      const toImport = parsedBills.filter((_, i) => selected.has(i));
      await Promise.all(
        toImport.map(b =>
          addBill(user.uid, {
            name: b.name,
            amount: b.amount,
            dueDate: new Date(b.dueDate),
            category: b.category,
            frequency: b.frequency,
            isPaid: false,
          })
        )
      );
      setToastMsg(`✅ ${toImport.length} bill${toImport.length !== 1 ? 's' : ''} imported!`);
      setShowToast(true);
      setText('');
      setParsedBills([]);
      setStep('input');
    } catch (e) {
      setToastMsg('Failed to import some bills.');
      setShowToast(true);
    } finally {
      setSaving(false);
    }
  };

  const toggleSelect = (i: number) => {
    const next = new Set(selected);
    next.has(i) ? next.delete(i) : next.add(i);
    setSelected(next);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/bills" />
          </IonButtons>
          <IonTitle>Import from Notes</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent style={{ '--background': 'var(--ion-background-color)' }}>
        <div style={{ padding: '16px 16px 100px' }}>

          {step === 'input' && (
            <>
              {/* Instructions */}
              <div style={{
                background: 'var(--ion-card-background)', borderRadius: 16, padding: 16, marginBottom: 16,
                border: '1px solid var(--be-green-100)',
              }}>
                <p style={{ fontSize: 13, color: 'var(--ion-text-color)', margin: 0, lineHeight: 1.6 }}>
                  <strong>Paste any text</strong> containing your bills below — from Notes, WhatsApp, an email, or anywhere. Our AI will extract and organise them for you automatically. 🤖
                </p>
              </div>

              {/* Example */}
              <div style={{
                background: 'var(--ion-card-background)', borderRadius: 12, padding: 12, marginBottom: 16,
                border: '1px dashed var(--be-green-500)', fontSize: 12, color: 'var(--ion-color-medium)',
              }}>
                <strong style={{ color: 'var(--be-green-600)' }}>Example:</strong><br />
                Netflix R199 due 15th<br />
                Rent R8500 due 1st March<br />
                Vodacom R899 monthly
              </div>

              <IonTextarea
                value={text}
                onIonInput={e => setText(e.detail.value ?? '')}
                placeholder="Paste your bills here..."
                rows={8}
                style={{
                  '--background': 'var(--ion-card-background)',
                  '--color': 'var(--ion-text-color)',
                  '--placeholder-color': 'var(--ion-color-medium)',
                  '--border-radius': '14px',
                  '--padding-start': '14px',
                  '--padding-top': '12px',
                  border: '1px solid var(--be-border)',
                  fontSize: 14, lineHeight: 1.7,
                }}
              />

              <IonButton
                expand="block"
                onClick={handleParse}
                disabled={!text.trim() || parsing}
                style={{
                  '--background': 'var(--be-green-500)', '--color': '#ffffff',
                  '--border-radius': '14px', marginTop: 16, fontWeight: 700, height: 52,
                }}
              >
                {parsing ? 'Analysing with AI...' : '✨ Parse Bills with AI'}
              </IonButton>
            </>
          )}

          {step === 'confirm' && (
            <>
              <div style={{ marginBottom: 16 }}>
                <p className="section-title">Review Parsed Bills</p>
                <p style={{ fontSize: 13, color: 'var(--ion-color-medium)', margin: '4px 0 0' }}>
                  {parsedBills.length} bill{parsedBills.length !== 1 ? 's' : ''} found. Uncheck any you don't want to import.
                </p>
              </div>

              {parsedBills.map((bill, i) => (
                <div key={i} style={{
                  background: 'var(--ion-card-background)', borderRadius: 14, padding: '14px 16px', marginBottom: 10,
                  border: `1px solid ${selected.has(i) ? 'var(--be-green-500)' : 'var(--be-green-100)'}`,
                  opacity: selected.has(i) ? 1 : 0.5,
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <IonCheckbox
                    checked={selected.has(i)}
                    onIonChange={() => toggleSelect(i)}
                    style={{ '--checkbox-background-checked': 'var(--be-green-500)', '--border-color-checked': 'var(--be-green-500)' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ion-text-color)' }}>{bill.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--ion-color-medium)', marginTop: 2 }}>
                      {bill.category} · {bill.frequency} · Due {format(new Date(bill.dueDate), 'MMM d, yyyy')}
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--be-green-600)' }}>
                    R {bill.amount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}

              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <IonButton
                  fill="outline"
                  onClick={() => setStep('input')}
                  style={{ flex: 1, '--border-color': 'var(--be-border)', '--color': 'var(--ion-text-color)', '--border-radius': '14px', height: 50 }}
                >
                  Back
                </IonButton>
                <IonButton
                  onClick={handleImport}
                  disabled={selected.size === 0 || saving}
                  style={{ flex: 2, '--background': 'var(--be-green-500)', '--color': '#ffffff', '--border-radius': '14px', fontWeight: 700, height: 50 }}
                >
                  {saving ? 'Importing...' : `Import ${selected.size} Bill${selected.size !== 1 ? 's' : ''}`}
                </IonButton>
              </div>
            </>
          )}
        </div>

        <IonLoading isOpen={parsing} message="AI is reading your bills..." />
        <IonToast isOpen={showToast} message={toastMsg} duration={3000} onDidDismiss={() => setShowToast(false)} position="top" />
      </IonContent>
    </IonPage>
  );
};

export default BillImportPage;
