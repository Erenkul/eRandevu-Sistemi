import { WhatsAppNotificationData } from "../types";

export function formatSmsMessage(type: string, data: WhatsAppNotificationData): string {
    const time = data.dateTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Istanbul' });
    const date = data.dateTime.toLocaleDateString('tr-TR', { timeZone: 'Europe/Istanbul' });

    switch (type) {
        case 'appointment_confirmation':
        case 'appointment_confirmed':
            return `Merhaba ${data.customerName}, ${data.businessName} isletmesindeki randevunuz onaylandi.\n${date} - ${time}\nPersonel: ${data.staffName || '-'}\nHizmetler: ${data.services || '-'}\nRef: ${data.appointmentId || '-'}`;

        case 'appointment_cancelled':
            return `Merhaba ${data.customerName}, ${date} tarihli ${data.businessName} randevunuz iptal edilmistir.\nYeni randevu icin: ${data.bookingUrl || '-'}`;

        case 'appointment_reminder':
            return `Merhaba ${data.customerName}, bugun saat ${time}'de ${data.businessName} randevunuz var.\nHizmetler: ${data.services || '-'}\nIyi gunler dileriz!`;

        default:
            return '';
    }
}
