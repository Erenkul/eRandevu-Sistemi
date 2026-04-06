import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { z } from 'zod';
import { WhatsAppService } from './services/whatsapp.service';
import { SMSService } from './services/sms.service';
import { WHATSAPP_CONFIG, MESSAGE_TYPES, COLLECTIONS, FIRESTORE_FIELDS, APPOINTMENT_STATUS, TIME_CONSTANTS, SCHEDULES, WEBHOOK_PARAMS, WEBHOOK_MODE } from './config/constants';
import { BookingData } from './types/whatsapp.types';

// --- Input Validation Schemas (H2) ---
const BookingDataSchema = z.object({
  appointmentId: z.string().min(1).max(128),
  customerName: z.string().min(1).max(100),
  customerPhone: z.string().regex(/^(\+90|0)?5\d{9}$/, 'Invalid Turkish phone number'),
  serviceName: z.string().min(1).max(200),
  staffName: z.string().min(1).max(100),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM'),
  businessName: z.string().min(1).max(200),
});

const SendNotificationSchema = z.object({
  type: z.enum([
    MESSAGE_TYPES.BOOKING_CONFIRMATION,
    MESSAGE_TYPES.REMINDER_24H,
    MESSAGE_TYPES.REMINDER_2H,
    MESSAGE_TYPES.CANCELLATION,
  ]),
  bookingData: BookingDataSchema,
});

admin.initializeApp();

// WhatsApp Webhook Verification
export const whatsappWebhook = functions.https.onRequest((req, res) => {
  if (req.method === 'GET') {
    const mode = req.query[WEBHOOK_PARAMS.HUB_MODE];
    const token = req.query[WEBHOOK_PARAMS.HUB_VERIFY_TOKEN];
    const challenge = req.query[WEBHOOK_PARAMS.HUB_CHALLENGE];

    if (mode === WEBHOOK_MODE.SUBSCRIBE && token === WHATSAPP_CONFIG.VERIFY_TOKEN) {
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
  // C6: Authentication check
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Must be logged in to send notifications'
    );
  }

  // H2: Validate input before touching Firestore
  let validatedInput: z.infer<typeof SendNotificationSchema>;

  try {
    validatedInput = SendNotificationSchema.parse(data);
  } catch (err) {
    if (err instanceof z.ZodError) {
      const first = err.errors[0];
      throw new functions.https.HttpsError(
        'invalid-argument',
        `Invalid input: ${first.path.join('.')} — ${first.message}`
      );
    }
    throw err;
  }

  const { type, bookingData } = validatedInput;

  const db = admin.firestore();

  const bookingDoc = await db.collection(COLLECTIONS.APPOINTMENTS).doc(bookingData.appointmentId).get();

  if (!bookingDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Booking not found');
  }

  const booking = bookingDoc.data();

  if (!booking) {
    throw new functions.https.HttpsError('not-found', 'Booking data not found');
  }

  const userDoc = await db.collection(COLLECTIONS.USERS).doc(context.auth.uid).get();

  if (!userDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'User not found');
  }

  const user = userDoc.data();

  if (!user) {
    throw new functions.https.HttpsError('not-found', 'User data not found');
  }

  const isOwner = booking.businessId === user.businessId;
  const isCustomer = booking.customerPhone === user.phoneNumber;

  if (!isOwner && !isCustomer) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'You do not have permission to send notifications for this booking'
    );
  }

  try {
    const whatsappService = WhatsAppService.getInstance();
    const smsService = SMSService.getInstance();

    let whatsappSuccess = false;

    // WhatsApp mesajını gönder
    switch (type) {
      case MESSAGE_TYPES.BOOKING_CONFIRMATION:
        whatsappSuccess = await whatsappService.sendBookingConfirmation(bookingData);
        break;
      case MESSAGE_TYPES.REMINDER_24H:
        whatsappSuccess = await whatsappService.send24HourReminder(bookingData);
        break;
      case MESSAGE_TYPES.REMINDER_2H:
        whatsappSuccess = await whatsappService.send2HourReminder(bookingData);
        break;
      case MESSAGE_TYPES.CANCELLATION:
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
        case MESSAGE_TYPES.BOOKING_CONFIRMATION:
          smsSuccess = await smsService.sendBookingConfirmation(bookingData);
          break;
        case MESSAGE_TYPES.REMINDER_24H:
          smsSuccess = await smsService.send24HourReminder(bookingData);
          break;
        case MESSAGE_TYPES.REMINDER_2H:
          smsSuccess = await smsService.send2HourReminder(bookingData);
          break;
        case MESSAGE_TYPES.CANCELLATION:
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
  .schedule(SCHEDULES.REMINDER_24H_CHECK)
  .onRun(async (context) => {
    try {
      const db = admin.firestore();
      const now = new Date();
      const tomorrow = new Date(now.getTime() + TIME_CONSTANTS.TWENTY_FOUR_HOURS_MS);

      const startOfDay = admin.firestore.Timestamp.fromDate(new Date(tomorrow.setHours(0, 0, 0, 0)));
      const endOfDay = admin.firestore.Timestamp.fromDate(new Date(tomorrow.setHours(23, 59, 59, 999)));

      const bookingsSnapshot = await db
        .collection(COLLECTIONS.APPOINTMENTS)
        .where(FIRESTORE_FIELDS.DATE_TIME, '>=', startOfDay)
        .where(FIRESTORE_FIELDS.DATE_TIME, '<=', endOfDay)
        .where(FIRESTORE_FIELDS.STATUS, '==', APPOINTMENT_STATUS.CONFIRMED)
        .where(FIRESTORE_FIELDS.REMINDER_SENT_24H, '==', false)
        .get();

      const promises = bookingsSnapshot.docs.map(async (doc) => {
        const booking = doc.data();

        const bookingData: BookingData = {
          customerName: booking.customerName,
          customerPhone: booking.customerPhone,
          serviceName: booking.services.map((s: any) => s.name).join(', '),
          staffName: booking.staffName,
          date: booking.dateTime.toDate().toISOString().split('T')[0],
          time: booking.dateTime.toDate().toTimeString().slice(0, 5),
          businessName: booking.businessName,
        };

        const whatsappService = WhatsAppService.getInstance();
        const smsService = SMSService.getInstance();

        let success = await whatsappService.send24HourReminder(bookingData);

        if (!success) {
          success = await smsService.send24HourReminder(bookingData);
        }

        if (success) {
          await db.collection(COLLECTIONS.APPOINTMENTS).doc(doc.id).update({
            [FIRESTORE_FIELDS.REMINDER_SENT_24H]: true,
            [FIRESTORE_FIELDS.REMINDER_SENT_24H_AT]: admin.firestore.FieldValue.serverTimestamp()
          });
        }

        return success;
      });

      const results = await Promise.allSettled(promises);
      const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;

      console.log(`Sent ${successCount}/${results.length} 24-hour reminders`);
    } catch (error) {
      console.error('Error in send24HourReminders:', error);
      // Don't throw to prevent function from being disabled
    }
  });

// Scheduled function - 2 saat öncesi hatırlatma
export const send2HourReminders = functions.pubsub
  .schedule(SCHEDULES.REMINDER_2H_CHECK)
  .onRun(async (context) => {
    try {
      const db = admin.firestore();
      const now = admin.firestore.Timestamp.now();
      const twoHoursLater = admin.firestore.Timestamp.fromMillis(
        now.toMillis() + TIME_CONSTANTS.TWO_HOURS_MS
      );

      const bookingsSnapshot = await db
        .collection(COLLECTIONS.APPOINTMENTS)
        .where(FIRESTORE_FIELDS.DATE_TIME, '>=', now)
        .where(FIRESTORE_FIELDS.DATE_TIME, '<=', twoHoursLater)
        .where(FIRESTORE_FIELDS.STATUS, '==', APPOINTMENT_STATUS.CONFIRMED)
        .where(FIRESTORE_FIELDS.REMINDER_SENT_2H, '==', false)
        .get();

      const promises = bookingsSnapshot.docs.map(async (doc) => {
        const booking = doc.data();

        const bookingData: BookingData = {
          customerName: booking.customerName,
          customerPhone: booking.customerPhone,
          serviceName: booking.services.map((s: any) => s.name).join(', '),
          staffName: booking.staffName,
          date: booking.dateTime.toDate().toISOString().split('T')[0],
          time: booking.dateTime.toDate().toTimeString().slice(0, 5),
          businessName: booking.businessName,
        };

        const whatsappService = WhatsAppService.getInstance();
        const smsService = SMSService.getInstance();

        let success = await whatsappService.send2HourReminder(bookingData);

        if (!success) {
          success = await smsService.send2HourReminder(bookingData);
        }

        if (success) {
          await db.collection(COLLECTIONS.APPOINTMENTS).doc(doc.id).update({
            [FIRESTORE_FIELDS.REMINDER_SENT_2H]: true,
            [FIRESTORE_FIELDS.REMINDER_SENT_2H_AT]: admin.firestore.FieldValue.serverTimestamp()
          });
        }

        return success;
      });

      const results = await Promise.allSettled(promises);
      const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;

      console.log(`Sent ${successCount}/${results.length} 2-hour reminders`);
    } catch (error) {
      console.error('Error in send2HourReminders:', error);
      // Don't throw to prevent function from being disabled
    }
  });
