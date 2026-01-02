import * as functions from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { regexExtract } from "./regexExtract";

export const parseInvoice = functions.onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new functions.HttpsError("unauthenticated", "Login required");
  }

  const { invoiceId, ocrText } = request.data as {
    invoiceId: string;
    ocrText: string;
  };

  if (!invoiceId || !ocrText) {
    throw new functions.HttpsError(
      "invalid-argument",
      "Missing invoiceId or ocrText"
    );
  }

  try {
    const invoiceRef = admin.firestore().doc(`users/${uid}/invoices/${invoiceId}`);
    const invoiceSnap = await invoiceRef.get();

    if (!invoiceSnap.exists) {
      throw new functions.HttpsError("not-found", "Invoice not found");
    }

    // Extract data using regex
    const extracted = regexExtract(ocrText);

    // Update invoice with extracted data
    await invoiceRef.update({
      vendor: extracted.vendor || admin.firestore.FieldValue.delete(),
      date: extracted.date
        ? admin.firestore.Timestamp.fromDate(new Date(extracted.date))
        : admin.firestore.FieldValue.delete(),
      total: extracted.total || admin.firestore.FieldValue.delete(),
      currency: extracted.currency || admin.firestore.FieldValue.delete(),
      "ai.status": "done",
      "ai.confidence": extracted.confidence,
      "ai.extracted": extracted,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return {
      ok: true,
      extracted,
      confidence: extracted.confidence
    };
  } catch (error: any) {
    console.error("parseInvoice error:", error);

    // Update invoice with failed status
    try {
      await admin.firestore().doc(`users/${uid}/invoices/${invoiceId}`).update({
        "ai.status": "failed",
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } catch (updateError) {
      console.error("Failed to update invoice status:", updateError);
    }

    throw new functions.HttpsError(
      "internal",
      error.message || "Parse failed"
    );
  }
});
