import * as functions from "firebase-functions";

export async function sendSmsFallback(phone: string, message: string): Promise<boolean> {
    try {
        console.log(`Sending SMS Fallback to ${phone}`);
        const username = process.env.NETGSM_USERNAME || functions.config().netgsm?.username;
        const password = process.env.NETGSM_PASSWORD || functions.config().netgsm?.password;
        const header = process.env.NETGSM_HEADER || functions.config().netgsm?.header || 'ERANDEVU';

        if (!username || !password) {
            console.error("NetGSM credentials missing for SMS fallback.");
            return false;
        }

        // Use the netgsm package
        const netgsm = require('@netgsm/sms');
        const smsService = new netgsm({
            usercode: username,
            password: password,
            msgheader: header
        });

        // Clean phone string to numeric format starting with country code. NetGSM expects phone info in string array or plain string usually
        const cleanPhone = phone.replace(/\D/g, '');

        const response = await smsService.send(message, cleanPhone);
        console.log("SMS sent successfully", response);
        return true;
    } catch (error) {
        console.error("SMS Fallback Error:", error);
        return false;
    }
}
