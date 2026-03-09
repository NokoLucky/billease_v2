import React, { useState } from 'react';
import {
  IonItemSliding, IonItem, IonItemOptions, IonItemOption,
  IonIcon, IonAlert,
} from '@ionic/react';
import { checkmarkOutline, trashOutline, createOutline } from 'ionicons/icons';
import { format, isPast } from 'date-fns';
import { Bill } from '../lib/types';
import { updateBill, deleteBill } from '../lib/firestore';
import { useAuth } from './AuthProvider';
import EditBillModal from './EditBillModal';

const categoryEmoji: Record<string, string> = {
  Housing: '🏠',
  Utilities: '⚡',
  Transportation: '🚗',
  Groceries: '🛒',
  Subscription: '📱',
  Other: '📌',
};

interface Props {
  bill: Bill;
  onUpdated: () => void;
}

const BillListItem: React.FC<Props> = ({ bill, onUpdated }) => {
  const { user } = useAuth();
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const dueDate = new Date(bill.dueDate);
  const isOverdue = !bill.isPaid && isPast(dueDate);
  const formattedDate = format(dueDate, 'MMM d, yyyy');

  const handleTogglePaid = async () => {
    if (!user) return;
    await updateBill(user.uid, bill.id, { isPaid: !bill.isPaid });
    onUpdated();
  };

  const handleDelete = async () => {
    if (!user) return;
    await deleteBill(user.uid, bill.id);
    onUpdated();
  };

  return (
    <>
      <IonItemSliding>
        {/* Swipe left → Delete */}
        <IonItemOptions side="end">
          <IonItemOption color="danger" onClick={() => setShowDeleteAlert(true)}>
            <IonIcon slot="icon-only" icon={trashOutline} />
          </IonItemOption>
          <IonItemOption color="warning" onClick={() => setShowEditModal(true)}>
            <IonIcon slot="icon-only" icon={createOutline} />
          </IonItemOption>
        </IonItemOptions>

        {/* Swipe right → Mark paid */}
        <IonItemOptions side="start">
          <IonItemOption
            color={bill.isPaid ? 'medium' : 'success'}
            onClick={handleTogglePaid}
          >
            <IonIcon slot="icon-only" icon={checkmarkOutline} />
          </IonItemOption>
        </IonItemOptions>

        <IonItem lines="none" style={{ '--background': 'transparent', '--padding-start': 0, '--inner-padding-end': 0 }}>
          <div className={`bill-item ${bill.isPaid ? 'paid' : ''}`} style={{ width: '100%' }}>
            <div className="bill-icon">
              <span style={{ fontSize: 18 }}>{categoryEmoji[bill.category] ?? '📌'}</span>
            </div>
            <div className="bill-info">
              <div className="bill-name">{bill.name}</div>
              <div className="bill-due">Due {formattedDate}</div>
              {bill.isPaid && <span className="badge-paid">Paid</span>}
              {isOverdue && <span className="badge-overdue">Overdue</span>}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="bill-amount">R {bill.amount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{bill.frequency}</div>
            </div>
          </div>
        </IonItem>
      </IonItemSliding>

      <IonAlert
        isOpen={showDeleteAlert}
        onDidDismiss={() => setShowDeleteAlert(false)}
        header="Delete Bill"
        message={`Are you sure you want to delete "${bill.name}"?`}
        buttons={[
          { text: 'Cancel', role: 'cancel' },
          { text: 'Delete', role: 'destructive', handler: handleDelete },
        ]}
      />

      <EditBillModal
        isOpen={showEditModal}
        bill={bill}
        onClose={() => setShowEditModal(false)}
        onBillUpdated={onUpdated}
      />
    </>
  );
};

export default BillListItem;
