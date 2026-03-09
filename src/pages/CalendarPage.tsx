import React, { useState } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonRefresher, IonRefresherContent, IonSkeletonText,
} from '@ionic/react';
import { useBills } from '../lib/firestore';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, isToday } from 'date-fns';
import { Bill } from '../lib/types';

const CalendarPage: React.FC = () => {
  const { bills, loading, refetch } = useBills();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMonth, setViewMonth] = useState(new Date());

  const handleRefresh = async (e: CustomEvent) => {
    await refetch();
    (e.target as HTMLIonRefresherElement).complete();
  };

  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(viewMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad start with empty days
  const startPad = monthStart.getDay(); // 0=Sun
  const paddedDays = [...Array(startPad).fill(null), ...days];

  const billsOnDay = (date: Date) =>
    bills.filter(b => isSameDay(new Date(b.dueDate), date));

  const selectedBills = selectedDate ? billsOnDay(selectedDate) : [];

  const prevMonth = () => setViewMonth(d => new Date(d.getFullYear(), d.getMonth() - 1));
  const nextMonth = () => setViewMonth(d => new Date(d.getFullYear(), d.getMonth() + 1));

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Calendar</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent style={{ '--background': 'var(--billease-green-50)' }}>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div style={{ padding: '16px' }}>
          {/* Month nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <button onClick={prevMonth} style={{ background: 'white', border: '1px solid var(--billease-green-100)', borderRadius: 10, width: 36, height: 36, fontSize: 18, cursor: 'pointer', color: 'var(--billease-green-700)' }}>‹</button>
            <span style={{ fontWeight: 800, fontSize: 17, color: '#111827' }}>{format(viewMonth, 'MMMM yyyy')}</span>
            <button onClick={nextMonth} style={{ background: 'white', border: '1px solid var(--billease-green-100)', borderRadius: 10, width: 36, height: 36, fontSize: 18, cursor: 'pointer', color: 'var(--billease-green-700)' }}>›</button>
          </div>

          {/* Day labels */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 6 }}>
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#9ca3af', padding: '4px 0' }}>{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 20 }}>
            {paddedDays.map((day, i) => {
              if (!day) return <div key={`pad-${i}`} />;
              const dayBills = billsOnDay(day);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const hasUnpaid = dayBills.some(b => !b.isPaid);
              const hasPaid = dayBills.some(b => b.isPaid);

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(isSelected ? null : day)}
                  style={{
                    background: isSelected ? 'var(--billease-green-500)' : isToday(day) ? 'var(--billease-green-100)' : 'white',
                    border: `1px solid ${isSelected ? 'var(--billease-green-500)' : 'var(--billease-green-100)'}`,
                    borderRadius: 10, padding: '8px 4px', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: isToday(day) ? 800 : 500, color: isSelected ? 'white' : '#111827' }}>
                    {format(day, 'd')}
                  </span>
                  {dayBills.length > 0 && (
                    <div style={{ display: 'flex', gap: 2 }}>
                      {hasUnpaid && <div style={{ width: 5, height: 5, borderRadius: '50%', background: isSelected ? 'white' : '#f59e0b' }} />}
                      {hasPaid && <div style={{ width: 5, height: 5, borderRadius: '50%', background: isSelected ? 'white' : 'var(--billease-green-500)' }} />}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected day bills */}
          {selectedDate && (
            <div>
              <p className="section-title">{format(selectedDate, 'EEEE, MMMM d')}</p>
              {selectedBills.length === 0 ? (
                <p style={{ color: '#9ca3af', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No bills due on this day</p>
              ) : (
                selectedBills.map(bill => (
                  <div key={bill.id} className={`bill-item ${bill.isPaid ? 'paid' : ''}`}>
                    <div className="bill-info">
                      <div className="bill-name">{bill.name}</div>
                      <div className="bill-due">{bill.category} · {bill.frequency}</div>
                      {bill.isPaid && <span className="badge-paid">Paid</span>}
                    </div>
                    <div className="bill-amount">R {bill.amount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default CalendarPage;
