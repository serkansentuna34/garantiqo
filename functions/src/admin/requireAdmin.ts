import * as functions from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

export interface AdminUser {
  uid: string;
  email: string;
  admin: boolean;
  role?: string;
}

export async function requireAdmin(idToken: string): Promise<AdminUser> {
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);

    if (!decoded.admin) {
      throw new functions.HttpsError(
        "permission-denied",
        "Admin access required"
      );
    }

    return {
      uid: decoded.uid,
      email: decoded.email || "",
      admin: decoded.admin,
      role: decoded.role
    };
  } catch (error) {
    throw new functions.HttpsError(
      "unauthenticated",
      "Invalid or expired token"
    );
  }
}
