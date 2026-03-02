import * as functions from 'firebase-functions';
import { WhatsAppPayload } from '../types';

export async function sendWhatsAppNotification({ phone, type, data }: WhatsAppPayload): Promise<boolean> {
    console.log('WhatsApp Notification Request:', { phone, type });

    const token = process.env.WHATSAPP_TOKEN || functions.config().meta?.token;
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || functions.config().meta?.phone_id;

    if (!token || !phoneId) {
        console.log('⚠️ Meta API credentials missing. WhatsApp fail.');
        return false;
    }

    const templateName = type;

    const time = data.dateTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Istanbul' });
    const date = data.dateTime.toLocaleDateString('tr-TR', { timeZone: 'Europe/Istanbul' });

    let parameters: any[] = [];
    if (type === 'appointment_confirmation' || type === 'appointment_confirmed') {
        parameters = [
            { type: 'text', text: data.customerName },
            { type: 'text', text: data.businessName },
            { type: 'text', text: date },
            { type: 'text', text: time },
            { type: 'text', text: data.services || '-' },
            { type: 'text', text: data.staffName || '-' },
            { type: 'text', text: data.appointmentId || '-' }
        ];
    } else if (type === 'appointment_cancelled') {
        parameters = [
            { type: 'text', text: data.customerName },
            { type: 'text', text: date },
            { type: 'text', text: data.businessName },
            { type: 'text', text: data.bookingUrl || '-' }
        ];
    } else if (type === 'appointment_reminder') {
        parameters = [
            { type: 'text', text: data.customerName },
            { type: 'text', text: time },
            { type: 'text', text: data.businessName },
            { type: 'text', text: data.services || '-' }
        ];
    }

    try {
        const response = await fetch(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: phone,
                type: 'template',
                template: {
                    name: templateName,
                    language: { code: 'tr' },
                    components: [
                        {
                            type: 'body',
                            parameters: parameters
                        }
                    ]
                }
            })
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Meta API Error:', JSON.stringify(error));
            return false;
        }

        console.log('WhatsApp sent successfully.');
        return true;
    } catch (error) {
        console.error('Network Error sending WhatsApp:', error);
        return false;
    }
}
