import React from 'react';
import { db } from './firebase';
import {
  collection, addDoc, getDocs, doc, updateDoc,
  deleteDoc, Timestamp, setDoc, getDoc
} from 'firebase/firestore';
import type { Bill, BillInput, UserProfile } from './types';
import { useAuth } from '../components/AuthProvider';

// ─── Recurrence helper ───────────────────────────────────────────────────────

/**
 * Determines if a recurring bill should appear as unpaid for the current period.
 * - Monthly: resets if lastPaidDate is from a previous calendar month
 * - Yearly:  resets if lastPaidDate is from a previous calendar year
 * - One-time: never auto-resets
 *
 * This runs purely on the client — no Firestore writes needed.
 */
export const applyRecurrence = (bill: Bill): Bill => {
  if (bill.frequency === 'one-time' || !bill.isPaid || !bill.lastPaidDate) {
    return bill;
  }

  const now = new Date();
  const lastPaid = new Date(bill.lastPaidDate);

  if (bill.frequency === 'monthly') {
    const sameMonth =
      lastPaid.getFullYear() === now.getFullYear() &&
      lastPaid.getMonth() === now.getMonth();
    if (!sameMonth) return { ...bill, isPaid: false };
  }

  if (bill.frequency === 'yearly') {
    const sameYear = lastPaid.getFullYear() === now.getFullYear();
    if (!sameYear) return { ...bill, isPaid: false };
  }

  return bill;
};

// ─── Bills ───────────────────────────────────────────────────────────────────

const getBillsCollection = (userId: string) =>
  collection(db, 'users', userId, 'bills');

export const getBills = async (userId: string): Promise<Bill[]> => {
  const snapshot = await getDocs(getBillsCollection(userId));
  return snapshot.docs.map(d => {
    const data = d.data();
    const bill: Bill = {
      id: d.id,
      ...data,
      dueDate: (data.dueDate as Timestamp).toDate().toISOString(),
    } as Bill;
    return applyRecurrence(bill); // auto-reset recurring bills client-side
  });
};

export const addBill = async (userId: string, bill: BillInput) => {
  await addDoc(getBillsCollection(userId), {
    ...bill,
    dueDate: Timestamp.fromDate(bill.dueDate),
  });
};

export const updateBill = async (
  userId: string,
  billId: string,
  updates: Partial<Omit<Bill, 'id' | 'dueDate'> & { dueDate?: Date }>
) => {
  const billDoc = doc(db, 'users', userId, 'bills', billId);
  const updateData: Record<string, any> = { ...updates };
  if (updates.dueDate) updateData.dueDate = Timestamp.fromDate(updates.dueDate);

  // When marking as paid, record the date so recurrence can reset next period
  if (updates.isPaid === true && !updates.lastPaidDate) {
    updateData.lastPaidDate = new Date().toISOString();
  }
  // When manually marking as unpaid, clear lastPaidDate
  if (updates.isPaid === false) {
    updateData.lastPaidDate = null;
  }

  await updateDoc(billDoc, updateData);
};

export const deleteBill = async (userId: string, billId: string) => {
  await deleteDoc(doc(db, 'users', userId, 'bills', billId));
};

// ─── Profile ─────────────────────────────────────────────────────────────────

export const getUserProfile = async (userId: string): Promise<UserProfile> => {
  const profileDoc = await getDoc(doc(db, 'users', userId));
  if (profileDoc.exists()) {
    const data = profileDoc.data() as UserProfile;
    if (!data.notifications) {
      data.notifications = { dueSoon: true, paidConfirmation: true, savingsTips: false };
    }
    return data;
  }
  // New user — onboardingComplete is false so onboarding shows
  return {
    income: 0,
    savingsGoal: 0,
    currency: 'ZAR',
    onboardingComplete: false,
    notifications: { dueSoon: true, paidConfirmation: true, savingsTips: false },
  };
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  await setDoc(doc(db, 'users', userId), updates, { merge: true });
};

// Alias used by OnboardingPage
export const updateProfile = updateUserProfile;

// ─── Hooks ───────────────────────────────────────────────────────────────────

export const useBills = () => {
  const { user } = useAuth();
  const [bills, setBills] = React.useState<Bill[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  const refetch = React.useCallback(async () => {
    if (!user) { setBills([]); setLoading(false); return; }
    setLoading(true);
    try {
      setBills(await getBills(user.uid));
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  React.useEffect(() => {
    user ? refetch() : setLoading(false);
  }, [user, refetch]);

  return { bills, loading, error, refetch };
};

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  const refetch = React.useCallback(async () => {
    if (!user) { setProfile(null); setLoading(false); return; }
    setLoading(true);
    try {
      setProfile(await getUserProfile(user.uid));
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const update = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    await updateUserProfile(user.uid, updates);
    await refetch();
  };

  React.useEffect(() => {
    user ? refetch() : setLoading(false);
  }, [user, refetch]);

  return { profile, loading, error, refetch, update };
};
