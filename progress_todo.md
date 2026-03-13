# eRandevu - Yapılacaklar Listesi

**Tarih:** 25 Ocak 2026  
**Durum:** Firebase bağlantısı başarılı ✅

---

## ✅ TAMAMLANAN

- [x] UI tasarımı (React + Vite)
- [x] Firebase projesi kurulumu
- [x] Firebase config (`.env.local`)
- [x] `firebase.ts` - Firebase initialization
- [x] `AuthContext.tsx` - Auth provider
- [x] `firestore.ts` - CRUD servisleri
- [x] `useFirestore.ts` - React hooks
- [x] `types/index.ts` - TypeScript tipleri

---

## 🔴 YAPILACAKLAR

### 1. Frontend-Auth Bağlantısı (Öncelik: YÜKSEK)

#### 1.1 LoginPage.tsx Güncelle
```
Dosya: src/pages/LoginPage.tsx

Yapılacak:
- [x] useAuth() hook'unu import et
- [x] Login formunu auth.login() ile bağla
- [x] Register formunu auth.register() ile bağla
- [x] Hata mesajlarını göster
- [x] Başarılı girişte /admin'e yönlendir
```

#### 1.2 Route Koruması Ekle
```
Dosya: src/App.tsx

Yapılacak:
- [x] ProtectedRoute komponenti oluştur
- [x] /admin/* rotalarını koru
- [x] Giriş yapmamış kullanıcıları /login'e yönlendir
```

---

### 2. Admin Dashboard Bağlantısı (Öncelik: YÜKSEK)

#### 2.1 İşletme Oluşturma
```
İlk giriş yapan kullanıcı için:
- [x] İşletme yoksa "İşletme Oluştur" sayfası göster
- [x] İşletme bilgilerini Firestore'a kaydet
- [x] businessId'yi user dökümanına ekle
```

#### 2.2 Dashboard Verilerini Çek
```
Dosya: src/pages/AdminDashboard.tsx

Yapılacak:
- [x] useBusiness() hook'u ile işletme bilgisi çek
- [x] useTodayAppointments() ile bugünkü randevuları çek
- [x] useDashboardStats() ile istatistikleri çek
- [x] Loading state göster
```

---

### 3. Hizmet Yönetimi (Öncelik: ORTA)

```
Dosya: src/pages/admin/ServicesPage.tsx

Yapılacak:
- [x] useServices() ile hizmetleri listele
- [x] createService() ile yeni hizmet ekle
- [x] updateService() ile düzenle
- [x] deleteService() ile sil
- [x] Form validasyonu ekle
```

---

### 4. Personel Yönetimi (Öncelik: ORTA)

#### 4.1 Personel CRUD İşlemleri
```
Dosya: src/pages/admin/StaffPage.tsx

Yapılacak:
- [x] useStaff() ile personeli listele
- [x] createStaff() ile yeni personel ekle
- [x] updateStaff() ile düzenle
- [x] deleteStaff() ile sil
- [ ] Çalışma saatleri yönetimi
```

---

### 5. Randevu Sistemi (Öncelik: YÜKSEK)

#### 5.1 Public Booking Page
```
Dosya: src/pages/BookingPage.tsx

Yapılacak:
- [x] useBusinessBySlug() ile işletme bilgisi çek
- [x] useServices() ile hizmetleri çek
- [x] useStaff() ile personeli çek
- [x] useAvailableSlots() ile müsait saatleri çek
- [x] createAppointment() ile randevu oluştur
- [x] Onay mesajı göster
```

#### 5.2 Admin Takvim
```
Dosya: src/pages/admin/SchedulePage.tsx

Yapılacak:
- [x] useRealtimeAppointments() ile real-time randevular
- [x] updateAppointmentStatus() ile durum güncelle
- [x] Takvim görünümü
```

---

### 6. Müşteri Yönetimi (Öncelik: DÜŞÜK)

```
Dosya: src/pages/admin/ClientsPage.tsx

Yapılacak:
- [x] useCustomers() ile müşterileri listele
- [x] Müşteri detayları
- [ ] Randevu geçmişi (Detaylı liste eklenecek)
```

---

### 7. WhatsApp Entegrasyonu (Öncelik: YÜKSEK)

```
Dosya: functions/src/index.ts

Yapılacak:
- [ ] Meta Business hesabı oluştur (Kullanıcı yapmalı)
- [ ] WhatsApp Business API başvurusu (Kullanıcı yapmalı)
- [ ] Phone Number ID al (Kullanıcı yapmalı)
- [ ] Access Token al (Kullanıcı yapmalı)
- [x] sendWhatsAppNotification() fonksiyonunu gerçek API ile değiştir
- [ ] Message template'leri oluştur (Meta'da onay gerekli)
- [ ] Webhook endpoint'i ayarla
```

#### WhatsApp Mesaj Tipleri
```
1. Randevu Onayı (appointment_confirmation)
2. 24 Saat Hatırlatma (appointment_reminder_24h)  
3. 1 Saat Hatırlatma (appointment_reminder_1h)
4. İptal Bildirimi (appointment_cancelled)
```

---

### 8. SMS Fallback - İletimerkezi (Öncelik: ORTA)

```
Yapılacak:
- [ ] İletimerkezi hesabı oluştur
- [ ] API credentials al
- [ ] Cloud Function'a SMS gönderme ekle
- [ ] WhatsApp başarısız → SMS mantığı
- [ ] Kota kontrolü
```

---

### 9. Firestore Security Rules (Öncelik: YÜKSEK)

```
Dosya: firestore.rules

Yapılacak:
- [ ] Test mode'dan production mode'a geç
- [ ] Rules'ları deploy et: firebase deploy --only firestore:rules
```

---

### 10. Cloud Functions Deploy (Öncelik: YÜKSEK)

```
Yapılacak:
- [ ] npm install (root for functions dependencies if any, or in src)
- [ ] firebase deploy --only functions
- [ ] Scheduler'ı aktifleştir (hatırlatmalar için)
```

---

## 📁 ÖNEMLİ DOSYALAR

| Dosya | Açıklama |
|-------|----------|
| `functions/src/index.ts` | Cloud Functions |
| `firestore.rules` | Security Rules |

---

## 🔧 KOMUTLAR

```bash
# Frontend çalıştır
cd frontend && npm run dev

# Firebase deploy (rules)
firebase deploy --only firestore:rules

# Firebase deploy (functions)
firebase deploy --only functions

# Vite cache temizle
rm -rf node_modules/.vite
```

---

## 📌 NOTLAR

1. **App.tsx'te AuthProvider şu an devre dışı** - LoginPage bağlandıktan sonra aktif et

2. **Firestore test mode'da** - 30 gün sonra production rules gerekli

3. **WhatsApp Business API** başvurusu 1-2 hafta sürebilir

4. **Pilot müşteri:** Saloon Tema (Konya)

5. **Pilot müşteri:** Fısıltı Erkek Kuoförü(Çorlu)

---

## 🎯 ÖNCELİK SIRASI

1. LoginPage → Auth bağla
2. ProtectedRoute ekle
3. Admin Dashboard → Veri çek
4. Hizmet CRUD
5. Booking Page → Randevu oluştur
6. WhatsApp entegrasyonu
7. SMS fallback