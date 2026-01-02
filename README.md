# Garantiqo

AI Destekli Fatura, Abonelik ve Garanti Takibi

## 🚀 Proje Yapısı

```
garantiqo/
├── apps/
│   ├── mobile/          # React + Ionic + Capacitor (iOS/Android)
│   └── admin/           # React + MUI Admin Panel (Web)
├── functions/           # Firebase Cloud Functions (TypeScript)
├── packages/
│   └── shared/          # Ortak types, validators, i18n keys
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
└── storage.rules
```

## 📱 Teknoloji Stack

### Mobile App
- **Framework:** React + TypeScript
- **UI:** Ionic React
- **Native:** Capacitor
- **State:** Zustand
- **i18n:** i18next (15 dil)

### Admin Panel
- **Framework:** React + TypeScript
- **UI:** Material-UI (MUI)
- **Routing:** React Router

### Backend
- **Platform:** Firebase
  - Authentication (Email, Google, Apple)
  - Firestore Database
  - Cloud Storage
  - Cloud Functions (TypeScript)
  - Cloud Messaging (FCM)
  - Analytics & Crashlytics
  - Remote Config

### Monetization
- **Subscriptions:** RevenueCat
- **Ads:** Google AdMob (Capacitor plugin)

## 🛠️ Geliştirme

### Gereksinimler
- Node.js 18+
- npm/pnpm/yarn
- Xcode 15+ (iOS)
- Android Studio (Android)
- Firebase CLI

### Kurulum

```bash
# Dependencies yükle
npm install

# Mobile app geliştirme
npm run dev:mobile

# Admin panel geliştirme
npm run dev:admin

# Cloud Functions deploy
npm run deploy:functions
```

### Build

```bash
# Mobile app build
npm run build:mobile

# Admin panel build
npm run build:admin
```

## 📚 Dokümanlar

- [Geliştirme Planı (Capacitor + React)](./GELISTIRME_PLANI_CAPACITOR_REACT.md)
- [Teknik Tasarım Dokümanı](./Garantiqo_CapacitorReact_Admin_Tasarim_Teknik_Dokuman_v0.2.md)
- [Firebase Yapılandırması](./firebase.md)

## 🎯 MVP Özellikleri

- ✅ Email/Google/Apple ile giriş
- ✅ Fatura ekleme (fotoğraf/PDF)
- ✅ AI ile otomatik alan çıkarımı
- ✅ Abonelik takibi ve hatırlatmaları
- ✅ Ürün garanti takibi
- ✅ Push bildirimleri
- ✅ Premium abonelik (RevenueCat)
- ✅ Reklam desteği (AdMob)
- ✅ 15 dil desteği
- ✅ Admin panel (kullanıcı yönetimi, audit logs)

## 📄 Lisans

UNLICENSED - Private project

## 👤 Yazar

**Serkan Sentuna**
- GitHub: [@serkansentuna34](https://github.com/serkansentuna34)
- Email: serkan.sentuna@gmail.com
