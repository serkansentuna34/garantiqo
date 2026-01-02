# Garantiqo — AI Destekli Fatura • Abonelik • Garanti Takibi (iOS/Android)  
## Capacitor + React (Mobile) + Admin Panel (Web) — Tek Dosya Tasarım & Teknik Doküman
> **Sürüm:** v0.2 (MVP + V1.1)  
> **Mobile:** React + Capacitor (iOS/Android) — **Web’e publish yok** (dev/test için web çalışır)  
> **Backend:** Firebase (Auth, Firestore, Storage, Functions, FCM, Analytics/Crashlytics, Remote Config)  
> **Monetizasyon:** RevenueCat abonelik + Google AdMob  
> **Admin:** React (Web) + Admin API (Cloud Functions + Admin SDK)  
> **AI:** On-device OCR (opsiyonel) + Cloud Functions parse/LLM (opsiyonel, opt-in)

---

## 0) Flutter Yok — Tamamen React + Capacitor
Bu doküman **Flutter içermez**. Tüm istemci tarafı:
- **React UI**
- **Capacitor** ile native iOS/Android paketleme
- Native ihtiyaçlar için Capacitor plugin’leri (Camera, Filesystem, Push, AdMob, vb.)

---

## 1) Ürün Özeti
Garantiqo; kullanıcıların **faturalarını**, **aboneliklerini** ve **ürün garanti sürelerini** tek yerde saklamasını sağlar. Fotoğraf/PDF yüklenince **AI** alan çıkarır, yaklaşan **abonelik yenileme** ve **garanti bitişi** için bildirim gönderir.  
**Free** pakette limit + reklam, **Premium** pakette sınırsız + reklamsız + gelişmiş AI/rapor/export.

---

## 2) Uygulama Modülleri & Navigasyon
### 2.1 Mobile Bottom Tabs
1. **Dashboard**
2. **Faturalar**
3. **Abonelikler**
4. **Ürünler**
5. **Ayarlar**

### 2.2 Temel Akışlar
- + Ekle: Fatura / Abonelik / Ürün
- Global Search
- Detay ekranları: belge ekle, ürün bağla, hatırlatma ayarla
- Paywall (Premium)

---

## 3) Çoklu Dil Desteği (15 Dil)
i18n: `i18next` + JSON resource dosyaları:
1) en 2) es 3) fr 4) de 5) pt 6) it 7) tr 8) ru 9) ar 10) hi 11) id 12) ja 13) ko 14) zh-Hans 15) nl  
RTL: Arapça için CSS direction + layout test.

---

## 4) Teknoloji Yığını
### 4.1 Mobile (React + Capacitor)
- React + TypeScript
- UI: **Ionic React** (önerilir) veya MUI
- State: Zustand / Redux Toolkit
- Routing: Ionic Router (React Router)
- i18n: i18next
- Firebase client SDK (auth/firestore/storage/functions/messaging)
- Offline cache: Firestore offline + IndexedDB (Dexie)
- Dosya/Medya: Camera + Filesystem + File Picker

### 4.2 Backend (Firebase)
- Auth, Firestore, Storage, Cloud Functions, FCM
- Analytics/Crashlytics
- Remote Config

### 4.3 Admin Panel (Web)
- React + TypeScript + MUI/AntD
- Firebase Auth (admin kullanıcı girişi)
- **Admin API**: Cloud Functions HTTP endpoints (Admin SDK ile)
- Audit logs, role-based access, export

---

## 5) Monorepo Önerilen Proje Yapısı
```
garantiqo/
  apps/
    mobile/                # React + Capacitor (Ionic)
    admin/                 # React admin panel
  functions/               # Firebase Cloud Functions (TS)
  packages/
    shared/                # ortak types, validators, i18n keys
  firebase.json
  firestore.indexes.json
  firestore.rules
  storage.rules
```

---

## 6) Firebase Veri Modeli (Firestore Şema)
> Kural: User kendi verisini okur. Admin erişimi **rules ile değil**, **Admin SDK** ile (Functions).

### 6.1 `/users/{uid}`
```json
{
  "displayName": "Serkan",
  "email": "x@x.com",
  "createdAt": "timestamp",
  "plan": "free|premium",
  "locale": "tr",
  "currency": "TRY",
  "premiumUntil": "timestamp|null",
  "llmOptIn": false,
  "counters": { "invoices": 0, "subscriptions": 0, "products": 0 },
  "fcmTokens": ["token1","token2"]
}
```

### 6.2 `/users/{uid}/invoices/{invoiceId}`
```json
{
  "title": "MediaMarkt Fişi",
  "vendor": "MediaMarkt",
  "date": "timestamp",
  "total": 12999.90,
  "currency": "TRY",
  "category": "Electronics",
  "tags": ["Laptop","Work"],
  "sourceType": "photo|pdf",
  "storage": { "originalPath": "...", "thumbPath": "..." },
  "ai": {
    "status": "pending|done|failed",
    "confidence": 0.86,
    "extracted": {
      "invoiceNo": "string?",
      "vendorTaxId": "string?",
      "items": [{"name":"Laptop","qty":1,"price":12999.90}],
      "warrantyMonthsGuess": 24
    }
  },
  "linkedProductIds": ["productId1"],
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### 6.3 `/users/{uid}/subscriptions/{subId}`
```json
{
  "serviceName": "Spotify",
  "amount": 59.99,
  "currency": "TRY",
  "period": "monthly|yearly|weekly",
  "renewalDate": "timestamp",
  "reminderDaysBefore": [7,3,1],
  "paymentMethod": "card|appstore|playstore|cash|other",
  "status": "active|paused|cancelled",
  "history": [{"date":"timestamp","amount":49.99}],
  "createdAt":"timestamp",
  "updatedAt":"timestamp"
}
```

### 6.4 `/users/{uid}/products/{productId}`
```json
{
  "name": "Beko Bulaşık Makinesi",
  "brand": "Beko",
  "model": "DFN 38530",
  "serialNo": "optional",
  "purchaseDate": "timestamp",
  "warrantyMonths": 24,
  "warrantyEndDate": "timestamp",
  "linkedInvoiceId": "invoiceId?",
  "documents": [
    {"type":"warranty","path":"...","mime":"application/pdf"},
    {"type":"service","path":"...","mime":"image/jpeg"}
  ],
  "reminderDaysBefore": [30,7,1],
  "createdAt":"timestamp",
  "updatedAt":"timestamp"
}
```

### 6.5 Admin koleksiyonları
#### `/adminUsers/{uid}`
```json
{ "role": "superadmin|support|viewer", "createdAt": "timestamp", "lastLoginAt": "timestamp" }
```

#### `/auditLogs/{logId}`
```json
{
  "actorUid": "adminUid",
  "action": "USER_LOOKUP|USER_SUMMARY|USER_EXPORT|USER_UPDATE",
  "targetUid": "userUid",
  "meta": { "reason":"..." },
  "createdAt": "timestamp"
}
```

#### `/billingEvents/{eventId}` (RevenueCat webhook)
```json
{
  "appUserId": "userUid",
  "type": "INITIAL_PURCHASE|RENEWAL|CANCELLATION|BILLING_ISSUE",
  "productId": "garantiqo_premium_monthly",
  "entitlementId": "premium",
  "expirationAt": "timestamp|null",
  "raw": {},
  "createdAt": "timestamp"
}
```

---

## 7) Firebase Security Rules (Özet)
### 7.1 Firestore
```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
      match /{sub=**} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
      }
    }

    // admin koleksiyonları client'tan kapalı
    match /adminUsers/{uid} { allow read, write: if false; }
    match /auditLogs/{id} { allow read, write: if false; }
    match /billingEvents/{id} { allow read, write: if false; }
  }
}
```

### 7.2 Storage
```js
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{uid}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

---

## 8) Firebase Index (firestore.indexes.json)
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
  ],
  "fieldOverrides": []
}
```

---

## 9) Cloud Functions — Kod İskeleti (TypeScript)
### 9.1 Neden Admin API şart?
Admin panelin:
- tüm kullanıcıları görebilmesi
- ödeme/event geçmişini inceleyebilmesi
- export alabilmesi  
gibi işlemler **client SDK ile asla yapılmamalı**.  
Bunlar **Cloud Functions + Admin SDK** ile yapılır.

### 9.2 Admin Yetkilendirme: Custom Claims
- Admin kullanıcılarına `admin=true` ve `role=...` claim’i verilir.
- Admin panel token’ı Functions endpoint’e yollar.
- Function token’ı doğrular, rol kontrol eder, işlem yapar, **audit log** yazar.

#### requireAdmin
```ts
import * as functions from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

export async function requireAdmin(idToken: string) {
  const decoded = await admin.auth().verifyIdToken(idToken);
  if (!decoded.admin) throw new functions.HttpsError("permission-denied", "Admin required");
  return decoded; // uid, role...
}
```

### 9.3 Admin API: User Search (HTTP)
```ts
import * as functions from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { requireAdmin } from "./requireAdmin";

export const adminUserSearch = functions.onRequest(async (req, res) => {
  try {
    const token = (req.headers.authorization || "").replace("Bearer ", "");
    const actor = await requireAdmin(token);

    const q = String(req.query.q || "").trim().toLowerCase();
    if (!q) return res.status(400).json({ error: "q required" });

    // UID direct
    const byUid = await admin.firestore().doc(`users/${q}`).get();
    if (byUid.exists) {
      await admin.firestore().collection("auditLogs").add({
        actorUid: actor.uid, action: "USER_LOOKUP", targetUid: q, meta: { mode: "uid" },
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      return res.json({ results: [{ uid: q, ...byUid.data() }] });
    }

    // Email lookup
    const snap = await admin.firestore().collection("users").where("email", "==", q).limit(20).get();
    const results = snap.docs.map(d => ({ uid: d.id, ...d.data() }));

    await admin.firestore().collection("auditLogs").add({
      actorUid: actor.uid, action: "USER_LOOKUP", targetUid: q, meta: { mode: "search" },
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return res.json({ results });
  } catch (e: any) {
    return res.status(403).json({ error: e.message || "forbidden" });
  }
});
```

### 9.4 Admin API: User Summary (Kullanım + Billing)
```ts
import * as functions from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { requireAdmin } from "./requireAdmin";

export const adminUserSummary = functions.onRequest(async (req, res) => {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  const actor = await requireAdmin(token);

  const uid = String(req.query.uid || "");
  if (!uid) return res.status(400).json({ error: "uid required" });

  const userDoc = await admin.firestore().doc(`users/${uid}`).get();
  if (!userDoc.exists) return res.status(404).json({ error: "not found" });

  const [inv, sub, prod] = await Promise.all([
    admin.firestore().collection(`users/${uid}/invoices`).count().get(),
    admin.firestore().collection(`users/${uid}/subscriptions`).count().get(),
    admin.firestore().collection(`users/${uid}/products`).count().get(),
  ]);

  const billing = await admin.firestore().collection("billingEvents")
    .where("appUserId", "==", uid)
    .orderBy("createdAt", "desc")
    .limit(50)
    .get();

  await admin.firestore().collection("auditLogs").add({
    actorUid: actor.uid, action: "USER_SUMMARY", targetUid: uid, meta: {},
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  return res.json({
    user: { uid, ...userDoc.data() },
    counts: { invoices: inv.data().count, subscriptions: sub.data().count, products: prod.data().count },
    billingEvents: billing.docs.map(d => ({ id: d.id, ...d.data() }))
  });
});
```

### 9.5 RevenueCat Webhook → billingEvents + plan sync
```ts
import * as functions from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

export const revenuecatWebhook = functions.onRequest(async (req, res) => {
  const ev = req.body?.event;
  if (!ev) return res.status(200).send("ok");

  const uid = ev.app_user_id; // Mobile: Purchases.configure(appUserID=uid)
  const type = ev.type;
  const productId = ev.product_id;
  const expirationAtMs = ev.expiration_at_ms;

  await admin.firestore().collection("billingEvents").add({
    appUserId: uid,
    type,
    productId,
    entitlementId: (ev.entitlement_ids && ev.entitlement_ids[0]) || "premium",
    expirationAt: expirationAtMs ? admin.firestore.Timestamp.fromMillis(expirationAtMs) : null,
    raw: req.body,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  const plan = (type === "CANCELLATION" || !expirationAtMs) ? "free" : "premium";
  await admin.firestore().doc(`users/${uid}`).set({
    plan,
    premiumUntil: expirationAtMs ? admin.firestore.Timestamp.fromMillis(expirationAtMs) : null,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  return res.status(200).send("ok");
});
```

---

## 10) Mobile UI — Component Tree (Ionic React)
### 10.1 App Root
- `<IonApp>`
  - `<IonReactRouter>`
    - `<AuthGate/>`
    - `<IonTabs/>` (5 tab)

### 10.2 Pages
- `DashboardPage`
  - `<MonthlySummaryCard/>`
  - `<UpcomingList/>`
  - `<AddFab/>`
- `InvoicesPage`
  - `<FilterBar/>`
  - `<InvoiceList/>` → `<InvoiceItem/>`
- `InvoiceDetailPage`
  - `<InvoiceHeader/>`
  - `<AiStatusBanner/>`
  - `<AttachmentsGallery/>`
  - `<LinkedProducts/>`
- `SubscriptionsPage` → `<SubscriptionCard/>`
- `ProductsPage` → `<ProductCard/>`
- `SettingsPage`
  - `<PlanCard/>` + `<PaywallButton/>` + `<RestoreButton/>`
  - `<LLMOptInToggle/>`
  - `<LanguagePicker/>`

---

## 11) Capacitor Plugin Haritası
- Camera: `@capacitor/camera`
- Filesystem: `@capacitor/filesystem`
- Share: `@capacitor/share`
- Push: `@capacitor/push-notifications` + FCM
- AdMob: `@capacitor-community/admob`
- Document viewer: `@capacitor-community/document-viewer` (PDF)
- OCR: community MLKit plugin veya server-side (MVP’de regex parse + manuel düzeltme ile başlanabilir)

---

## 12) RevenueCat + AdMob Entegrasyon Rehberi (Capacitor)
### 12.1 RevenueCat
- Capacitor için uygun plugin seç (native wrapper)
- Mobile’da giriş sonrası:
  - `configure(apiKey, appUserId=uid)`
  - `getOfferings()`
  - `purchase(package)`
  - `restorePurchases()`
- Premium kontrol:
  - `entitlements.active.premium` var mı?
- Server sync:
  - RevenueCat webhook → `users/{uid}.plan/premiumUntil`

### 12.2 AdMob
- Banner/Interstitial/Rewarded
- Premium’da kapat
- Sıklık Remote Config ile

---

## 13) Admin Panel (Web) — Component Tree
- `<AdminApp>`
  - `<AdminAuthGate/>`
  - `<AdminLayout/>`
    - `/dashboard`
    - `/users` (search)
    - `/users/:uid` (summary)
    - `/billing` (events)
    - `/audit-logs`
    - `/config` (opsiyon)

Admin panel **Firestore’a doğrudan bağlanmaz**; `adminUserSearch`, `adminUserSummary` gibi endpoints çağırır.

---

## 14) “Kullanıcı bilgileri, ödemeler vb. her şeye ulaşalım” — Gerçekçi Sınırlar
- **Kullanıcı bilgileri / içerikleri**: Admin API ile erişilir (Auth + Firestore + Storage metadata)
- **Ödeme durumu**: Store yerine **RevenueCat** ile izlenir:
  - abonelik aktif mi?
  - ne zaman bitecek?
  - hangi ürün?
  - iptal/renewal eventleri
- **Apple/Google tarafında “ham ödeme”** yönetimi ayrı; iade vb. store konsolundan yapılır.
  - Admin panelde sadece “not / event / durum” takibi yapılır.

---

## 15) Store Açıklamaları
### 15.1 Play Store Short
Fatura, abonelik ve garanti sürelerini tek yerde topla. AI ile tarama, akıllı hatırlatmalar.

### 15.2 Play Store Long
Garantiqo; faturalarınızı, aboneliklerinizi ve ürün garanti sürelerinizi tek bir güvenli kasada toplar. Fotoğraf veya PDF yükleyin; AI ile tarih, tutar ve satıcı bilgilerini otomatik önerir. Abonelik yenilemelerini kaçırmayın, garanti bitişlerini unutmayın.

Premium ile reklamsız kullanım, sınırsız kayıt, dışa aktarma ve gelişmiş AI analiz (opt-in) gelir.

---

## 16) AI Prompt Setleri (JSON-only)
### 16.1 Invoice Extract — TR
SYSTEM: Sadece JSON döndür. Metinde olmayanı uydurma. Tarih ISO.  
USER:
OCR:
```
{{OCR_TEXT}}
```
Şema:
```json
{
  "vendor": "string|null",
  "date": "YYYY-MM-DD|null",
  "total": "number|null",
  "currency": "TRY|USD|EUR|null",
  "invoiceNo": "string|null",
  "vendorTaxId": "string|null",
  "items": [{"name":"string","qty":"number|null","price":"number|null"}],
  "warrantyMonthsGuess": "number|null",
  "confidence": "number"
}
```

### 16.2 Subscription Normalizer — TR
Metin:
```
{{USER_TEXT}}
```
Şema:
```json
{
  "serviceName":"string|null",
  "amount":"number|null",
  "currency":"TRY|USD|EUR|null",
  "period":"monthly|yearly|weekly|null",
  "renewalDate":"YYYY-MM-DD|null",
  "confidence":"number"
}
```

---

## 17) Sprint Planı
1) Mobile shell + Auth + Tabs + i18n
2) Invoices: upload + list/detail + edit + parse callable
3) Subs + Products + warranty + docs
4) FCM reminders + AdMob + RevenueCat + webhook sync
5) Admin: search + user summary + billing events + audit logs + export

---

# ✅ Teslim: Capacitor + React (Mobile) + Admin (Web) + Firebase (Backend) için tek dosya teknik tasarım.
