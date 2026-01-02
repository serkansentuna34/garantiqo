# Garantiqo - React + Capacitor + Admin Panel - Ayrıntılı Geliştirme Planı

## 📋 Proje Özeti
- **Mobile Platform:** iOS + Android (React + Capacitor + Ionic)
- **Admin Panel:** React + MUI/AntD (Web)
- **Backend:** Firebase (Auth, Firestore, Storage, Functions, FCM, Analytics/Crashlytics, Remote Config)
- **Monetizasyon:** RevenueCat abonelik + Google AdMob (Capacitor plugin)
- **AI:** Cloud Functions parse (Regex + LLM opsiyonel)
- **Dil Desteği:** 15 dil (i18next)
- **Firebase Proje:** garantiqo (Project ID: 1076898156160)

---

## 🎯 Geliştirme Fazları

### **FAZ 1: Monorepo & Proje Yapısı Kurulumu** (2-3 Gün)

#### 1.1 Monorepo Başlatma
- [x] Root klasörde Git repository
  ```bash
  git init
  git config user.name "Serkan Sentuna"
  git config user.email "serkan.sentuna@gmail.com"
  ```

- [x] Monorepo yapısı oluşturma:
  ```
  garantiqo/
  ├── apps/
  │   ├── mobile/          # React + Ionic + Capacitor
  │   └── admin/           # React + MUI Admin Panel
  ├── functions/           # Firebase Cloud Functions (TypeScript)
  ├── packages/
  │   └── shared/          # Ortak types, validators, i18n keys
  ├── firebase.json
  ├── firestore.rules
  ├── firestore.indexes.json
  ├── storage.rules
  ├── .gitignore
  ├── package.json         # Root workspace
  └── README.md
  ```

#### 1.2 Package Manager Seçimi
- [x] **Seçilen:** npm workspaces (native Node.js desteği)
  - Alternatif: npm workspaces / yarn workspaces

- [x] Root `package.json`:
  ```json
  {
    "name": "garantiqo-monorepo",
    "private": true,
    "workspaces": [
      "apps/*",
      "packages/*",
      "functions"
    ],
    "scripts": {
      "dev:mobile": "pnpm --filter mobile dev",
      "dev:admin": "pnpm --filter admin dev",
      "build:mobile": "pnpm --filter mobile build",
      "build:admin": "pnpm --filter admin build",
      "deploy:functions": "cd functions && npm run deploy"
    }
  }
  ```

#### 1.3 Shared Package Kurulumu
- [x] `packages/shared/` oluşturma
- [x] `packages/shared/package.json`:
  ```json
  {
    "name": "@garantiqo/shared",
    "version": "1.0.0",
    "main": "src/index.ts",
    "types": "src/index.ts"
  }
  ```

- [x] Ortak TypeScript types:
  ```typescript
  // packages/shared/src/types/index.ts
  export interface User {
    uid: string;
    displayName: string;
    email: string;
    plan: 'free' | 'premium';
    locale: string;
    currency: string;
    // ...
  }

  export interface Invoice {
    id?: string;
    title: string;
    vendor: string;
    date: Date;
    total: number;
    currency: string;
    // ...
  }

  export interface Subscription { /* ... */ }
  export interface Product { /* ... */ }
  ```

---

### **FAZ 2: Firebase Backend Kurulumu** (2-3 Gün)

#### 2.1 Firebase Console Yapılandırması
- [ ] Firebase Console'da iOS app ekleme
  - Bundle ID: `com.garantiqo.app`
  - `GoogleService-Info.plist` indirme

- [ ] Firebase Console'da Android app ekleme
  - Package name: `com.garantiqo.app`
  - `google-services.json` indirme

- [ ] Firebase Console'da Web app ekleme (Admin panel için)
  - Web config (`firebaseConfig`) kopyalama

#### 2.2 Firestore Database
- [ ] Firestore database oluşturma (Production mode)
- [ ] Security Rules uygulama (`firestore.rules`):
  ```javascript
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /users/{uid} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
        match /{sub=**} {
          allow read, write: if request.auth != null && request.auth.uid == uid;
        }
      }

      // Admin collections - client'tan kapalı
      match /adminUsers/{uid} { allow read, write: if false; }
      match /auditLogs/{id} { allow read, write: if false; }
      match /billingEvents/{id} { allow read, write: if false; }
    }
  }
  ```

- [ ] Composite Index'ler (`firestore.indexes.json`):
  ```json
  {
    "indexes": [
      {
        "collectionGroup": "invoices",
        "queryScope": "COLLECTION",
        "fields": [
          { "fieldPath": "category", "order": "ASCENDING" },
          { "fieldPath": "date", "order": "DESCENDING" }
        ]
      },
      {
        "collectionGroup": "invoices",
        "queryScope": "COLLECTION",
        "fields": [
          { "fieldPath": "vendor", "order": "ASCENDING" },
          { "fieldPath": "date", "order": "DESCENDING" }
        ]
      },
      {
        "collectionGroup": "subscriptions",
        "queryScope": "COLLECTION",
        "fields": [
          { "fieldPath": "status", "order": "ASCENDING" },
          { "fieldPath": "renewalDate", "order": "ASCENDING" }
        ]
      }
    ]
  }
  ```

#### 2.3 Firebase Storage
- [ ] Storage bucket oluşturma
- [ ] Storage Rules (`storage.rules`):
  ```javascript
  rules_version = '2';
  service firebase.storage {
    match /b/{bucket}/o {
      match /users/{uid}/{allPaths=**} {
        allow read, write: if request.auth != null
          && request.auth.uid == uid
          && request.resource.size < 10 * 1024 * 1024; // 10MB
      }
    }
  }
  ```

#### 2.4 Firebase Authentication
- [ ] Email/Password provider aktifleştirme
- [ ] Google Sign-In yapılandırma
- [ ] Apple Sign-In yapılandırma (iOS)

#### 2.5 Firebase Cloud Messaging (FCM)
- [ ] iOS: APNs key yükleme
- [ ] Android: google-services.json (otomatik)

#### 2.6 Remote Config
- [ ] Parametreler:
  ```json
  {
    "free_invoice_limit": 20,
    "free_product_limit": 10,
    "free_sub_limit": 5,
    "interstitial_daily_cap": 3,
    "paywall_variant": "A",
    "enable_llm_premium": true
  }
  ```

#### 2.7 Firebase Deploy
- [ ] `firebase.json` yapılandırması:
  ```json
  {
    "firestore": {
      "rules": "firestore.rules",
      "indexes": "firestore.indexes.json"
    },
    "storage": {
      "rules": "storage.rules"
    },
    "functions": {
      "source": "functions",
      "runtime": "nodejs18"
    }
  }
  ```

- [ ] Deploy:
  ```bash
  firebase deploy --only firestore:rules
  firebase deploy --only firestore:indexes
  firebase deploy --only storage
  ```

---

### **FAZ 3: Cloud Functions (Backend API)** (3-4 Gün)

#### 3.1 Functions Kurulumu
- [ ] Functions klasörü:
  ```bash
  cd functions
  npm init -y
  npm install firebase-admin firebase-functions
  npm install --save-dev typescript @types/node
  npx tsc --init
  ```

- [ ] TypeScript config (`tsconfig.json`):
  ```json
  {
    "compilerOptions": {
      "module": "commonjs",
      "target": "ES2019",
      "lib": ["ES2019"],
      "outDir": "lib",
      "strict": true,
      "esModuleInterop": true
    },
    "include": ["src"]
  }
  ```

- [ ] Klasör yapısı:
  ```
  functions/
  ├── src/
  │   ├── index.ts
  │   ├── admin/
  │   │   ├── requireAdmin.ts
  │   │   ├── userSearch.ts
  │   │   ├── userSummary.ts
  │   │   └── exportData.ts
  │   ├── billing/
  │   │   └── revenuecatWebhook.ts
  │   ├── ai/
  │   │   ├── invoiceParse.ts
  │   │   └── regexExtract.ts
  │   └── notifications/
  │       └── sendReminders.ts
  ├── package.json
  └── tsconfig.json
  ```

#### 3.2 Admin Auth Helper
- [ ] `src/admin/requireAdmin.ts`:
  ```typescript
  import * as functions from "firebase-functions/v2/https";
  import * as admin from "firebase-admin";

  export async function requireAdmin(idToken: string) {
    const decoded = await admin.auth().verifyIdToken(idToken);
    if (!decoded.admin) {
      throw new functions.HttpsError("permission-denied", "Admin required");
    }
    return decoded; // { uid, email, role, admin: true }
  }
  ```

#### 3.3 Admin API: User Search
- [ ] `src/admin/userSearch.ts` (dokümandaki kodu kullan)
- [ ] Export in `index.ts`:
  ```typescript
  export { adminUserSearch } from "./admin/userSearch";
  ```

#### 3.4 Admin API: User Summary
- [ ] `src/admin/userSummary.ts` (dokümandaki kodu kullan)
- [ ] Kullanıcı detayları + invoice/sub/product count + billing events

#### 3.5 RevenueCat Webhook
- [ ] `src/billing/revenuecatWebhook.ts`:
  - Event kaydetme (`billingEvents` collection)
  - User plan sync (`users/{uid}.plan`, `premiumUntil`)

#### 3.6 Invoice Parse (Callable)
- [ ] `src/ai/invoiceParse.ts`:
  ```typescript
  import * as functions from "firebase-functions/v2/https";
  import * as admin from "firebase-admin";
  import { regexExtract } from "./regexExtract";

  export const parseInvoice = functions.onCall(async (req) => {
    const uid = req.auth?.uid;
    if (!uid) throw new functions.HttpsError("unauthenticated", "Login required");

    const { invoiceId, ocrText } = req.data;
    if (!invoiceId || !ocrText) throw new functions.HttpsError("invalid-argument", "Missing data");

    const extracted = regexExtract(ocrText);

    await admin.firestore().doc(`users/${uid}/invoices/${invoiceId}`).update({
      vendor: extracted.vendor || null,
      date: extracted.date ? new Date(extracted.date) : null,
      total: extracted.total || null,
      "ai.status": "done",
      "ai.confidence": extracted.confidence,
      "ai.extracted": extracted,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { ok: true, extracted };
  });
  ```

- [ ] `src/ai/regexExtract.ts` (dokümandaki regex mantığı)

#### 3.7 Scheduled Reminders
- [ ] `src/notifications/sendReminders.ts`:
  - Günlük 09:00 scheduled function
  - Subscriptions renewal check (7/3/1 gün kala)
  - Warranty expiry check (30/7/1 gün kala)
  - FCM multicast send

#### 3.8 Deploy Functions
- [ ] `firebase deploy --only functions`

---

### **FAZ 4: Mobile App - React + Ionic + Capacitor** (2 Hafta)

#### 4.1 Ionic React App Başlatma
- [ ] `apps/mobile/` içinde:
  ```bash
  cd apps/mobile
  npm init @ionic/react garantiqo -- --type=tabs --capacitor
  ```

- [ ] Dependencies:
  ```bash
  npm install firebase zustand react-router-dom i18next react-i18next
  npm install @capacitor/camera @capacitor/filesystem @capacitor/share
  npm install @capacitor/push-notifications @capacitor-community/admob
  npm install @ionic/react @ionic/react-router
  ```

#### 4.2 Capacitor iOS/Android Ekleme
- [ ] iOS:
  ```bash
  npx cap add ios
  npx cap sync ios
  ```
  - `GoogleService-Info.plist` → `ios/App/App/`

- [ ] Android:
  ```bash
  npx cap add android
  npx cap sync android
  ```
  - `google-services.json` → `android/app/`

#### 4.3 Klasör Yapısı
```
apps/mobile/
├── src/
│   ├── App.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Invoices.tsx
│   │   ├── InvoiceDetail.tsx
│   │   ├── Subscriptions.tsx
│   │   ├── Products.tsx
│   │   └── Settings.tsx
│   ├── components/
│   │   ├── MonthlySummaryCard.tsx
│   │   ├── InvoiceItem.tsx
│   │   ├── SubscriptionCard.tsx
│   │   ├── ProductCard.tsx
│   │   ├── AddFab.tsx
│   │   └── Paywall.tsx
│   ├── services/
│   │   ├── firebase.ts
│   │   ├── auth.ts
│   │   ├── firestore.ts
│   │   └── storage.ts
│   ├── store/
│   │   ├── authStore.ts
│   │   ├── invoiceStore.ts
│   │   └── settingsStore.ts
│   ├── i18n/
│   │   ├── i18n.ts
│   │   └── locales/
│   │       ├── en.json
│   │       ├── tr.json
│   │       └── ...
│   └── theme/
│       └── variables.css
├── capacitor.config.ts
└── package.json
```

#### 4.4 Firebase SDK Setup
- [ ] `src/services/firebase.ts`:
  ```typescript
  import { initializeApp } from 'firebase/app';
  import { getAuth } from 'firebase/auth';
  import { getFirestore } from 'firebase/firestore';
  import { getStorage } from 'firebase/storage';
  import { getFunctions } from 'firebase/functions';

  const firebaseConfig = {
    apiKey: "...",
    authDomain: "garantiqo.firebaseapp.com",
    projectId: "garantiqo",
    storageBucket: "garantiqo.appspot.com",
    messagingSenderId: "1076898156160",
    appId: "..."
  };

  export const app = initializeApp(firebaseConfig);
  export const auth = getAuth(app);
  export const db = getFirestore(app);
  export const storage = getStorage(app);
  export const functions = getFunctions(app);
  ```

#### 4.5 Zustand State Management
- [ ] `src/store/authStore.ts`:
  ```typescript
  import create from 'zustand';
  import { User } from 'firebase/auth';

  interface AuthState {
    user: User | null;
    isPremium: boolean;
    setUser: (user: User | null) => void;
    setPremium: (isPremium: boolean) => void;
  }

  export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isPremium: false,
    setUser: (user) => set({ user }),
    setPremium: (isPremium) => set({ isPremium })
  }));
  ```

#### 4.6 i18next Setup
- [ ] `src/i18n/i18n.ts`:
  ```typescript
  import i18n from 'i18next';
  import { initReactI18next } from 'react-i18next';
  import en from './locales/en.json';
  import tr from './locales/tr.json';
  // ... 13 dil daha

  i18n
    .use(initReactI18next)
    .init({
      resources: { en: { translation: en }, tr: { translation: tr } },
      lng: 'tr',
      fallbackLng: 'en',
      interpolation: { escapeValue: false }
    });

  export default i18n;
  ```

- [ ] Locale JSON dosyaları (`en.json`, `tr.json`, vs.)

#### 4.7 Bottom Tabs Navigation
- [ ] `src/App.tsx`:
  ```tsx
  import { IonApp, IonRouterOutlet, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/react';
  import { IonReactRouter } from '@ionic/react-router';
  import { home, receipt, sync, cube, settings } from 'ionicons/icons';

  const App: React.FC = () => (
    <IonApp>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path="/dashboard" component={DashboardPage} />
            <Route exact path="/invoices" component={InvoicesPage} />
            <Route path="/invoices/:id" component={InvoiceDetailPage} />
            {/* ... */}
          </IonRouterOutlet>

          <IonTabBar slot="bottom">
            <IonTabButton tab="dashboard" href="/dashboard">
              <IonIcon icon={home} />
              <IonLabel>Home</IonLabel>
            </IonTabButton>
            {/* ... 4 tab daha */}
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </IonApp>
  );
  ```

---

### **FAZ 5: Authentication Modülü** (2-3 Gün)

#### 5.1 Login/Register Pages
- [ ] `src/pages/Login.tsx`:
  - Email/Password input
  - Login button
  - Google Sign-In button
  - Apple Sign-In button (iOS)
  - "Forgot Password" link
  - "Register" link

- [ ] Firebase Auth integration:
  ```typescript
  import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
  import { auth } from '../services/firebase';

  const handleEmailLogin = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    // redirect to dashboard
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    // redirect to dashboard
  };
  ```

#### 5.2 Auth State Listener
- [ ] `src/services/auth.ts`:
  ```typescript
  import { onAuthStateChanged } from 'firebase/auth';
  import { auth, db } from './firebase';
  import { doc, getDoc } from 'firebase/firestore';
  import { useAuthStore } from '../store/authStore';

  export const initAuthListener = () => {
    onAuthStateChanged(auth, async (user) => {
      useAuthStore.getState().setUser(user);

      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        const isPremium = userData?.plan === 'premium';
        useAuthStore.getState().setPremium(isPremium);
      }
    });
  };
  ```

#### 5.3 Protected Routes
- [ ] AuthGuard component
- [ ] Redirect to login if not authenticated

---

### **FAZ 6: Dashboard (Ana Sayfa)** (2 Gün)

#### 6.1 Dashboard UI Components
- [ ] `src/pages/Dashboard.tsx`:
  - Welcome back card
  - Monthly summary card (total spent, % change, budget progress)
  - Quick action cards (AI SCAN, Add Sub, Add Warranty)
  - Filter chips (All, Invoices, Subs)
  - Upcoming section (subscription renewals, warranty expiry)

#### 6.2 Firestore Real-time Listeners
- [ ] Kullanıcı faturalarını dinleme:
  ```typescript
  import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';

  const q = query(
    collection(db, `users/${uid}/invoices`),
    orderBy('date', 'desc'),
    limit(10)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const invoices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // update state
  });
  ```

---

### **FAZ 7: Faturalar (Invoices) Modülü** (3-4 Gün)

#### 7.1 Invoice List Page
- [ ] Search bar
- [ ] Filter chips
- [ ] List rendering (grouped by month)
- [ ] Swipe actions (edit, delete)

#### 7.2 Add Invoice Flow
- [ ] Camera capture (Capacitor Camera API):
  ```typescript
  import { Camera, CameraResultType } from '@capacitor/camera';

  const takePicture = async () => {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri
    });
    // upload to Firebase Storage
  };
  ```

- [ ] File picker (PDF)
- [ ] Upload to Firebase Storage:
  ```typescript
  import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

  const storageRef = ref(storage, `users/${uid}/invoices/${invoiceId}/original.jpg`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  ```

#### 7.3 AI Parse Integration
- [ ] Cloud Function `parseInvoice` çağrısı:
  ```typescript
  import { httpsCallable } from 'firebase/functions';

  const parseInvoice = httpsCallable(functions, 'parseInvoice');
  const result = await parseInvoice({ invoiceId, ocrText });
  ```

- [ ] OCR text extraction:
  - Opsiyonel: Capacitor ML Kit plugin (on-device)
  - Alternatif: Server-side OCR (Cloud Vision API)
  - MVP: Manuel text input + regex parse

#### 7.4 Invoice Detail Page
- [ ] Image viewer
- [ ] AI status banner
- [ ] Editable fields
- [ ] Linked products
- [ ] Delete action

#### 7.5 Invoice Edit/Create Form
- [ ] Form validation
- [ ] Category dropdown
- [ ] Tags multi-select
- [ ] Date picker
- [ ] Currency selector

---

### **FAZ 8: Abonelikler (Subscriptions) Modülü** (2-3 Gün)

#### 8.1 Subscription List
- [ ] Monthly total header
- [ ] Search & filter
- [ ] Card rendering (service logo, name, renewal info, amount)

#### 8.2 Add Subscription
- [ ] Form: service name, amount, period, renewal date, payment method, reminders
- [ ] Firestore create:
  ```typescript
  import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

  const docRef = await addDoc(collection(db, `users/${uid}/subscriptions`), {
    serviceName,
    amount,
    currency,
    period,
    renewalDate,
    reminderDaysBefore: [7, 3, 1],
    status: 'active',
    createdAt: serverTimestamp()
  });
  ```

#### 8.3 Subscription Detail
- [ ] Renewal countdown
- [ ] Reminder chips
- [ ] Payment history timeline
- [ ] Edit/Delete/Cancel actions

---

### **FAZ 9: Ürünler & Garanti (Products) Modülü** (2-3 Gün)

#### 9.1 Product List
- [ ] Search & filter (All, Warranties, Subscriptions)
- [ ] Card rendering (product image, brand, warranty end date, days left badge)

#### 9.2 Add Product
- [ ] Form: name, brand, model, serial, purchase date, warranty months, linked invoice, documents
- [ ] Document upload (warranty card, service records)
- [ ] Auto-calculate warranty end date

#### 9.3 Product Detail
- [ ] Product image
- [ ] Warranty info & progress bar
- [ ] Linked invoice button
- [ ] Documents gallery
- [ ] Edit/Delete actions

---

### **FAZ 10: Ayarlar (Settings) & Premium** (2 Gün)

#### 10.1 Settings Page
- [ ] User profile section (avatar, name, email)
- [ ] Plan card (Free/Premium badge)
- [ ] "Upgrade to Pro" button
- [ ] "Restore Purchases" button
- [ ] Privacy settings:
  - AI opt-in toggle (Premium only)
- [ ] General settings:
  - Language picker (15 dil)
  - Currency selector
  - Notification settings
- [ ] Export data (Premium)
- [ ] Account actions:
  - Change password
  - Delete account
  - Logout

#### 10.2 Paywall Modal
- [ ] Premium features list
- [ ] Pricing cards (Monthly/Yearly)
- [ ] Purchase button
- [ ] Terms & restore links

---

### **FAZ 11: RevenueCat & AdMob Entegrasyonu** (3-4 Gün)

#### 11.1 RevenueCat Setup
- [ ] RevenueCat hesabı oluşturma
- [ ] iOS/Android app ekleme
- [ ] Entitlement: `premium`
- [ ] Products:
  - `garantiqo_premium_monthly`
  - `garantiqo_premium_yearly`
- [ ] App Store Connect & Play Console'da in-app products

#### 11.2 Capacitor RevenueCat Plugin
- [ ] Native wrapper plugin (community / custom)
- [ ] Alternatif: Cordova RevenueCat plugin
- [ ] Configuration:
  ```typescript
  import { Purchases } from '@revenuecat/purchases-capacitor';

  await Purchases.configure({
    apiKey: 'rc_...',
    appUserID: uid
  });
  ```

#### 11.3 Purchase Flow
- [ ] Get offerings:
  ```typescript
  const offerings = await Purchases.getOfferings();
  const current = offerings.current;
  const monthlyPackage = current?.monthly;
  ```

- [ ] Purchase:
  ```typescript
  const purchaseResult = await Purchases.purchasePackage({ package: monthlyPackage });
  const isPremium = purchaseResult.customerInfo.entitlements.active['premium'] !== undefined;
  ```

- [ ] Restore:
  ```typescript
  const customerInfo = await Purchases.restorePurchases();
  ```

#### 11.4 RevenueCat Webhook
- [ ] Webhook URL: `https://us-central1-garantiqo.cloudfunctions.net/revenuecatWebhook`
- [ ] RevenueCat dashboard'da webhook ayarlama
- [ ] Test event gönderme

#### 11.5 AdMob Setup
- [ ] AdMob hesabı + app oluşturma
- [ ] Ad Units (Banner, Interstitial)
- [ ] Capacitor AdMob plugin:
  ```bash
  npm install @capacitor-community/admob
  npx cap sync
  ```

- [ ] Initialization:
  ```typescript
  import { AdMob } from '@capacitor-community/admob';

  await AdMob.initialize({
    requestTrackingAuthorization: true, // iOS
    initializeForTesting: true // Dev mode
  });
  ```

- [ ] Banner ad:
  ```typescript
  await AdMob.showBanner({
    adId: 'ca-app-pub-xxx/xxx',
    position: BannerAdPosition.BOTTOM_CENTER,
    margin: 0
  });
  ```

- [ ] Interstitial ad:
  ```typescript
  await AdMob.prepareInterstitial({ adId: 'ca-app-pub-xxx/xxx' });
  await AdMob.showInterstitial();
  ```

#### 11.6 Premium Check & Ad Logic
- [ ] Wrapper hook:
  ```typescript
  const { isPremium } = useAuthStore();

  const showAdIfFree = async () => {
    if (!isPremium) {
      await AdMob.showInterstitial();
    }
  };
  ```

- [ ] Remote Config integration (daily cap)

---

### **FAZ 12: Push Notifications (FCM)** (2-3 Gün)

#### 12.1 Capacitor Push Notifications
- [ ] Plugin:
  ```bash
  npm install @capacitor/push-notifications
  npx cap sync
  ```

- [ ] iOS: APNs key upload to Firebase
- [ ] Android: `google-services.json` (otomatik)

#### 12.2 Token Management
- [ ] Register & save token:
  ```typescript
  import { PushNotifications } from '@capacitor/push-notifications';

  await PushNotifications.requestPermissions();
  await PushNotifications.register();

  PushNotifications.addListener('registration', async (token) => {
    // Save to Firestore: users/{uid}.fcmTokens array
    await updateDoc(doc(db, 'users', uid), {
      fcmTokens: arrayUnion(token.value)
    });
  });
  ```

#### 12.3 Notification Listeners
- [ ] Foreground handler:
  ```typescript
  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('Push received:', notification);
  });
  ```

- [ ] Tap handler (deep link):
  ```typescript
  PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
    const data = notification.notification.data;
    if (data.type === 'subscription') {
      // Navigate to /subscriptions/:id
    }
  });
  ```

#### 12.4 Cloud Function Scheduler
- [ ] `sendReminders` function (günlük 09:00)
- [ ] Subscription renewal check
- [ ] Warranty expiry check
- [ ] FCM multicast send

---

### **FAZ 13: Admin Panel (Web)** (1 Hafta)

#### 13.1 Admin App Başlatma
- [ ] `apps/admin/` içinde:
  ```bash
  cd apps/admin
  npx create-react-app . --template typescript
  npm install @mui/material @emotion/react @emotion/styled
  npm install react-router-dom firebase
  ```

#### 13.2 Admin Auth
- [ ] Admin login page (email/password)
- [ ] Custom claims check:
  ```typescript
  import { auth } from './firebase';

  const user = auth.currentUser;
  const token = await user.getIdTokenResult();
  if (!token.claims.admin) {
    // redirect to unauthorized
  }
  ```

#### 13.3 Admin Layout
- [ ] Sidebar navigation:
  - Dashboard
  - Users
  - Billing Events
  - Audit Logs
  - Config
- [ ] Top bar (admin profile, logout)

#### 13.4 User Search Page
- [ ] Search input (UID/email)
- [ ] API call:
  ```typescript
  const token = await auth.currentUser?.getIdToken();
  const res = await fetch(
    `https://us-central1-garantiqo.cloudfunctions.net/adminUserSearch?q=${query}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const data = await res.json();
  ```

- [ ] Results table (name, email, plan, created date)
- [ ] Click → User detail

#### 13.5 User Detail Page
- [ ] User info card
- [ ] Counts (invoices, subs, products)
- [ ] Billing events table
- [ ] Actions: Export data, Send notification (opsiyonel)

#### 13.6 Billing Events Page
- [ ] List all RevenueCat events
- [ ] Filters: user, type, date range
- [ ] Pagination

#### 13.7 Audit Logs Page
- [ ] List all admin actions
- [ ] Filters: actor, action, target user
- [ ] Pagination

---

### **FAZ 14: Testing & QA** (1 Hafta)

#### 14.1 Unit Tests
- [ ] Firebase service functions
- [ ] Zustand stores
- [ ] Utility functions (validators, formatters)

#### 14.2 Integration Tests
- [ ] Login flow
- [ ] Add invoice flow
- [ ] Purchase flow (sandbox)

#### 14.3 Manual Testing
- [ ] iOS (Simulator + Real Device)
- [ ] Android (Emulator + Real Device)
- [ ] Dark theme
- [ ] RTL (Arabic)
- [ ] Offline mode
- [ ] Permission denials
- [ ] Low storage

#### 14.4 Performance
- [ ] Large dataset (100+ invoices)
- [ ] Image loading
- [ ] Firestore query optimization

---

### **FAZ 15: Store Hazırlığı & Deployment** (1 Hafta)

#### 15.1 iOS App Store
- [ ] App Store Connect app oluşturma
- [ ] Screenshots (6.5", 6.7", 12.9")
- [ ] App Store listing (TR/EN)
- [ ] Privacy Policy URL
- [ ] TestFlight beta
- [ ] App Review submission

#### 15.2 Google Play Store
- [ ] Play Console app oluşturma
- [ ] Screenshots (phone/tablet)
- [ ] Play Store listing (TR/EN)
- [ ] Data Safety form
- [ ] Closed testing track
- [ ] Production release (staged rollout)

#### 15.3 Build & Deploy
- [ ] iOS:
  ```bash
  npx cap sync ios
  # Xcode'da Archive → Upload to App Store Connect
  ```

- [ ] Android:
  ```bash
  npx cap sync android
  cd android
  ./gradlew bundleRelease
  # Play Console'a AAB upload
  ```

---

### **FAZ 16: Post-Launch & Monitoring** (Devam Eden)

#### 16.1 Monitoring
- [ ] Firebase Analytics dashboards
- [ ] Crashlytics (crash-free rate)
- [ ] Revenue tracking (RevenueCat)
- [ ] User feedback (ratings/reviews)

#### 16.2 Hotfixes
- [ ] Critical bug fixes
- [ ] Patch releases

#### 16.3 V1.1 Features
- [ ] Subscription price increase alerts
- [ ] Smart assistant chatbot
- [ ] Advanced AI (LLM)
- [ ] Export to Excel
- [ ] Widgets
- [ ] Biometric login
- [ ] Family sharing
- [ ] Spending insights & charts

---

## 📅 Tahmini Zaman Çizelgesi

| Faz | Süre | Kümülatif |
|-----|------|-----------|
| 1. Monorepo & Proje Yapısı | 2-3 gün | 3 gün |
| 2. Firebase Backend Setup | 2-3 gün | 6 gün |
| 3. Cloud Functions (Backend API) | 3-4 gün | 10 gün |
| 4. Mobile App Shell (React+Capacitor) | 2 hafta | 4 hafta |
| 5. Authentication | 2-3 gün | 4.5 hafta |
| 6. Dashboard | 2 gün | 5 hafta |
| 7. Faturalar Modülü | 3-4 gün | 6 hafta |
| 8. Abonelikler Modülü | 2-3 gün | 6.5 hafta |
| 9. Ürünler/Garanti Modülü | 2-3 gün | 7 hafta |
| 10. Settings & Premium | 2 gün | 7.5 hafta |
| 11. RevenueCat & AdMob | 3-4 gün | 8 hafta |
| 12. Push Notifications | 2-3 gün | 8.5 hafta |
| 13. Admin Panel | 1 hafta | 9.5 hafta |
| 14. Testing & QA | 1 hafta | 10.5 hafta |
| 15. Store Hazırlığı & Deploy | 1 hafta | 11.5 hafta |
| 16. Post-Launch | Devam Eden | - |

**Toplam MVP Süresi: ~11.5 hafta (2.5-3 ay)**

---

## 🎯 MVP Kabul Kriterleri

### Fonksiyonel
- [x] Email/Google/Apple login
- [x] Fatura ekleme (photo/PDF)
- [x] AI parse (regex + manuel düzeltme)
- [x] Abonelik CRUD & yönetimi
- [x] Ürün/garanti CRUD & yönetimi
- [x] Push notifications (subscription/warranty reminders)
- [x] Premium satın alma & restore (RevenueCat)
- [x] AdMob reklam (free plan)
- [x] 15 dil desteği (i18next)
- [x] Admin panel (user search, summary, billing, audit logs)

### Teknik
- [x] Firestore security rules aktif
- [x] Cloud Functions deployed
- [x] FCM notifications working
- [x] Crashlytics monitoring
- [x] Analytics tracking
- [x] Admin API with audit logs

---

## 🔧 Geliştirme Ortamı Gereksinimleri

### Yazılım
- Node.js: 18+
- npm/pnpm/yarn
- Xcode: 15.0+ (iOS development)
- Android Studio: 2023.1.1+ (Android development)
- Firebase CLI: 12.0+
- Capacitor CLI: 5.0+

### Hesaplar
- Firebase Console (garantiqo project)
- Apple Developer Program ($99/year)
- Google Play Console ($25 one-time)
- RevenueCat account
- AdMob account

---

## 🚀 İlk Adımlar (Hemen Başla)

1. **Git repository:**
   ```bash
   cd /Users/serkansentuna/Documents/Serkan/Garantiqo
   git init
   git config user.name "Serkan Sentuna"
   git config user.email "serkan.sentuna@gmail.com"
   ```

2. **Monorepo yapısı:**
   ```bash
   mkdir -p apps/mobile apps/admin functions packages/shared
   ```

3. **Root package.json:**
   ```bash
   npm init -y
   # workspaces ekle
   ```

4. **Firebase init:**
   ```bash
   firebase login
   firebase init
   # Firestore, Functions, Storage seç
   ```

5. **Mobile app:**
   ```bash
   cd apps/mobile
   npm init @ionic/react garantiqo -- --type=tabs --capacitor
   ```

6. **Admin app:**
   ```bash
   cd apps/admin
   npx create-react-app . --template typescript
   ```

7. **İlk commit:**
   ```bash
   git add .
   git commit -m "Initial monorepo setup: React + Capacitor + Admin + Functions"
   git remote add origin https://github.com/serkansentuna34/garantiqo.git
   git push -u origin main
   ```

---

**Hazırlayan:** Claude Code
**Tarih:** 2026-01-02
**Versiyon:** 2.0 (Capacitor + React)
**Durum:** Onay Bekliyor ✋
