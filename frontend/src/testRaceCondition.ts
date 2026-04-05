import { createAppointment } from './services/firestore';

/**
 * Race Condition Test Fonksiyonu
 * Aynı anda (paralel olarak) aynı saat dilimine iki farklı randevu isteği gönderir.
 * Transaction mekanizmasının çakışmayı yakalayıp yakalayamadığını konsolda gösterir.
 */
export async function runRaceConditionTest() {
  console.log("🚀 Race Condition Testi Başlıyor...");
  
  // Çakışma oluşturmak için tamamen aynı tarihi kullanıyoruz
  const targetDate = new Date();
  targetDate.setHours(14, 0, 0, 0); // 14:00
  targetDate.setDate(targetDate.getDate() + 2); // İki gün sonrası gün 14:00

  const commonData = {
    businessId: "TEST_BUSINESS_123",
    staffId: "TEST_STAFF_456",
    staffName: "Test Personeli",
    dateTime: targetDate,
    services: [
      { id: "S1", name: "Test Hizmeti", durationMinutes: 30, price: 100 } as any
    ],
    customerEmail: undefined,
    customerNote: "Race condition test notu"
  };

  const userA_Data = {
    ...commonData,
    customerName: "Alice (Müşteri A)",
    customerPhone: "05551112233",
  };

  const userB_Data = {
    ...commonData,
    customerName: "Bob (Müşteri B)",
    customerPhone: "05559998877",
  };

  console.log(`⏰ Hedeflenen Zaman: ${targetDate.toLocaleString()}`);
  console.log("⚡ Kullanıcı A ve Kullanıcı B tam olarak aynı anda randevu oluşturma butonuna basıyor...");

  try {
    // İki kullanıcının isteğini Promise.allSettled ile eş zamanlı (paralel) olarak başlatıyoruz
    const results = await Promise.allSettled([
      createAppointment(userA_Data).then(id => {
        console.log(`✅ [BAŞARILI] Alice işlemi tamamladı! Randevu ID: ${id}`);
        return id;
      }),
      createAppointment(userB_Data).then(id => {
        console.log(`✅ [BAŞARILI] Bob işlemi tamamladı! Randevu ID: ${id}`);
        return id;
      })
    ]);

    console.log("\n📊 ---------------- TEST SONUÇ RAPORU ---------------- 📊");
    
    let successCount = 0;
    let failCount = 0;

    results.forEach((res, index) => {
      const user = index === 0 ? "Alice (A)" : "Bob (B)";
      if (res.status === "fulfilled") {
        successCount++;
        console.log(`🟢 ${user}: KABUL EDİLDİ (Birinci gelen işlem)`);
      } else {
        failCount++;
        console.error(`🔴 ${user}: REDDEDİLDİ. Sebep: ${res.reason.message}`);
      }
    });

    console.log("---------------------------------------------------------");
    if (successCount === 1 && failCount === 1) {
      console.log("🎉 TEST BAŞARILI: Transaction sistemi mükemmel çalışıyor. Sadece 1 kişi randevu alabildi!");
    } else {
      console.log(`⚠️ TEST BAŞARISIZ VEYA BEKLENMEYEN DURUM: Başarılı: ${successCount}, Başarısız: ${failCount}`);
    }

  } catch (error) {
    console.error("Test sırasında beklenmeyen bir hata oluştu:", error);
  }
}

// Global window objesine ekleyerek browser konsolundan doğrudan çalıştırılmasını sağlayalım.
if (typeof window !== 'undefined') {
  (window as any).runRaceConditionTest = runRaceConditionTest;
}
