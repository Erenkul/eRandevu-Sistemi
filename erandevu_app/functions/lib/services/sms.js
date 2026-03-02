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
exports.sendSmsFallback = void 0;
const functions = __importStar(require("firebase-functions"));
async function sendSmsFallback(phone, message) {
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
    }
    catch (error) {
        console.error("SMS Fallback Error:", error);
        return false;
    }
}
exports.sendSmsFallback = sendSmsFallback;
//# sourceMappingURL=sms.js.map