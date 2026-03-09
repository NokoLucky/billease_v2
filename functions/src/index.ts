import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

// ─── Types ────────────────────────────────────────────────────────────────────

type Frequency = 'monthly' | 'yearly' | 'one-time';

interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: admin.firestore.Timestamp;
  category: string;
  isPaid: boolean;
  frequency: Frequency;
  lastPaidDate?: string;
}

// ─── Helper: advance dueDate to current period ────────────────────────────────

/**
 * Given a bill's original dueDate, return a new dueDate in the current period.
 * - Monthly: same day of month, current month/year
 * - Yearly:  same day/month, current year
 */
const getNewDueDate = (original: admin.firestore.Timestamp, frequency: Frequency): admin.firestore.Timestamp => {
  const date = original.toDate();
  const now = new Date();

  if (frequency === 'monthly') {
    // Keep same day of month, move to current month
    const newDate = new Date(now.getFullYear(), now.getMonth(), date.getDate());
    // Handle months with fewer days (e.g. 31st in February → last day)
    if (newDate.getMonth() !== now.getMonth()) {
      newDate.setDate(0); // last day of current month
    }
    return admin.firestore.Timestamp.fromDate(newDate);
  }

  if (frequency === 'yearly') {
    const newDate = new Date(now.getFullYear(), date.getMonth(), date.getDate());
    return admin.firestore.Timestamp.fromDate(newDate);
  }

  return original;
};

// ─── Scheduled Function: runs 00:05 on the 1st of every month ────────────────

export const resetRecurringBills = functions
  .runWith({ timeoutSeconds: 540, memory: '256MB' })
  .pubsub
  .schedule('5 0 1 * *')          // cron: 00:05 on 1st of every month
  .timeZone('Africa/Johannesburg') // adjust if your users are global — see note below
  .onRun(async (context) => {
    functions.logger.info('resetRecurringBills started');

    const usersSnapshot = await db.collection('users').get();
    functions.logger.info(`Processing ${usersSnapshot.size} users`);

    let totalReset = 0;
    const batch = db.batch(); // batch writes for efficiency
    let batchCount = 0;

    for (const userDoc of usersSnapshot.docs) {
      const billsSnapshot = await userDoc.ref
        .collection('bills')
        .where('frequency', 'in', ['monthly', 'yearly'])
        .where('isPaid', '==', true)
        .get();

      for (const billDoc of billsSnapshot.docs) {
        const bill = billDoc.data() as Bill;

        const shouldReset = shouldResetThisPeriod(bill);
        if (!shouldReset) continue;

        const newDueDate = getNewDueDate(bill.dueDate, bill.frequency);

        batch.update(billDoc.ref, {
          isPaid: false,
          dueDate: newDueDate,
          lastPaidDate: bill.lastPaidDate ?? null,
        });

        batchCount++;
        totalReset++;

        // Firestore batch limit is 500 — commit and start a new batch
        if (batchCount === 499) {
          await batch.commit();
          batchCount = 0;
        }
      }
    }

    // Commit any remaining writes
    if (batchCount > 0) {
      await batch.commit();
    }

    functions.logger.info(`resetRecurringBills complete — ${totalReset} bills reset`);
    return null;
  });

// ─── Helper: decide if a bill needs resetting this period ────────────────────

const shouldResetThisPeriod = (bill: Bill): boolean => {
  if (!bill.lastPaidDate) {
    // Bill is marked paid but has no lastPaidDate (legacy data) — reset it
    return true;
  }

  const now = new Date();
  const lastPaid = new Date(bill.lastPaidDate);

  if (bill.frequency === 'monthly') {
    // Reset if lastPaidDate is from a previous month
    const paidThisMonth =
      lastPaid.getFullYear() === now.getFullYear() &&
      lastPaid.getMonth() === now.getMonth();
    return !paidThisMonth;
  }

  if (bill.frequency === 'yearly') {
    // Reset if lastPaidDate is from a previous year
    return lastPaid.getFullYear() !== now.getFullYear();
  }

  return false;
};


export const manualResetRecurringBills = functions.https.onRequest(async (req, res) => {
  // Simple secret key check so random people can't trigger it
  const secret = req.query.secret || req.body.secret;
  if (secret !== 'billease-test-2024') {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  functions.logger.info('manualResetRecurringBills triggered');

  const usersSnapshot = await db.collection('users').get();
  let totalReset = 0;
  const batch = db.batch();
  let batchCount = 0;

  for (const userDoc of usersSnapshot.docs) {
    const billsSnapshot = await userDoc.ref
      .collection('bills')
      .where('frequency', 'in', ['monthly', 'yearly'])
      .where('isPaid', '==', true)
      .get();

    for (const billDoc of billsSnapshot.docs) {
      const bill = billDoc.data() as Bill;
      const shouldReset = shouldResetThisPeriod(bill);
      if (!shouldReset) continue;

      const newDueDate = getNewDueDate(bill.dueDate, bill.frequency);
      batch.update(billDoc.ref, {
        isPaid: false,
        dueDate: newDueDate,
        lastPaidDate: bill.lastPaidDate ?? null,
      });

      batchCount++;
      totalReset++;

      if (batchCount === 499) {
        await batch.commit();
        batchCount = 0;
      }
    }
  }

  if (batchCount > 0) await batch.commit();

  functions.logger.info(`Manual reset complete — ${totalReset} bills reset`);
  res.json({ success: true, billsReset: totalReset });
});
// Runs every day at 08:00 — finds bills due in the next 3 days and sends push notifications

export const sendDueSoonNotifications = functions
  .runWith({ timeoutSeconds: 300, memory: '256MB' })
  .pubsub
  .schedule('0 8 * * *')           // every day at 08:00
  .timeZone('Africa/Johannesburg')
  .onRun(async (context) => {
    functions.logger.info('sendDueSoonNotifications started');

    const now = new Date();
    const in3Days = new Date(now);
    in3Days.setDate(now.getDate() + 3);

    const usersSnapshot = await db.collection('users').get();
    let notifsSent = 0;

    for (const userDoc of usersSnapshot.docs) {
      // Get user profile to check notification preferences and FCM tokens
      const profile = userDoc.data();
      if (!profile?.notifications?.dueSoon) continue;
      const fcmTokens: string[] = profile?.fcmTokens ?? [];
      if (fcmTokens.length === 0) continue;

      // Find unpaid bills due within 3 days
      const billsSnapshot = await userDoc.ref
        .collection('bills')
        .where('isPaid', '==', false)
        .get();

      const dueSoonBills = billsSnapshot.docs
        .map(d => ({ id: d.id, ...d.data() } as Bill & { id: string }))
        .filter(bill => {
          const due = bill.dueDate.toDate();
          return due >= now && due <= in3Days;
        });

      if (dueSoonBills.length === 0) continue;

      const billNames = dueSoonBills.map(b => b.name).join(', ');
      const message = {
        notification: {
          title: '💳 Bills Due Soon',
          body: dueSoonBills.length === 1
            ? `${dueSoonBills[0].name} is due in the next 3 days`
            : `${dueSoonBills.length} bills due soon: ${billNames}`,
        },
        data: { type: 'due_soon' },
        tokens: fcmTokens,
      };

      try {
        const response = await admin.messaging().sendEachForMulticast(message);
        notifsSent += response.successCount;

        // Clean up invalid tokens
        const invalidTokens: string[] = [];
        response.responses.forEach((resp, i) => {
          if (!resp.success && resp.error?.code === 'messaging/registration-token-not-registered') {
            invalidTokens.push(fcmTokens[i]);
          }
        });
        if (invalidTokens.length > 0) {
          const validTokens = fcmTokens.filter(t => !invalidTokens.includes(t));
          await userDoc.ref.update({ fcmTokens: validTokens });
        }
      } catch (err) {
        functions.logger.error(`Failed to send notification to user ${userDoc.id}`, err);
      }
    }

    functions.logger.info(`sendDueSoonNotifications complete — ${notifsSent} sent`);
    return null;
  });
