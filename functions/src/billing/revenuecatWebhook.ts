import * as functions from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

export const revenuecatWebhook = functions.onRequest(async (req, res) => {
  try {
    const event = req.body?.event;
    if (!event) {
      res.status(200).send("ok");
      return;
    }

    const uid = event.app_user_id;
    if (!uid) {
      console.warn("RevenueCat webhook: missing app_user_id");
      res.status(200).send("ok");
      return;
    }

    const type = event.type;
    const productId = event.product_id;
    const expirationAtMs = event.expiration_at_ms;
    const entitlementId = (event.entitlement_ids && event.entitlement_ids[0]) || "premium";

    // Save billing event
    await admin.firestore().collection("billingEvents").add({
      appUserId: uid,
      type,
      productId: productId || null,
      entitlementId,
      expirationAt: expirationAtMs
        ? admin.firestore.Timestamp.fromMillis(expirationAtMs)
        : null,
      raw: req.body,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Update user plan
    const plan = (type === "CANCELLATION" || !expirationAtMs) ? "free" : "premium";
    const premiumUntil = expirationAtMs
      ? admin.firestore.Timestamp.fromMillis(expirationAtMs)
      : null;

    await admin.firestore().doc(`users/${uid}`).set({
      plan,
      premiumUntil,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    console.log(`RevenueCat webhook processed: ${type} for user ${uid}`);
    res.status(200).send("ok");
  } catch (error: any) {
    console.error("revenuecatWebhook error:", error);
    res.status(500).json({ error: error.message });
  }
});
