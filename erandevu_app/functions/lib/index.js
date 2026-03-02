"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendHourlyReminders = exports.sendDailyReminders = exports.onAppointmentUpdated = exports.onAppointmentCreated = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const whatsapp_1 = require("./services/whatsapp");
const sms_1 = require("./services/sms");
const messageTemplates_1 = require("./utils/messageTemplates");
admin.initializeApp();
const db = admin.firestore();
async function getBusinessName(businessId) {
    try {
        const doc = await db.collection('businesses').doc(businessId).get();
        if (doc.exists) {
            return doc.data()?.name || 'İşletme';
        }
    }
    catch (err) {
        console.error(`Failed to fetch business ${businessId}`);
    }
    return 'İşletme';
}
function summarizeServices(services) {
    if (!services || !Array.isArray(services))
        return '';
    return services.map(s => s.name || s.serviceName).join(', ');
}
// 1. Yeni Randevu Oluşturulduğunda (Confirmation)
exports.onAppointmentCreated = functions.firestore
    .document('appointments/{appointmentId}')
    .onCreate(async (snap, context) => {
    const appointment = snap.data();
    const appointmentId = context.params.appointmentId;
    const businessName = await getBusinessName(appointment.businessId);
    const dataPayload = {
        customerName: appointment.customerName,
        businessName,
        dateTime: appointment.dateTime.toDate(),
        services: summarizeServices(appointment.services),
        staffName: appointment.staffName,
        appointmentId
    };
    const success = await (0, whatsapp_1.sendWhatsAppNotification)({
        phone: appointment.customerPhone,
        type: 'appointment_confirmation',
        data: dataPayload
    });
    if (!success) {
        const message = (0, messageTemplates_1.formatSmsMessage)('appointment_confirmation', dataPayload);
        const smsSuccess = await (0, sms_1.sendSmsFallback)(appointment.customerPhone, message);
        await snap.ref.update({
            whatsappReminderSent: false,
            smsReminderSent: smsSuccess
        });
    }
    else {
        await snap.ref.update({
            whatsappReminderSent: true,
            smsReminderSent: false
        });
    }
    return null;
});
// 2. Randevu Durumu Güncellendiğinde (Confirmed veya Cancelled)
exports.onAppointmentUpdated = functions.firestore
    .document('appointments/{appointmentId}')
    .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const appointmentId = context.params.appointmentId;
    if (before.status === after.status)
        return null;
    const businessName = await getBusinessName(after.businessId);
    if (after.status === 'cancelled') {
        const dataPayload = {
            customerName: after.customerName,
            businessName,
            dateTime: after.dateTime.toDate(),
            bookingUrl: '[WEBSİTE_LİNKİ]' // Or dynamic website link if accessible
        };
        const success = await (0, whatsapp_1.sendWhatsAppNotification)({
            phone: after.customerPhone,
            type: 'appointment_cancelled',
            data: dataPayload
        });
        if (!success) {
            const message = (0, messageTemplates_1.formatSmsMessage)('appointment_cancelled', dataPayload);
            const smsSuccess = await (0, sms_1.sendSmsFallback)(after.customerPhone, message);
            await change.after.ref.update({ smsReminderSent: smsSuccess });
        }
    }
    else if (after.status === 'confirmed' && before.status === 'pending') {
        const dataPayload = {
            customerName: after.customerName,
            businessName,
            dateTime: after.dateTime.toDate(),
            services: summarizeServices(after.services),
            staffName: after.staffName,
            appointmentId
        };
        const success = await (0, whatsapp_1.sendWhatsAppNotification)({
            phone: after.customerPhone,
            type: 'appointment_confirmed',
            data: dataPayload
        });
        if (!success) {
            const message = (0, messageTemplates_1.formatSmsMessage)('appointment_confirmed', dataPayload);
            const smsSuccess = await (0, sms_1.sendSmsFallback)(after.customerPhone, message);
            await change.after.ref.update({ smsReminderSent: smsSuccess });
        }
    }
    return null;
});
// 3. Günlük Hatırlatmalar (08:00 AM)
exports.sendDailyReminders = functions.pubsub
    .schedule('0 8 * * *')
    .timeZone('Europe/Istanbul')
    .onRun(async () => {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));
    const appointments = await db.collection('appointments')
        .where('dateTime', '>=', admin.firestore.Timestamp.fromDate(startOfDay))
        .where('dateTime', '<=', admin.firestore.Timestamp.fromDate(endOfDay))
        .where('status', 'in', ['pending', 'confirmed'])
        .where('whatsappReminderSent', '==', false)
        .get();
    const batch = db.batch();
    for (const doc of appointments.docs) {
        const appointment = doc.data();
        const businessName = await getBusinessName(appointment.businessId);
        const dataPayload = {
            customerName: appointment.customerName,
            businessName,
            dateTime: appointment.dateTime.toDate(),
            services: summarizeServices(appointment.services),
            staffName: appointment.staffName
        };
        const success = await (0, whatsapp_1.sendWhatsAppNotification)({
            phone: appointment.customerPhone,
            type: 'appointment_reminder',
            data: dataPayload
        });
        if (success) {
            batch.update(doc.ref, { whatsappReminderSent: true });
        }
        else {
            const message = (0, messageTemplates_1.formatSmsMessage)('appointment_reminder', dataPayload);
            const smsSuccess = await (0, sms_1.sendSmsFallback)(appointment.customerPhone, message);
            batch.update(doc.ref, {
                whatsappReminderSent: false,
                smsReminderSent: smsSuccess
            });
        }
    }
    await batch.commit();
    return null;
});
// 4. Saatlik Hatırlatmalar (Yaklaşan randevular) - Her 15 dakikada
exports.sendHourlyReminders = functions.pubsub
    .schedule('every 15 minutes')
    .onRun(async () => {
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    const oneHourFifteenMinsFromNow = new Date(now.getTime() + 75 * 60 * 1000);
    const appointments = await db.collection('appointments')
        .where('dateTime', '>=', admin.firestore.Timestamp.fromDate(oneHourFromNow))
        .where('dateTime', '<', admin.firestore.Timestamp.fromDate(oneHourFifteenMinsFromNow))
        .where('status', 'in', ['pending', 'confirmed'])
        .where('whatsappReminderSent', '==', false)
        .get();
    const batch = db.batch();
    for (const doc of appointments.docs) {
        const appointment = doc.data();
        const businessName = await getBusinessName(appointment.businessId);
        const dataPayload = {
            customerName: appointment.customerName,
            businessName,
            dateTime: appointment.dateTime.toDate(),
            services: summarizeServices(appointment.services),
            staffName: appointment.staffName
        };
        const success = await (0, whatsapp_1.sendWhatsAppNotification)({
            phone: appointment.customerPhone,
            type: 'appointment_reminder',
            data: dataPayload
        });
        if (success) {
            batch.update(doc.ref, { whatsappReminderSent: true });
        }
        else {
            const message = (0, messageTemplates_1.formatSmsMessage)('appointment_reminder', dataPayload);
            const smsSuccess = await (0, sms_1.sendSmsFallback)(appointment.customerPhone, message);
            batch.update(doc.ref, {
                whatsappReminderSent: false,
                smsReminderSent: smsSuccess
            });
        }
    }
    await batch.commit();
    return null;
});
//# sourceMappingURL=index.js.map