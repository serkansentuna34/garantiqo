import * as functions from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { requireAdmin } from "./requireAdmin";

export const adminUserSearch = functions.onRequest(async (req, res) => {
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

    const q = String(req.query.q || "").trim().toLowerCase();
    if (!q) {
      res.status(400).json({ error: "Query parameter 'q' required" });
      return;
    }

    // Try direct UID lookup first
    const byUid = await admin.firestore().doc(`users/${q}`).get();
    if (byUid.exists) {
      // Log audit
      await admin.firestore().collection("auditLogs").add({
        actorUid: actor.uid,
        action: "USER_LOOKUP",
        targetUid: q,
        meta: { mode: "uid", query: q },
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      res.json({ results: [{ uid: q, ...byUid.data() }] });
      return;
    }

    // Email search
    const snap = await admin.firestore()
      .collection("users")
      .where("email", "==", q)
      .limit(20)
      .get();

    const results = snap.docs.map(d => ({ uid: d.id, ...d.data() }));

    // Log audit
    await admin.firestore().collection("auditLogs").add({
      actorUid: actor.uid,
      action: "USER_LOOKUP",
      targetUid: results.length > 0 ? results[0].uid : null,
      meta: { mode: "email", query: q, resultsCount: results.length },
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ results });
  } catch (error: any) {
    console.error("adminUserSearch error:", error);
    res.status(error.code === "permission-denied" ? 403 : 500).json({
      error: error.message || "Internal server error"
    });
  }
});
