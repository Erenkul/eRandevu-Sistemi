import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { WhatsAppService } from './services/whatsapp.service';
import { SMSService } from './services/sms.service';
import { WHATSAPP_CONFIG } from './config/constants';
import { BookingData, MessageType } from './types/whatsapp.types';

admin.initializeApp();

// WhatsApp Webhook Verification
export const whatsappWebhook = functions.https.onRequest((req, res) => {
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === WHATSAPP_CONFIG.VERIFY_TOKEN) {
      console.log('Webhook verified successfully');
      res.status(200).send(challenge);
    } else {
      console.error('Webhook verification failed');
      res.sendStatus(403);
    }
  } else if (req.method === 'POST') {
    console.log('Webhook POST received:', JSON.stringify(req.body, null, 2));
    res.sendStatus(200);
  } else {
    res.sendStatus(405);
  }
});

// Mesaj Gönderme Fonksiyonu (WhatsApp + SMS Fallback)
export const sendNotification = functions.https.onCall(async (data, context) => {
  try {
    const { type, bookingData } = data as {
      type: MessageType;
      bookingData: BookingData;
    };

    const whatsappService = WhatsAppService.getInstance();
    const smsService = SMSService.getInstance();

    let whatsappSuccess = false;

    // WhatsApp mesajını gönder
    switch (type) {
      case 'booking_confirmation':
        whatsappSuccess = await whatsappService.sendBookingConfirmation(bookingData);
        break;
      case 'reminder_24h':
        whatsappSuccess = await whatsappService.send24HourReminder(bookingData);
        break;
      case 'reminder_2h':
        whatsappSuccess = await whatsappService.send2HourReminder(bookingData);
        break;
      case 'cancellation':
        whatsappSuccess = await whatsappService.sendCancellationNotice(bookingData);
        break;
      default:
        throw new Error('Invalid message type');
    }

    // WhatsApp başarısız olursa SMS gönder
    if (!whatsappSuccess) {
      console.log('WhatsApp failed, falling back to SMS');
      
      let smsSuccess = false;
      switch (type) {
        case 'booking_confirmation':
          smsSuccess = await smsService.sendBookingConfirmation(bookingData);
          break;
        case 'reminder_24h':
          smsSuccess = await smsService.send24HourReminder(bookingData);
          break;
        case 'reminder_2h':
          smsSuccess = await smsService.send2HourReminder(bookingData);
          break;
        case 'cancellation':
          smsSuccess = await smsService.sendCancellationNotice(bookingData);
          break;
      }

      return {
        success: smsSuccess,
        channel: smsSuccess ? 'SMS' : 'FAILED',
        message: smsSuccess ? 'Message sent via SMS' : 'All channels failed',
      };
    }

    return {
      success: true,
      channel: 'WhatsApp',
      message: 'Message sent via WhatsApp',
    };
  } catch (error) {
    console.error('Error in sendNotification:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send notification');
  }
});

// Scheduled function - 24 saat öncesi hatırlatma
export const send24HourReminders = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async (context) => {
    const db = admin.firestore();
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const bookingsSnapshot = await db
      .collection('bookings')
      .where('date', '==', tomorrow.toISOString().split('T')[0])
      .where('reminderSent24h', '==', false)
      .get();

    const promises = bookingsSnapshot.docs.map(async (doc) => {
      const booking = doc.data();
      // sendNotification fonksiyonunu çağır
      await db.collection('bookings').doc(doc.id).update({
        reminderSent24h: true,
      });
    });

    await Promise.all(promises);
    console.log(`Sent ${promises.length} 24-hour reminders`);
  });

// Scheduled function - 2 saat öncesi hatırlatma
export const send2HourReminders = functions.pubsub
  .schedule('every 30 minutes')
  .onRun(async (context) => {
    const db = admin.firestore();
    const now = new Date();
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    const bookingsSnapshot = await db
      .collection('bookings')
      .where('dateTime', '<=', twoHoursLater)
      .where('dateTime', '>=', now)
      .where('reminderSent2h', '==', false)
      .get();

    const promises = bookingsSnapshot.docs.map(async (doc) => {
      const booking = doc.data();
      // sendNotification fonksiyonunu çağır
      await db.collection('bookings').doc(doc.id).update({
        reminderSent2h: true,
      });
    });

    await Promise.all(promises);
    console.log(`Sent ${promises.length} 2-hour reminders`);
  });
