# Garantiqo - Ayrıntılı Geliştirme Planı

## 📋 Proje Özeti
- **Platform:** iOS + Android (Flutter)
- **Backend:** Firebase (Auth, Firestore, Storage, Functions, FCM)
- **Monetizasyon:** RevenueCat + Google AdMob
- **AI:** ML Kit OCR + Cloud Functions (Regex/LLM parse)
- **Dil Desteği:** 15 dil (TR, EN, ES, FR, DE, PT, IT, RU, AR, HI, ID, JA, KO, ZH, NL)
- **Firebase Proje:** garantiqo (Project ID) - 1076898156160

---

## 🎯 Geliştirme Fazları

### **FAZ 1: Proje Altyapısı & Firebase Kurulumu** (1. Hafta)

#### 1.1 Flutter Proje Yapılandırması
- [ ] Flutter projesi başlatma (`flutter create garantiqo`)
- [ ] Klasör yapısı oluşturma:
  ```
  lib/
  ├── main.dart
  ├── app.dart
  ├── core/
  │   ├── constants/
  │   ├── theme/
  │   ├── utils/
  │   └── router/
  ├── features/
  │   ├── auth/
  │   ├── dashboard/
  │   ├── invoices/
  │   ├── subscriptions/
  │   ├── products/
  │   └── settings/
  ├── shared/
  │   ├── widgets/
  │   ├── models/
  │   └── services/
  └── l10n/ (çoklu dil)
  ```

#### 1.2 Bağımlılıklar (pubspec.yaml)
```yaml
dependencies:
  flutter:
    sdk: flutter

  # State Management
  flutter_riverpod: ^2.4.0

  # Navigation
  go_router: ^12.0.0

  # Firebase
  firebase_core: ^2.24.0
  firebase_auth: ^4.15.0
  cloud_firestore: ^4.13.0
  firebase_storage: ^11.5.0
  firebase_analytics: ^10.7.0
  firebase_crashlytics: ^3.4.0
  firebase_remote_config: ^4.3.0
  cloud_functions: ^4.5.0
  firebase_messaging: ^14.7.0

  # ML/AI
  google_ml_kit: ^0.16.0
  google_mlkit_text_recognition: ^0.11.0

  # Monetization
  purchases_flutter: ^6.0.0
  google_mobile_ads: ^4.0.0

  # UI/UX
  flutter_localizations:
    sdk: flutter
  intl: ^0.18.0

  # Image/File
  image_picker: ^1.0.0
  file_picker: ^6.0.0
  cached_network_image: ^3.3.0

  # Utils
  uuid: ^4.0.0
  timeago: ^3.5.0
  flutter_dotenv: ^5.1.0
```

#### 1.3 Firebase Yapılandırması
- [ ] Firebase Console'da iOS app ekleme
  - Bundle ID: `com.garantiqo.app`
  - `GoogleService-Info.plist` indirme
  - `ios/Runner/` içine yerleştirme

- [ ] Firebase Console'da Android app ekleme
  - Package name: `com.garantiqo.app`
  - `google-services.json` indirme
  - `android/app/` içine yerleştirme

- [ ] FlutterFire CLI ile otomatik yapılandırma:
  ```bash
  flutterfire configure --project=garantiqo
  ```

#### 1.4 Ortam Yapılandırması (Dev/Prod)
- [ ] `.env.dev` ve `.env.prod` dosyaları oluşturma
- [ ] Build flavor'ları yapılandırma
- [ ] Firebase projelerini ayırma (dev/prod)

---

### **FAZ 2: Firebase Backend Kurulumu** (1. Hafta)

#### 2.1 Firestore Database
- [ ] Firestore veritabanı oluşturma (Production mode)
- [ ] Security Rules uygulama:
  ```javascript
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /users/{uid} {
        allow read, write: if request.auth != null && request.auth.uid == uid;

        match /invoices/{id} { allow read, write: if request.auth.uid == uid; }
        match /subscriptions/{id} { allow read, write: if request.auth.uid == uid; }
        match /products/{id} { allow read, write: if request.auth.uid == uid; }
        match /jobs/{id} { allow read, write: if request.auth.uid == uid; }
      }
    }
  }
  ```

- [ ] Composite Index'leri oluşturma:
  - **Invoices:**
    - `category ASC + date DESC`
    - `vendor ASC + date DESC`
    - `ai.status ASC + updatedAt DESC`
    - `tags ARRAY + date DESC`

  - **Subscriptions:**
    - `status ASC + renewalDate ASC`
    - `period ASC + renewalDate ASC`

  - **Products:**
    - `warrantyEndDate ASC`

#### 2.2 Firebase Storage
- [ ] Storage bucket oluşturma
- [ ] Storage Rules uygulama:
  ```javascript
  rules_version = '2';
  service firebase.storage {
    match /b/{bucket}/o {
      match /users/{uid}/{allPaths=**} {
        allow read, write: if request.auth != null && request.auth.uid == uid
          && request.resource.size < 10 * 1024 * 1024; // 10MB limit
      }
    }
  }
  ```

#### 2.3 Cloud Functions Kurulumu
- [ ] Functions klasörü başlatma:
  ```bash
  cd functions
  npm init -y
  npm install firebase-admin firebase-functions@latest
  npm install --save-dev typescript @types/node
  ```

- [ ] TypeScript yapılandırması (`tsconfig.json`)
- [ ] Functions kaynak yapısı oluşturma (bkz: Doküman §8)
- [ ] Temel functions kodlama:
  - `onInvoiceCreated` (trigger)
  - `runInvoiceParse` (callable)
  - `sendRemindersDaily` (scheduled)
  - `revenuecatWebhook` (http)

- [ ] Functions deploy:
  ```bash
  firebase deploy --only functions
  ```

#### 2.4 Firebase Authentication
- [ ] Email/Password provider aktifleştirme
- [ ] Google Sign-In yapılandırma (iOS/Android)
- [ ] Apple Sign-In yapılandırma (iOS)
- [ ] Email verification ayarları

#### 2.5 Firebase Cloud Messaging (FCM)
- [ ] iOS: APNs key yükleme
- [ ] Android: FCM yapılandırması
- [ ] Notification payload şablonları hazırlama

#### 2.6 Remote Config
- [ ] Parametreler oluşturma:
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

---

### **FAZ 3: Authentication & Onboarding** (1 Hafta)

#### 3.1 Splash Screen
- [ ] App logo ve animasyon
- [ ] Firebase initialization check
- [ ] Auto-login kontrolü

#### 3.2 Login/Register Ekranları
- [ ] Login sayfası UI (tasarıma uygun - dark theme)
- [ ] Email/Password input validasyonu
- [ ] "Şifremi Unuttum" akışı
- [ ] Google Sign-In button
- [ ] Apple Sign-In button (iOS)
- [ ] "Kayıt Ol" sayfası
- [ ] Email verification akışı

#### 3.3 Auth State Management
- [ ] Riverpod auth provider
- [ ] User session yönetimi
- [ ] Auto-logout (token expiry)
- [ ] Biometric authentication (opsiyonel v1.1)

#### 3.4 Onboarding (İlk Kullanım)
- [ ] Welcome carousel (3-4 slide)
- [ ] İzin istekleri:
  - Notification permission
  - Camera permission
  - Photo library permission
- [ ] Dil seçimi
- [ ] Para birimi seçimi

---

### **FAZ 4: Core UI/UX & Navigation** (1 Hafta)

#### 4.1 Tema ve Design System
- [ ] Dark theme renk paleti (tasarıma uygun)
  - Primary: Cyan (#00BCD4)
  - Background: Dark Navy (#0F1419)
  - Card: Dark Gray (#1A2028)
- [ ] Typography (font families, sizes)
- [ ] Common widgets:
  - CustomButton
  - CustomTextField
  - CustomCard
  - LoadingIndicator
  - EmptyState
  - ErrorWidget

#### 4.2 Bottom Navigation Bar
- [ ] 5 tab yapısı:
  - Home (Dashboard)
  - Library (Faturalar)
  - Stats (Analiz) - veya boş FAB için reserved
  - Products
  - Settings
- [ ] Tab state management
- [ ] Active/inactive icon gösterimleri

#### 4.3 Navigation (go_router)
- [ ] Route yapılandırması
- [ ] Deep linking desteği
- [ ] Auth guard (protected routes)
- [ ] 404 page

#### 4.4 App Bar
- [ ] Global search button
- [ ] Profile avatar
- [ ] Notification badge

#### 4.5 Floating Action Button (FAB)
- [ ] Center FAB (AI SCAN icon)
- [ ] Bottom sheet: "Yeni Ekle"
  - Fatura (AI SCAN)
  - Abonelik
  - Ürün & Garanti

---

### **FAZ 5: Dashboard (Ana Sayfa)** (1 Hafta)

#### 5.1 Dashboard UI
- [ ] Kullanıcı karşılama (Welcome back, {name})
- [ ] Notification icon (badge)
- [ ] Monthly summary card:
  - Total spent this month
  - % change indicator
  - Monthly budget progress bar
  - Goal amount
- [ ] Quick action cards:
  - AI SCAN Extract Data
  - Add Subscription (+)
  - Add Warranty (+)
- [ ] Filter chips: All, Invoices (count), Subs (count)

#### 5.2 Upcoming Section
- [ ] "Upcoming" başlığı + "View all" link
- [ ] Kartlar:
  - Subscription renewal (yaklaşan)
  - Warranty expiry (yaklaşan)
  - Recent invoices
- [ ] Card tasarımı: icon, title, subtitle, amount/date, status badge

#### 5.3 Data Fetching
- [ ] Firestore realtime listeners
- [ ] Pull-to-refresh
- [ ] Pagination (opsiyonel)
- [ ] Loading states
- [ ] Empty state

---

### **FAZ 6: Faturalar (Invoices) Modülü** (2 Hafta)

#### 6.1 Faturalar Liste Sayfası
- [ ] Search bar (satıcı, kategori, tutar)
- [ ] Filter chips: Tümü, Bekleyen, Abonelikler, Garantiler
- [ ] Liste görünümü:
  - Icon (kategori/vendor based)
  - Vendor name
  - Date + type (Abonelik/Fatura/Alışveriş)
  - Amount + currency
  - Status badge (Ödendi/Ödenmedi)
- [ ] Tarih gruplandırması (BU AY, GEÇEN AY)
- [ ] Swipe actions (edit, delete)

#### 6.2 Fatura Ekleme - Kaynak Seçimi
- [ ] "Add Invoice" bottom sheet açma
- [ ] Seçenekler:
  - Kamera ile çek
  - Galeriden seç
  - PDF seç
- [ ] Image picker / file picker entegrasyonu

#### 6.3 AI OCR & Parse
- [ ] ML Kit Text Recognition
- [ ] OCR text extraction
- [ ] Cloud Function `runInvoiceParse` çağrısı
- [ ] Loading indicator (AI processing)
- [ ] Regex parse fallback
- [ ] LLM parse (Premium + opt-in)

#### 6.4 Fatura Önizleme & Düzenleme
- [ ] Görsel önizleme (photo/PDF viewer)
- [ ] AI extracted data gösterimi:
  - Vendor (otomatik önerilen)
  - Date (otomatik önerilen)
  - Total amount (otomatik önerilen)
  - Confidence score göstergesi
- [ ] Manuel düzeltme formu:
  - Title
  - Vendor
  - Date picker
  - Amount + currency
  - Category dropdown
  - Tags (multi-select chips)
- [ ] "Kaydet" butonu

#### 6.5 Fatura Detay Sayfası
- [ ] Header: Vendor logo/icon + name
- [ ] AI status banner (processing/done/failed)
- [ ] Meta bilgiler:
  - Invoice number
  - Date
  - Amount
  - Category
  - Tags
- [ ] Linked products section (opsiyonel)
- [ ] Attachments section (photo/PDF)
- [ ] Edit/Delete actions
- [ ] Share invoice (opsiyonel)

#### 6.6 Firestore Integration
- [ ] Create invoice document
- [ ] Upload photo/PDF to Storage
- [ ] Generate thumbnail (Cloud Function)
- [ ] Update invoice with AI data
- [ ] Listen to real-time updates
- [ ] Delete invoice + cascade Storage files

---

### **FAZ 7: Abonelikler (Subscriptions) Modülü** (1.5 Hafta)

#### 7.1 Abonelikler Liste Sayfası
- [ ] Monthly total spending header
- [ ] Search bar
- [ ] Filter chips: Tümü, Aktif, Durduruldu, İptal Edildi
- [ ] Liste kartları:
  - Service logo/icon
  - Service name
  - Renewal info (X gün kaldı / X gün sonra yenileniyor)
  - Period (Aylık Plan, Yıllık Plan)
  - Amount + currency
  - Status badge (Aktif/Durduruldu/İptal)

#### 7.2 Abonelik Ekleme
- [ ] "Add Subscription" formu:
  - Service name (autocomplete popular services)
  - Amount + currency
  - Period (monthly/yearly/weekly)
  - Renewal date picker
  - Payment method (dropdown)
  - Reminder days (multi-select: 1, 3, 7, 14, 30)
- [ ] Logo/icon seçimi (opsiyonel)
- [ ] Save & create Firestore document

#### 7.3 Abonelik Detay Sayfası
- [ ] Service logo + name
- [ ] Amount + period
- [ ] Next renewal date (countdown)
- [ ] Reminder settings (chips)
- [ ] Payment method
- [ ] Status toggle (Aktif/Durduruldu)
- [ ] Payment history (timeline)
- [ ] Actions: Edit, Delete, Cancel subscription

#### 7.4 Abonelik Hatırlatmaları
- [ ] Cloud Function scheduled job (daily 09:00)
- [ ] FCM notification gönderimi
- [ ] reminderDaysBefore kontrolü
- [ ] Notification tap → subscription detail

#### 7.5 Firestore Integration
- [ ] Create/update subscription document
- [ ] Real-time listener
- [ ] Payment history array update
- [ ] Delete subscription

---

### **FAZ 8: Ürünler & Garanti (Products) Modülü** (1.5 Hafta)

#### 8.1 Ürünler Liste Sayfası
- [ ] Search bar (product, brand)
- [ ] Filter chips: All, Warranties, Subscriptions
- [ ] Liste kartları:
  - Product image/icon
  - Product name
  - Brand + Ends date
  - Days left badge (renk kodlu: yeşil/turuncu/kırmızı/gri)
  - Type badge (WARRANTY/SUB)

#### 8.2 Ürün Ekleme
- [ ] AI SCAN option (faturadan ürün çıkarma)
- [ ] Manuel form:
  - Product name
  - Brand
  - Model
  - Serial number
  - Purchase date picker
  - Warranty duration (months)
  - Warranty end date (auto-calculated)
  - Linked invoice (dropdown)
  - Documents (photo/PDF upload)
  - Reminder days
- [ ] Save & create Firestore document

#### 8.3 Ürün Detay Sayfası
- [ ] Product image
- [ ] Name, brand, model, serial
- [ ] Warranty info:
  - Purchase date
  - Warranty duration
  - End date
  - Days left (progress bar)
- [ ] Linked invoice button
- [ ] Documents section (warranty card, service records)
- [ ] Reminder settings
- [ ] Actions: Edit, Delete, Add service record

#### 8.4 Garanti Hatırlatmaları
- [ ] Cloud Function scheduled job integration
- [ ] FCM notification
- [ ] Warranty expiry notifications (30, 7, 1 gün kala)

#### 8.5 Firestore Integration
- [ ] Create/update product document
- [ ] Upload documents to Storage
- [ ] Link invoice relationship
- [ ] Real-time listener
- [ ] Delete product + cascade Storage files

---

### **FAZ 9: Ayarlar (Settings) & Premium** (1 Hafta)

#### 9.1 Settings UI
- [ ] User profile section:
  - Avatar
  - Display name
  - Email
- [ ] Plan section:
  - Ücretsiz Plan / Premium badge
  - "Pro'ya Yükselt" button
  - "Satın Alımları Geri Yükle" button

#### 9.2 Privacy & AI Settings
- [ ] "YZ Analizine İzin Ver" toggle
  - Açıklama: Veri çıkartma doğruluğunu artırır, veriler anonimleştirilir
  - Premium only
- [ ] Gizlilik Politikası link
- [ ] Terms of Service link

#### 9.3 General Settings
- [ ] Dil seçimi (15 dil dropdown)
- [ ] Para birimi seçimi
- [ ] Notification settings
- [ ] Theme toggle (dark/light - v1.1)

#### 9.4 Export Data (Premium)
- [ ] Export to PDF
- [ ] Export to CSV
- [ ] Email export
- [ ] Share export file

#### 9.5 Account Actions
- [ ] Change password
- [ ] Delete account (confirmation dialog)
- [ ] Logout
- [ ] App version & build number

---

### **FAZ 10: RevenueCat & AdMob Entegrasyonu** (1 Hafta)

#### 10.1 RevenueCat Kurulumu
- [ ] RevenueCat hesabı oluşturma
- [ ] App oluşturma (iOS/Android)
- [ ] Entitlement tanımlama: `premium`
- [ ] Products oluşturma:
  - Monthly: `garantiqo_premium_monthly`
  - Yearly: `garantiqo_premium_yearly`
- [ ] App Store Connect & Play Console'da in-app products oluşturma

#### 10.2 Flutter SDK Entegrasyonu
- [ ] `purchases_flutter` paketi kurulumu
- [ ] RevenueCat initialization
- [ ] Offerings fetch
- [ ] Purchase flow
- [ ] Restore purchases
- [ ] Listener for entitlement changes

#### 10.3 Paywall Tasarımı
- [ ] Premium features listesi
- [ ] Pricing cards (Monthly/Yearly)
- [ ] "En Popüler" badge
- [ ] Free trial info (7 gün - opsiyonel)
- [ ] Terms & restore links
- [ ] Purchase button
- [ ] Loading & error states

#### 10.4 Firestore Sync (Webhook)
- [ ] Cloud Function `revenuecatWebhook` deployment
- [ ] RevenueCat webhook URL yapılandırması
- [ ] Event handling:
  - INITIAL_PURCHASE → plan: premium
  - RENEWAL → premiumUntil güncelleme
  - CANCELLATION → plan: free
  - EXPIRATION → plan: free

#### 10.5 AdMob Kurulumu
- [ ] AdMob hesabı oluşturma
- [ ] App ekleme (iOS/Android)
- [ ] Ad Units oluşturma:
  - Banner (dashboard, lists)
  - Interstitial (after actions)
- [ ] `google_mobile_ads` paketi kurulumu
- [ ] AdMob initialization
- [ ] Banner widget implementation
- [ ] Interstitial ad logic (daily cap)

#### 10.6 Premium Check Logic
- [ ] Riverpod provider: `isPremiumProvider`
- [ ] Remote Config entegrasyonu (limits)
- [ ] Ad visibility check: `if (!isPremium) showAd()`
- [ ] Feature gating:
  - Unlimited invoices/products/subs
  - Export functionality
  - LLM AI opt-in
  - Ad removal

---

### **FAZ 11: Bildirimler (FCM)** (3 Gün)

#### 11.1 FCM Token Yönetimi
- [ ] FCM token alma
- [ ] Token'ı Firestore'a kaydetme (`users/{uid}/tokens` subcollection)
- [ ] Token refresh handling
- [ ] Multi-device support

#### 11.2 Notification Handling
- [ ] Foreground notification handler
- [ ] Background notification handler
- [ ] Notification tap handler (deep linking)
- [ ] Local notification (scheduled reminder)

#### 11.3 Cloud Function Scheduler
- [ ] `sendRemindersDaily` function implementation
- [ ] Subscription renewal check (7, 3, 1 gün kala)
- [ ] Warranty expiry check (30, 7, 1 gün kala)
- [ ] FCM multicast send
- [ ] Error handling & retry

#### 11.4 Notification Templates
- [ ] Subscription renewal:
  - "Netflix aboneliğiniz 2 gün içinde yenilenecek (149.99 TL)"
- [ ] Warranty expiry:
  - "MacBook Pro M2 garantiniz 12 gün içinde sona erecek"
- [ ] Payment reminder
- [ ] AI processing done

---

### **FAZ 12: Çoklu Dil (i18n)** (3 Gün)

#### 12.1 ARB Dosyaları Hazırlama
- [ ] `l10n/intl_en.arb` (master)
- [ ] 14 dil için ARB dosyaları:
  - intl_es.arb (İspanyolca)
  - intl_fr.arb (Fransızca)
  - intl_de.arb (Almanca)
  - intl_pt.arb (Portekizce)
  - intl_it.arb (İtalyanca)
  - intl_tr.arb (Türkçe)
  - intl_ru.arb (Rusça)
  - intl_ar.arb (Arapça)
  - intl_hi.arb (Hintçe)
  - intl_id.arb (Endonezce)
  - intl_ja.arb (Japonca)
  - intl_ko.arb (Korece)
  - intl_zh.arb (Çince)
  - intl_nl.arb (Flemenkçe)

#### 12.2 l10n Yapılandırması
- [ ] `flutter_localizations` dependency
- [ ] `l10n.yaml` yapılandırması
- [ ] Code generation
- [ ] MaterialApp localizationsDelegates
- [ ] supportedLocales listesi

#### 12.3 RTL Desteği (Arapça)
- [ ] RTL layout testing
- [ ] Text alignment fixes
- [ ] Icon directionality
- [ ] MaterialApp directionality auto-detection

#### 12.4 Çeviri
- [ ] Professional çeviri servisi (opsiyonel: DeepL, Google Translate API)
- [ ] Context-aware string keys
- [ ] Pluralization handling
- [ ] Date/number formatting (locale-based)

---

### **FAZ 13: Testing & QA** (1.5 Hafta)

#### 13.1 Unit Tests
- [ ] Firestore CRUD operations
- [ ] Auth logic
- [ ] Data models
- [ ] Utility functions
- [ ] Validators

#### 13.2 Widget Tests
- [ ] Login page
- [ ] Dashboard widgets
- [ ] Form validations
- [ ] Button states

#### 13.3 Integration Tests
- [ ] Login → Dashboard flow
- [ ] Add invoice flow
- [ ] Purchase flow (sandbox)
- [ ] Notification handling

#### 13.4 Manual Testing
- [ ] iOS devices (iPhone 12+, iPad)
- [ ] Android devices (различные vendors)
- [ ] Dark theme consistency
- [ ] RTL layout (Arapça)
- [ ] Offline mode handling
- [ ] Permission denials
- [ ] Low storage scenarios

#### 13.5 Performance Testing
- [ ] Large dataset (100+ invoices)
- [ ] Image loading performance
- [ ] Firebase query optimization
- [ ] Memory leaks check
- [ ] Battery usage

#### 13.6 Security Testing
- [ ] Firestore rules validation
- [ ] Storage rules validation
- [ ] Auth token expiry
- [ ] Injection attacks (form inputs)

---

### **FAZ 14: Analytics & Crashlytics** (2 Gün)

#### 14.1 Firebase Analytics Events
- [ ] Screen view tracking
- [ ] User actions:
  - `invoice_added`
  - `subscription_added`
  - `product_added`
  - `premium_purchased`
  - `ai_scan_used`
  - `export_completed`
- [ ] User properties:
  - `user_plan` (free/premium)
  - `locale`
  - `onboarding_completed`

#### 14.2 Firebase Crashlytics
- [ ] Crash reporting setup
- [ ] Custom error logging
- [ ] Non-fatal error tracking
- [ ] Crash-free users monitoring

#### 14.3 Remote Config A/B Testing (Opsiyonel)
- [ ] Paywall variants
- [ ] Ad frequency experiments
- [ ] Feature flags

---

### **FAZ 15: Store Hazırlığı** (1 Hafta)

#### 15.1 App Store (iOS)
- [ ] App Store Connect hesabı
- [ ] App ID oluşturma
- [ ] Certificates & Provisioning Profiles
- [ ] App Store listing:
  - App name: Garantiqo
  - Subtitle: Fatura ve garanti belgelerini düzenle
  - Keywords: fatura, garanti, abonelik, takip, hatırlatma, kasa, gider
  - Description (TR/EN)
  - Screenshots (6.5", 6.7", 12.9")
  - App icon (1024x1024)
  - Privacy Policy URL
  - Support URL
- [ ] App Review bilgileri:
  - Demo hesap
  - Test notları
- [ ] Age rating
- [ ] In-app purchases yapılandırması
- [ ] Build upload (TestFlight)

#### 15.2 Google Play (Android)
- [ ] Google Play Console hesabı
- [ ] App oluşturma
- [ ] Play Store listing:
  - Short description
  - Full description
  - Screenshots (phone/tablet)
  - Feature graphic
  - App icon
- [ ] Data Safety form:
  - Data collection disclosure
  - Data sharing disclosure
  - Security practices
- [ ] Content rating questionnaire
- [ ] In-app products yapılandırması
- [ ] Internal testing track release
- [ ] Closed alpha/beta testing

#### 15.3 Privacy Policy & Terms
- [ ] Privacy Policy hazırlama (15 dil)
- [ ] Terms of Service hazırlama
- [ ] Web hosting (Firebase Hosting / GitHub Pages)

#### 15.4 Marketing Assets
- [ ] App icon final tasarımı
- [ ] Splash screen
- [ ] Promo video (30 sn - opsiyonel)
- [ ] Press kit

---

### **FAZ 16: Beta Testing** (2 Hafta)

#### 16.1 TestFlight (iOS)
- [ ] Internal testing (team members)
- [ ] External beta testing (50-100 kullanıcı)
- [ ] Feedback collection
- [ ] Bug fixes

#### 16.2 Google Play Closed Testing
- [ ] Internal testing
- [ ] Closed alpha release
- [ ] Closed beta release (100-500 kullanıcı)
- [ ] Feedback form
- [ ] Crash monitoring
- [ ] Bug fixes

#### 16.3 Beta Feedback Cycle
- [ ] User feedback analizi
- [ ] Priority bug fixes
- [ ] UX improvements
- [ ] Performance optimizations
- [ ] New build deployment

---

### **FAZ 17: Production Release** (1 Hafta)

#### 17.1 Final Checks
- [ ] All MVP acceptance criteria met:
  - ✅ Apple/Google/Email login
  - ✅ Fatura foto/PDF yükleme
  - ✅ AI tarih + tutar %80+ doğruluk
  - ✅ Abonelik yenileme bildirimi
  - ✅ Garanti bitiş bildirimi
  - ✅ AdMob reklam
  - ✅ Premium satın alma
- [ ] Privacy Policy live
- [ ] Support email/form aktif
- [ ] Analytics dashboard monitoring
- [ ] Crashlytics aktif

#### 17.2 iOS App Store Submission
- [ ] Final build upload
- [ ] Screenshots güncelleme
- [ ] App Review submission
- [ ] Monitoring review status

#### 17.3 Android Play Store Submission
- [ ] Production release track
- [ ] Staged rollout (10% → 50% → 100%)
- [ ] Release notes (15 dil)
- [ ] Monitoring

#### 17.4 Launch Day
- [ ] Social media announcement
- [ ] Email newsletter (beta users)
- [ ] Landing page güncelleme
- [ ] Monitoring:
  - Crash-free rate
  - DAU/MAU
  - Subscription conversions
  - Revenue

---

### **FAZ 18: Post-Launch & V1.1 Roadmap** (Devam Eden)

#### 18.1 Monitoring & Support
- [ ] Daily crash monitoring
- [ ] User feedback review (ratings, reviews)
- [ ] Support ticket handling
- [ ] Performance metrics tracking

#### 18.2 Hotfixes
- [ ] Critical bug fixes
- [ ] Patch releases

#### 18.3 V1.1 Özellikler (Doküman'da belirtilen)
- [ ] Subscription price increase alerts
- [ ] Smart assistant chatbot ("Bu ay toplam giderim?")
- [ ] Advanced AI (LLM) improvements
- [ ] Export to Excel
- [ ] Widget (iOS/Android)
- [ ] Biometric login
- [ ] Family sharing
- [ ] Receipt categorization ML model
- [ ] Spending insights & charts
- [ ] Budget goals & alerts

---

## 📅 Tahmini Zaman Çizelgesi

| Faz | Süre | Kümülatif |
|-----|------|-----------|
| 1. Proje Altyapısı | 1 hafta | 1 hafta |
| 2. Firebase Backend | 1 hafta | 2 hafta |
| 3. Auth & Onboarding | 1 hafta | 3 hafta |
| 4. Core UI/Navigation | 1 hafta | 4 hafta |
| 5. Dashboard | 1 hafta | 5 hafta |
| 6. Faturalar Modülü | 2 hafta | 7 hafta |
| 7. Abonelikler Modülü | 1.5 hafta | 8.5 hafta |
| 8. Ürünler/Garanti Modülü | 1.5 hafta | 10 hafta |
| 9. Settings & Premium | 1 hafta | 11 hafta |
| 10. RevenueCat & AdMob | 1 hafta | 12 hafta |
| 11. Bildirimler (FCM) | 3 gün | 12.5 hafta |
| 12. Çoklu Dil (i18n) | 3 gün | 13 hafta |
| 13. Testing & QA | 1.5 hafta | 14.5 hafta |
| 14. Analytics & Crashlytics | 2 gün | 15 hafta |
| 15. Store Hazırlığı | 1 hafta | 16 hafta |
| 16. Beta Testing | 2 hafta | 18 hafta |
| 17. Production Release | 1 hafta | 19 hafta |

**Toplam MVP Süresi: ~19 hafta (4.5 ay)**

---

## 🎯 Kritik Başarı Kriterleri (MVP)

### Fonksiyonel
- [x] Kullanıcı kayıt/giriş (Email, Google, Apple)
- [x] Fatura ekleme (photo/PDF)
- [x] AI OCR + parse (%80+ doğruluk)
- [x] Abonelik ekleme & yönetimi
- [x] Ürün/garanti ekleme & yönetimi
- [x] Bildirimler (7/3/1 gün kala)
- [x] Premium satın alma & restore
- [x] Reklam gösterimi (free plan)
- [x] 15 dil desteği

### Teknik
- [x] Firestore security rules aktif
- [x] Cloud Functions deployed
- [x] FCM notifications working
- [x] Crashlytics monitoring
- [x] Analytics tracking
- [x] Performance: <2s app launch
- [x] Crash-free rate: >99%

### İş
- [x] Privacy Policy yayınlandı
- [x] App Store & Play Store onayı
- [x] RevenueCat webhook aktif
- [x] AdMob revenue tracking

---

## 🔧 Geliştirme Ortamı Gereksinimleri

### Yazılım
- Flutter SDK: 3.16.0+
- Dart: 3.2.0+
- Xcode: 15.0+ (iOS)
- Android Studio: 2023.1.1+ (Android)
- Node.js: 18+ (Cloud Functions)
- Firebase CLI: 12.0+
- CocoaPods: 1.14+ (iOS)

### Hesaplar
- Firebase Console (garantiqo project)
- Apple Developer Program ($99/year)
- Google Play Console ($25 one-time)
- RevenueCat (free tier → growth plan)
- AdMob account

### Donanım
- macOS (iOS development için gerekli)
- iOS device (testing)
- Android device (testing)

---

## 📝 Notlar & Öneriler

### Öncelikler
1. **MVP'yi hızlı tamamla:** 4.5 ay hedefi için agile yaklaşım
2. **Erken test et:** Her modül tamamlandıkça test
3. **Incremental deploy:** Cloud Functions her güncellemede deploy
4. **Beta feedback:** Kullanıcı geri bildirimi kritik

### Riskler & Mitigasyon
| Risk | Etki | Mitigasyon |
|------|------|------------|
| OCR doğruluğu düşük | Yüksek | Fallback manuel edit, LLM premium |
| App Store red | Yüksek | Privacy policy detaylı, demo hesap |
| Firebase maliyeti | Orta | Blaze plan limits, monitoring |
| Çeviri kalitesi | Orta | Professional service kullan |

### Optimizasyon Önerileri
- **Firestore:** Composite index'leri erken oluştur
- **Storage:** Image compression (thumbnail generation)
- **Functions:** Cold start için min instances (production)
- **UI:** Lazy loading, pagination
- **Cache:** Offline-first architecture (v1.1)

---

## 🚀 İlk Adımlar (Hemen Başla)

1. **Flutter proje oluştur:**
   ```bash
   flutter create garantiqo
   cd garantiqo
   ```

2. **Firebase kurulumu:**
   ```bash
   npm install -g firebase-tools
   firebase login
   flutterfire configure --project=garantiqo
   ```

3. **Dependencies ekle:**
   - `pubspec.yaml` düzenle (yukarıdaki listeyi kullan)
   - `flutter pub get`

4. **Klasör yapısını oluştur:**
   - `lib/` altında `features/`, `core/`, `shared/` klasörleri

5. **İlk commit:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Project setup"
   ```

---

**Hazırlayan:** Claude Code
**Tarih:** 2026-01-02
**Versiyon:** 1.0
**Durum:** Onay Bekliyor ✋
