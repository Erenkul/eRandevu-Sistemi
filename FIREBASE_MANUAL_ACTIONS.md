# Firebase Manual Actions Checklist

**Date:** April 6, 2026  
**Project:** eRandevu  
**Phase:** Phase 1 - Critical Security Fixes

---

## Urgent Actions Required

### 1. Upgrade to Blaze Plan (Pay-as-you-go) ⚠️ REQUIRED

**Status:** Required for Cloud Functions deployment

**Action:**
1. Visit: https://console.firebase.google.com/project/erandevu-1f097/usage/details
2. Click "Upgrade" to Blaze plan
3. Set billing limits if needed

**Why Required:**
- Cloud Functions cannot be deployed on the free Spark plan
- Required APIs cannot be enabled without Blaze:
  - `cloudbuild.googleapis.com` (Cloud Build)
  - `artifactregistry.googleapis.com` (Artifact Registry)

**After Upgrade:**
- Deploy Cloud Functions: `firebase deploy --only functions`

---

### 2. Rotate Firebase API Key (C5) ⚠️ CRITICAL

**Status:** API key exposed in `frontend/.env.local`

**Action:**
1. Go to Firebase Console: https://console.firebase.google.com/project/erandevu-1f097/settings/general
2. Scroll to "Your apps" → "Web" → `eRandevu Web App`
3. Click the gear icon → App settings
4. Scroll to "Config" → Click "Config" snippet
5. Copy new Firebase config
6. Update `frontend/.env.local` with new API key

**Security Concern:**
- Old API key was committed to git
- Should rotate immediately after verifying new key works

**After Rotation:**
- Remove old API key from git history using:
  ```bash
  git filter-repo --path frontend/.env.local --invert
  git push origin main --force
  ```
- Update `frontend/src/lib/firebase.ts` with new config

---

### 3. Rotate WhatsApp/SMS Credentials (C5) ⚠️ CRITICAL

**Status:** Credentials exposed in `.env` file

**Action:**

**For WhatsApp:**
1. Go to Meta for Developers: https://developers.facebook.com/apps/
2. Select your WhatsApp app
3. Settings → Basic
4. Regenerate Access Token
5. Update Firebase environment variables:
   ```bash
   firebase functions:config:set whatsapp.access_token="NEW_TOKEN" whatsapp.phone_number_id="YOUR_ID"
   ```

**For SMS (NetGSM/Ileti Merkezi):**
1. Log into your SMS provider dashboard
2. Generate new API key
3. Update Firebase environment variables:
   ```bash
   firebase functions:config:set sms.api_key="NEW_API_KEY" sms.sender="ERANDEVU"
   ```

**After Rotation:**
- Remove old credentials from git history
- Update `.env` file locally (but don't commit!)
- Add `.env` to `.gitignore` if not already

---

### 4. Set Up Firebase Environment Variables ⚠️ REQUIRED

**Status:** Cloud Functions need environment variables for SMS/WhatsApp

**Action:**

```bash
# Set WhatsApp configuration
firebase functions:config:set \
  whatsapp.phone_number_id="YOUR_PHONE_NUMBER_ID" \
  whatsapp.access_token="YOUR_ACCESS_TOKEN" \
  whatsapp.verify_token="erandevu_webhook_2025"

# Set SMS configuration
firebase functions:config:set \
  sms.api_key="YOUR_SMS_API_KEY" \
  sms.api_url="https://api.iletimerkezi.com/v1" \
  sms.sender="ERANDEVU"

# Verify configuration
firebase functions:config:get
```

**Notes:**
- Keep these values secure
- Never commit `.runtimeconfig.json` to git
- Use Firebase project-level secrets in production

---

### 5. Create Firebase Firestore Indexes ✅ ALREADY DONE

**Status:** Deployed via `firestore.indexes.json`

**Verification:**
1. Go to: https://console.firebase.google.com/project/erandevu-1f097/firestore/indexes
2. Confirm indexes are being created (may take a few minutes)
3. Indexes created:
   - `appointments`: businessId ASC, customerPhone ASC
   - `appointments`: dateTime ASC, status ASC, reminderSent24h ASC
   - `appointments`: dateTime ASC, reminderSent2h ASC

**Note:** Queries using these indexes won't work until indexes are fully created.

---

### 6. Verify Firestore Rules Deployment ✅ ALREADY DONE

**Status:** Rules deployed and compiled successfully

**Verification:**
1. Go to: https://console.firebase.google.com/project/erandevu-1f097/firestore/rules
2. Review rules in the Console
3. Click "Playground" to test rules
4. Test scenarios:
   - ✅ Authenticated user can list appointments (max 100)
   - ❌ Unauthenticated user cannot list appointments
   - ✅ Business owner can read their business data
   - ❌ User cannot read another business's private data
   - ✅ Business owner can create/update services
   - ❌ User cannot create/update services they don't own

---

### 7. Enable Required APIs ✅ AUTOMATIC

**Status:** Firebase automatically enables these APIs when deploying

**APIs Required:**
- `firestore.googleapis.com` (Firestore)
- `cloudfunctions.googleapis.com` (Cloud Functions)
- `cloudbuild.googleapis.com` (Cloud Build)
- `artifactregistry.googleapis.com` (Artifact Registry)

**Verification:**
1. Go to: https://console.cloud.google.com/apis/library
2. Search for required APIs
3. Confirm they're enabled for `erandevu-1f097`

---

## Optional (But Recommended)

### 8. Set Up Monitoring & Alerts

**Action:**
1. Go to Firebase Console: https://console.firebase.google.com/project/erandevu-1f097/functions
2. Click "Monitoring" → "Logs"
3. Create alerts for:
   - Function failures (>5 per hour)
   - Function errors (>1 per hour)
   - High latency (>5s)

### 9. Configure Webhook Verification

**Action:**
1. Go to Meta for Developers: https://developers.facebook.com/apps/
2. Select your WhatsApp app
3. Webhooks → Edit webhook
4. Verify token: `erandevu_webhook_2025`
5. Confirm callback URL is set correctly

---

## Deployment Checklist

After completing all manual actions:

```bash
# Deploy Firestore rules (already done)
firebase deploy --only firestore:rules

# Deploy Firestore indexes (already done)
firebase deploy --only firestore:indexes

# Deploy Cloud Functions (requires Blaze plan)
firebase deploy --only functions

# Verify deployment
firebase functions:log
```

---

## Post-Deployment Verification

1. ✅ Test user login/registration
2. ✅ Test appointment booking flow
3. ✅ Test notification sending (if SMS/WhatsApp configured)
4. ✅ Check Cloud Functions logs for errors
5. ✅ Verify Firestore rules in Console Playground

---

## Notes

- All code changes have been made and tested locally
- Cloud Functions build successfully
- Frontend builds successfully
- Only manual Firebase actions remain:
  1. Upgrade to Blaze plan (required for functions)
  2. Rotate exposed credentials (security best practice)
  3. Set environment variables (required for SMS/WhatsApp)
