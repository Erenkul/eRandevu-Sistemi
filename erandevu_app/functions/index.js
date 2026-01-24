/**
 * eRandevu Cloud Functions
 * 
 * Firebase Cloud Functions for:
 * - WhatsApp notification webhook
 * - Appointment reminders
 * - Business analytics
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.firestore();

/**
 * Yeni randevu oluşturulduğunda tetiklenir
 * WhatsApp API entegrasyonu için webhook
 */
exports.onAppointmentCreated = functions.firestore
    .document('appointments/{appointmentId}')
    .onCreate(async (snap, context) => {
        const appointment = snap.data();
        const appointmentId = context.params.appointmentId;

        console.log(`New appointment created: ${appointmentId}`);

        // WhatsApp bildirimi gönder (placeholder)
        if (appointment.whatsappReminderEnabled) {
            await sendWhatsAppNotification({
                phone: appointment.customerPhone,
                type: 'appointment_confirmation',
                data: {
                    customerName: appointment.customerName,
                    businessId: appointment.businessId,
                    dateTime: appointment.dateTime.toDate(),
                    services: appointment.services,
                    staffName: appointment.staffName,
                    totalPrice: appointment.totalPrice,
                }
            });
        }

        return null;
    });

/**
 * Randevu durumu değiştiğinde tetiklenir
 */
exports.onAppointmentUpdated = functions.firestore
    .document('appointments/{appointmentId}')
    .onUpdate(async (change, context) => {
        const before = change.before.data();
        const after = change.after.data();
        const appointmentId = context.params.appointmentId;

        // Durum değişikliği kontrolü
        if (before.status !== after.status) {
            console.log(`Appointment ${appointmentId} status changed: ${before.status} -> ${after.status}`);

            // İptal edildi bildirimi
            if (after.status === 'cancelled') {
                await sendWhatsAppNotification({
                    phone: after.customerPhone,
                    type: 'appointment_cancelled',
                    data: {
                        customerName: after.customerName,
                        dateTime: after.dateTime.toDate(),
                        reason: after.cancellationReason,
                    }
                });
            }

            // Onaylandı bildirimi
            if (after.status === 'confirmed' && before.status === 'pending') {
                await sendWhatsAppNotification({
                    phone: after.customerPhone,
                    type: 'appointment_confirmed',
                    data: {
                        customerName: after.customerName,
                        dateTime: after.dateTime.toDate(),
                    }
                });
            }
        }

        return null;
    });

/**
 * Hatırlatma göndermek için zamanlanmış fonksiyon
 * Her 15 dakikada bir çalışır
 */
exports.sendAppointmentReminders = functions.pubsub
    .schedule('every 15 minutes')
    .onRun(async (context) => {
        const now = new Date();
        const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
        const oneHourFifteenMinsFromNow = new Date(now.getTime() + 75 * 60 * 1000);

        // 1 saat sonraki randevuları bul
        const appointments = await db.collection('appointments')
            .where('dateTime', '>=', admin.firestore.Timestamp.fromDate(oneHourFromNow))
            .where('dateTime', '<', admin.firestore.Timestamp.fromDate(oneHourFifteenMinsFromNow))
            .where('status', 'in', ['pending', 'confirmed'])
            .where('whatsappReminderEnabled', '==', true)
            .where('whatsappReminderSent', '==', false)
            .get();

        console.log(`Found ${appointments.size} appointments to remind`);

        const batch = db.batch();

        for (const doc of appointments.docs) {
            const appointment = doc.data();

            // WhatsApp hatırlatma gönder
            await sendWhatsAppNotification({
                phone: appointment.customerPhone,
                type: 'appointment_reminder',
                data: {
                    customerName: appointment.customerName,
                    dateTime: appointment.dateTime.toDate(),
                    staffName: appointment.staffName,
                }
            });

            // Hatırlatma gönderildi olarak işaretle
            batch.update(doc.ref, { whatsappReminderSent: true });
        }

        await batch.commit();

        return null;
    });

/**
 * Günlük istatistikleri hesapla
 * Her gün gece yarısı çalışır
 */
exports.calculateDailyStats = functions.pubsub
    .schedule('0 0 * * *')
    .timeZone('Europe/Istanbul')
    .onRun(async (context) => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        const endOfYesterday = new Date(yesterday);
        endOfYesterday.setHours(23, 59, 59, 999);

        // Tüm işletmeleri al
        const businesses = await db.collection('businesses').get();

        for (const businessDoc of businesses.docs) {
            const businessId = businessDoc.id;

            // Günlük randevuları al
            const appointments = await db.collection('appointments')
                .where('businessId', '==', businessId)
                .where('dateTime', '>=', admin.firestore.Timestamp.fromDate(yesterday))
                .where('dateTime', '<=', admin.firestore.Timestamp.fromDate(endOfYesterday))
                .get();

            // İstatistikleri hesapla
            let totalRevenue = 0;
            let completedCount = 0;
            let cancelledCount = 0;

            appointments.docs.forEach(doc => {
                const apt = doc.data();
                if (apt.status === 'completed') {
                    totalRevenue += apt.totalPrice;
                    completedCount++;
                } else if (apt.status === 'cancelled') {
                    cancelledCount++;
                }
            });

            // Günlük istatistiği kaydet
            await db.collection('businesses').doc(businessId)
                .collection('dailyStats')
                .doc(yesterday.toISOString().split('T')[0])
                .set({
                    date: admin.firestore.Timestamp.fromDate(yesterday),
                    totalRevenue,
                    appointmentCount: appointments.size,
                    completedCount,
                    cancelledCount,
                    averageRevenue: completedCount > 0 ? totalRevenue / completedCount : 0,
                });

            console.log(`Stats calculated for business ${businessId}`);
        }

        return null;
    });

/**
 * WhatsApp API entegrasyonu (Placeholder)
 * Gerçek uygulamada Twilio, WhatsApp Business API veya benzeri bir servis kullanılacak
 */
async function sendWhatsAppNotification({ phone, type, data }) {
    // TODO: Gerçek WhatsApp API entegrasyonu
    // Bu fonksiyon şu anda sadece log tutar

    console.log('WhatsApp Notification:', {
        phone,
        type,
        data,
        timestamp: new Date().toISOString(),
    });

    // Örnek: Twilio entegrasyonu
    /*
    const accountSid = functions.config().twilio.account_sid;
    const authToken = functions.config().twilio.auth_token;
    const client = require('twilio')(accountSid, authToken);
    
    const messages = {
      appointment_confirmation: `Merhaba ${data.customerName}! Randevunuz onaylandı. Tarih: ${data.dateTime}`,
      appointment_reminder: `Merhaba ${data.customerName}! Randevunuza 1 saat kaldı.`,
      appointment_cancelled: `Merhaba ${data.customerName}! Randevunuz iptal edildi.`,
      appointment_confirmed: `Merhaba ${data.customerName}! Randevunuz onaylandı.`,
    };
    
    await client.messages.create({
      body: messages[type],
      from: 'whatsapp:+14155238886',
      to: `whatsapp:${phone}`,
    });
    */

    return true;
}

/**
 * HTTP endpoint: Randevu durumu güncelleme
 * İşletme panelinden kullanılabilir
 */
exports.updateAppointmentStatus = functions.https.onCall(async (data, context) => {
    // Kimlik doğrulama kontrolü
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Giriş yapmanız gerekiyor.');
    }

    const { appointmentId, status, cancellationReason } = data;

    if (!appointmentId || !status) {
        throw new functions.https.HttpsError('invalid-argument', 'appointmentId ve status gerekli.');
    }

    const validStatuses = ['pending', 'confirmed', 'inProgress', 'completed', 'cancelled', 'noShow'];
    if (!validStatuses.includes(status)) {
        throw new functions.https.HttpsError('invalid-argument', 'Geçersiz durum.');
    }

    try {
        const updateData = {
            status,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        if (status === 'cancelled' && cancellationReason) {
            updateData.cancellationReason = cancellationReason;
        }

        await db.collection('appointments').doc(appointmentId).update(updateData);

        return { success: true, message: 'Randevu durumu güncellendi.' };
    } catch (error) {
        console.error('Error updating appointment:', error);
        throw new functions.https.HttpsError('internal', 'Randevu güncellenirken hata oluştu.');
    }
});

/**
 * HTTP endpoint: Müsait zaman dilimlerini getir
 */
exports.getAvailableSlots = functions.https.onCall(async (data, context) => {
    const { businessId, staffId, date, durationMinutes } = data;

    if (!businessId || !staffId || !date || !durationMinutes) {
        throw new functions.https.HttpsError('invalid-argument', 'Tüm parametreler gerekli.');
    }

    try {
        const targetDate = new Date(date);
        const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

        // Mevcut randevuları al
        const appointments = await db.collection('appointments')
            .where('staffId', '==', staffId)
            .where('dateTime', '>=', admin.firestore.Timestamp.fromDate(startOfDay))
            .where('dateTime', '<=', admin.firestore.Timestamp.fromDate(endOfDay))
            .where('status', 'not-in', ['cancelled', 'noShow'])
            .get();

        // İşletme çalışma saatlerini al
        const business = await db.collection('businesses').doc(businessId).get();
        const businessData = business.data();

        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayOfWeek = dayNames[new Date(date).getDay()];
        const workingHours = businessData.workingHours[dayOfWeek];

        if (!workingHours || !workingHours.isOpen) {
            return { slots: [] };
        }

        // Müsait slotları hesapla
        const slots = [];
        const [openHour, openMin] = workingHours.openTime.split(':').map(Number);
        const [closeHour, closeMin] = workingHours.closeTime.split(':').map(Number);

        let currentTime = new Date(date);
        currentTime.setHours(openHour, openMin, 0, 0);

        const closeTime = new Date(date);
        closeTime.setHours(closeHour, closeMin, 0, 0);

        while (currentTime.getTime() + durationMinutes * 60000 <= closeTime.getTime()) {
            const slotEnd = new Date(currentTime.getTime() + durationMinutes * 60000);

            // Çakışma kontrolü
            const hasConflict = appointments.docs.some(doc => {
                const apt = doc.data();
                const aptStart = apt.dateTime.toDate();
                const aptEnd = new Date(aptStart.getTime() + apt.totalDurationMinutes * 60000);

                return currentTime < aptEnd && slotEnd > aptStart;
            });

            if (!hasConflict && currentTime > new Date()) {
                slots.push(currentTime.toISOString());
            }

            currentTime = new Date(currentTime.getTime() + 30 * 60000); // 30 dakikalık aralıklar
        }

        return { slots };
    } catch (error) {
        console.error('Error getting available slots:', error);
        throw new functions.https.HttpsError('internal', 'Müsait saatler alınırken hata oluştu.');
    }
});
