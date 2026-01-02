import * as functions from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { requireAdmin } from "./requireAdmin";

export const adminUserSummary = functions.onRequest(async (req, res) => {
  try {
    // CORS headers
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');

    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    // Verify admin
    const token = (req.headers.authorization || "").replace("Bearer ", "");
    const actor = await requireAdmin(token);

    const uid = String(req.query.uid || "");
    if (!uid) {
      res.status(400).json({ error: "Query parameter 'uid' required" });
      return;
    }

    // Get user document
    const userDoc = await admin.firestore().doc(`users/${uid}`).get();
    if (!userDoc.exists) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Get counts from subcollections
    const [invoicesCount, subscriptionsCount, productsCount] = await Promise.all([
      admin.firestore().collection(`users/${uid}/invoices`).count().get(),
      admin.firestore().collection(`users/${uid}/subscriptions`).count().get(),
      admin.firestore().collection(`users/${uid}/products`).count().get()
    ]);

    // Get billing events
    const billingSnap = await admin.firestore()
      .collection("billingEvents")
      .where("appUserId", "==", uid)
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();

    const billingEvents = billingSnap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));

    // Log audit
    await admin.firestore().collection("auditLogs").add({
      actorUid: actor.uid,
      action: "USER_SUMMARY",
      targetUid: uid,
      meta: {},
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({
      user: { uid, ...userDoc.data() },
      counts: {
        invoices: invoicesCount.data().count,
        subscriptions: subscriptionsCount.data().count,
        products: productsCount.data().count
      },
      billingEvents
    });
  } catch (error: any) {
    console.error("adminUserSummary error:", error);
    res.status(error.code === "permission-denied" ? 403 : 500).json({
      error: error.message || "Internal server error"
    });
  }
});
