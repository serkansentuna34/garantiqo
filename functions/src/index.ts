import * as admin from "firebase-admin";

// Initialize Firebase Admin
admin.initializeApp();

// Export all functions
export { adminUserSearch } from "./admin/userSearch";
export { adminUserSummary } from "./admin/userSummary";
export { revenuecatWebhook } from "./billing/revenuecatWebhook";
export { parseInvoice } from "./ai/invoiceParse";
export { sendRemindersDaily } from "./notifications/sendReminders";
