import * as functions from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";

export const sendRemindersDaily = functions.onSchedule("0 9 * * *", async () => {
  const db = admin.firestore();
  const now = new Date();
  const horizon = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days ahead

  console.log(`Running daily reminders check at ${now.toISOString()}`);

  try {
    // Check subscriptions
    const subsSnap = await db.collectionGroup("subscriptions")
      .where("status", "==", "active")
      .where("renewalDate", ">=", admin.firestore.Timestamp.fromDate(now))
      .where("renewalDate", "<=", admin.firestore.Timestamp.fromDate(horizon))
      .get();

    console.log(`Found ${subsSnap.size} upcoming subscription renewals`);

    for (const subDoc of subsSnap.docs) {
      const sub = subDoc.data();
      const uid = subDoc.ref.parent.parent?.id;
      if (!uid) continue;

      const renewalDate = sub.renewalDate.toDate();
      const daysUntil = Math.ceil((renewalDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // Check if we should send reminder
      const reminderDays = sub.reminderDaysBefore || [7, 3, 1];
      if (reminderDays.includes(daysUntil)) {
        await sendNotification(uid, {
          title: "Abonelik Yenileme Hatırlatması",
          body: `${sub.serviceName} aboneliğiniz ${daysUntil} gün içinde yenilenecek (${sub.amount} ${sub.currency})`
        });
      }
    }

    // Check warranty expirations
    const prodsSnap = await db.collectionGroup("products")
      .where("warrantyEndDate", ">=", admin.firestore.Timestamp.fromDate(now))
      .where("warrantyEndDate", "<=", admin.firestore.Timestamp.fromDate(horizon))
      .get();

    console.log(`Found ${prodsSnap.size} upcoming warranty expirations`);

    for (const prodDoc of prodsSnap.docs) {
      const prod = prodDoc.data();
      const uid = prodDoc.ref.parent.parent?.id;
      if (!uid) continue;

      const warrantyEnd = prod.warrantyEndDate.toDate();
      const daysUntil = Math.ceil((warrantyEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // Check if we should send reminder
      const reminderDays = prod.reminderDaysBefore || [30, 7, 1];
      if (reminderDays.includes(daysUntil)) {
        await sendNotification(uid, {
          title: "Garanti Bitiş Hatırlatması",
          body: `${prod.name} garantiniz ${daysUntil} gün içinde sona erecek`
        });
      }
    }

    console.log("Daily reminders completed successfully");
  } catch (error) {
    console.error("sendRemindersDaily error:", error);
    throw error;
  }
});

async function sendNotification(uid: string, payload: { title: string; body: string }) {
  try {
    // Get user's FCM tokens
    const userDoc = await admin.firestore().doc(`users/${uid}`).get();
    const tokens = userDoc.data()?.fcmTokens || [];

    if (tokens.length === 0) {
      console.log(`No FCM tokens for user ${uid}`);
      return;
    }

    // Send multicast
    const message = {
      notification: {
        title: payload.title,
        body: payload.body
      },
      tokens
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(`Sent notification to user ${uid}: ${response.successCount}/${tokens.length} succeeded`);

    // Remove invalid tokens
    if (response.failureCount > 0) {
      const tokensToRemove: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success && tokens[idx]) {
          tokensToRemove.push(tokens[idx]);
        }
      });

      if (tokensToRemove.length > 0) {
        await admin.firestore().doc(`users/${uid}`).update({
          fcmTokens: admin.firestore.FieldValue.arrayRemove(...tokensToRemove)
        });
      }
    }
  } catch (error) {
    console.error(`Failed to send notification to user ${uid}:`, error);
  }
}
