/**
 * MOCK FIRESTORE SERVICE
 * Gerçek veritabanına bağlanmadan, tamamen RAM (Memory) üzerinde Firestore davranışını simüle eder.
 * Özellikle Transaction (optimistic concurrency) mantığını test etmek için üretilmiştir.
 */

const datastore = new Map<string, any>();

// Rastgele gecikme simülatörü (Ağ gecikmesi)
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Transaction kilitleyicisi (Basit Mutex)
let transactionLock = false;

class MockTransaction {
  private writes = new Map<string, { data: any; merge?: boolean }>();

  async get(docRef: string) {
    await delay(30); // 30ms okuma süresi
    return {
      exists: () => datastore.has(docRef),
      data: () => datastore.get(docRef)
    };
  }

  set(docRef: string, data: any, options?: { merge: boolean }) {
    this.writes.set(docRef, { data, merge: options?.merge });
  }

  // İşlem bitince veritabanına yazar
  commit() {
    this.writes.forEach((val, key) => {
      if (val.merge && datastore.has(key)) {
        datastore.set(key, { ...datastore.get(key), ...val.data });
      } else {
        datastore.set(key, val.data);
      }
    });
  }
}

// Firestore'daki Optimistic Concurrency veya Pessimistic Lock simülasyonu
async function mockRunTransaction(callback: (t: MockTransaction) => Promise<void>) {
  // Başka bir transaction çalışıyorsa bekle (Race condition önleyici)
  while (transactionLock) {
    await delay(10);
  }
  transactionLock = true;
  
  try {
    const transaction = new MockTransaction();
    await callback(transaction);
    transaction.commit(); // Başarılıysa yaz
  } finally {
    transactionLock = false; // Kilidi aç
  }
}

// Normal addDoc simülasyonu (Kilitsiz, Race Condition'a açık)
async function mockAddDoc(collectionName: string, data: any): Promise<string> {
  await delay(50); // Ağ gecikmesi
  const id = `${collectionName}_${Math.random().toString(36).substring(7)}`;
  datastore.set(id, data);
  return id;
}


/**
 * 1. ESKİ YÖNTEM: Kötü (Kilitsiz) Randevu Alma Mantığı
 */
async function badCreateAppointment(user: string, startTime: number, duration: number): Promise<string> {
  const dateString = "2026-04-06";
  const dailyRef = `daily_schedules_mock_${dateString}`;
  
  // Önce o güne ait veriyi okur
  await delay(30);
  let dailyData = datastore.get(dailyRef) || { appointments: [] };
  
  const hasConflict = dailyData.appointments.some((apt: any) => {
    return startTime < (apt.startTime + apt.duration) && (startTime + duration) > apt.startTime;
  });

  if (hasConflict) {
    throw new Error(`${user} için saat dolu, işlem reddedildi!`);
  }

  // Randevuyu oluştur (Aynı anda gelen istekler üstteki okumada empty/boş görüp buraya geçer)
  const aptId = await mockAddDoc('appointments', { user, startTime, duration });
  
  dailyData.appointments.push({ appointmentId: aptId, startTime, duration });
  datastore.set(dailyRef, dailyData);
  
  return aptId;
}


/**
 * 2. YENİ YÖNTEM: İyi (Transaction'lı) Randevu Alma Mantığı
 */
async function goodCreateAppointment(user: string, startTime: number, duration: number): Promise<string> {
  const dateString = "2026-04-06";
  const dailyRef = `daily_schedules_mock_${dateString}`;
  const mockAptId = `appointments_${Math.random().toString(36).substring(7)}`;

  // Firestore transaction başlıyor
  await mockRunTransaction(async (transaction) => {
    const dailySnap = await transaction.get(dailyRef);
    let dailyAppointments: any[] = [];
    
    if (dailySnap.exists()) {
      dailyAppointments = dailySnap.data().appointments || [];
    }

    const hasConflict = dailyAppointments.some((apt: any) => {
      return startTime < (apt.startTime + apt.duration) && (startTime + duration) > apt.startTime;
    });

    if (hasConflict) {
      throw new Error(`Maalesef bu saat rezerve edildi, ${user} için işlem iptal!`);
    }

    // Çakışma yoksa ekle
    dailyAppointments.push({ appointmentId: mockAptId, startTime, duration });
    
    transaction.set(dailyRef, { appointments: dailyAppointments }, { merge: true });
    transaction.set(mockAptId, { user, startTime, duration });
  });

  return mockAptId;
}


/**
 * TEST SENARYOSU ÇALIŞTIRICI
 */
export async function runMockTest() {
  console.log("==========================================");
  console.log("🧪 LOKAL MOCK (EMULATORSÜZ) TEST BAŞLIYOR");
  console.log("==========================================");

  // Veritabanını sıfırla
  datastore.clear();

  console.log("❌ SENARYO 1: Eski Sistem (addDoc ile Kilitsiz)");
  try {
    const resultsBad = await Promise.allSettled([
      badCreateAppointment("Alice", 1400, 60), // Saat 14:00, 60 dk
      badCreateAppointment("Bob", 1400, 60)
    ]);
    
    resultsBad.forEach(res => {
      if (res.status === 'fulfilled') console.log(`🟢 Başarılı -> Randevu: ${res.value}`);
      else console.error(`🔴 Hata -> ${res.reason.message}`);
    });
    
    const dbAppointments = datastore.get("daily_schedules_mock_2026-04-06")?.appointments || [];
    console.log(`Veritabanındaki randevu sayısı: ${dbAppointments.length} (Eğer 2 ise Felaket - Race Condition oldu)`);
  } catch(e) {}


  console.log("\n------------------------------------------\n");

  // Veritabanını sıfırla
  datastore.clear();

  console.log("✅ SENARYO 2: Yeni Sistem (Transaction Kilitli)");
  try {
    const resultsGood = await Promise.allSettled([
      goodCreateAppointment("Alice", 1400, 60),
      goodCreateAppointment("Bob", 1400, 60)
    ]);
    
    resultsGood.forEach(res => {
      if (res.status === 'fulfilled') console.log(`🟢 Başarılı -> Randevu: ${res.value}`);
      else console.error(`🔴 Hata -> ${res.reason.message}`);
    });

    const dbAppointments = datastore.get("daily_schedules_mock_2026-04-06")?.appointments || [];
    console.log(`Veritabanındaki randevu sayısı: ${dbAppointments.length} (1 ise Muazzam - Transaction çalıştı!)`);

  } catch(e) {}
  
  console.log("==========================================");
}

if (typeof window !== 'undefined') {
  (window as any).runMockTest = runMockTest;
}
