// User types
export interface User {
  uid: string;
  displayName: string;
  email: string;
  createdAt: Date;
  plan: 'free' | 'premium';
  locale: string;
  currency: string;
  premiumUntil: Date | null;
  llmOptIn: boolean;
  counters: {
    invoices: number;
    subscriptions: number;
    products: number;
  };
  fcmTokens?: string[];
}

// Invoice types
export interface Invoice {
  id?: string;
  title: string;
  vendor: string;
  date: Date;
  total: number;
  currency: string;
  category: string;
  tags: string[];
  sourceType: 'photo' | 'pdf';
  storage: {
    originalPath: string;
    thumbPath?: string;
  };
  ai: {
    status: 'pending' | 'done' | 'failed';
    confidence: number;
    extracted?: {
      invoiceNo?: string;
      vendorTaxId?: string;
      items?: Array<{
        name: string;
        qty: number;
        price: number;
      }>;
      warrantyMonthsGuess?: number;
    };
  };
  linkedProductIds?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Subscription types
export interface Subscription {
  id?: string;
  serviceName: string;
  amount: number;
  currency: string;
  period: 'monthly' | 'yearly' | 'weekly';
  renewalDate: Date;
  reminderDaysBefore: number[];
  paymentMethod: 'card' | 'appstore' | 'playstore' | 'cash' | 'other';
  status: 'active' | 'paused' | 'cancelled';
  history: Array<{
    date: Date;
    amount: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

// Product types
export interface Product {
  id?: string;
  name: string;
  brand: string;
  model: string;
  serialNo?: string;
  purchaseDate: Date;
  warrantyMonths: number;
  warrantyEndDate: Date;
  linkedInvoiceId?: string;
  documents: Array<{
    type: 'warranty' | 'service';
    path: string;
    mime: string;
  }>;
  reminderDaysBefore: number[];
  createdAt: Date;
  updatedAt: Date;
}

// Admin types
export interface AdminUser {
  uid: string;
  role: 'superadmin' | 'support' | 'viewer';
  createdAt: Date;
  lastLoginAt: Date;
}

export interface AuditLog {
  id?: string;
  actorUid: string;
  action: 'USER_LOOKUP' | 'USER_SUMMARY' | 'USER_EXPORT' | 'USER_UPDATE';
  targetUid: string;
  meta: Record<string, any>;
  createdAt: Date;
}

export interface BillingEvent {
  id?: string;
  appUserId: string;
  type: 'INITIAL_PURCHASE' | 'RENEWAL' | 'CANCELLATION' | 'BILLING_ISSUE';
  productId: string;
  entitlementId: string;
  expirationAt: Date | null;
  raw: Record<string, any>;
  createdAt: Date;
}
