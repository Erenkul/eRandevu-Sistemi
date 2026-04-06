# Phase 1 Fixes — Debug & Test Guide

**Date:** April 6, 2026  
**Status:** AuthContext fixed, build successful

---

## What Was Fixed

### 1. Firestore Security Rules ✅
- **C1:** Appointments list now limited to 100 max, requires authentication
- **C2:** Business read restricted to active businesses only
- **C3:** Appointment get requires authentication + ownership/customer check
- **C4:** Create operations require ownership verification

### 2. AuthContext Security ✅
- **C5:** Removed all localStorage role manipulation
- **Added:** Graceful error handling for network/adblocker/permission errors
- **Added:** User stays logged in on Firestore errors (prevents lockout)

### 3. Cloud Functions ✅
- **C6:** Added authentication check to sendNotification
- **C7:** Created SMSService
- **H1:** Fixed scheduled functions to actually send notifications

---

## Current Issue & Fix

### Error You Were Seeing
```
AuthContext.tsx:90 Error fetching user data: FirebaseError: Missing or insufficient permissions.
firestore.googleapis.com: Failed to load resource: net::ERR_BLOCKED_BY_CLIENT
```

### Root Causes
1. **AdBlocker blocking Firestore** — Firebase requests being blocked
2. **Permission errors** — New strict Firestore rules
3. **Aggressive sign-out** — Previous code signed out users on any Firestore error

### Fix Applied ✅
1. **User stays logged in on Firestore errors** — No more lockout
2. **Specific error messages** — Users see helpful messages
3. **Graceful fallback** — Minimal user data when Firestore unavailable

### Error Messages You'll See Now
- **AdBlocker:** "Firebase bağlantısı engellendi. Lütfen Reklam Engelleyici (AdBlock) eklentisini devre dışı bırakın veya bu site için beyaz listeye alın."
- **Network:** "Veritabanı bağlantı hatası. Lütfen internet bağlantınızı kontrol edin."
- **Permission:** "Veritabanı erişim izni yok. Lütfen daha sonra tekrar deneyin veya iletişim formunu kullanın."
- **Unknown:** "Beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin."

---

## Quick Test Steps

### Test 1: Register New User
```
1. Open http://localhost:5173
2. Click "Kayıt Olun"
3. Select "Müşteri"
4. Fill in:
   - Email: testnew@customer.com
   - Şifre: Test123456!
   - Ad Soyad: Test Customer
   - Telefon: 5551234567
5. Click "Kayıt Ol"

Expected: ✅ User registered and logged in
```

### Test 2: Log In With AdBlocker
```
1. Enable AdBlocker (uBlock Origin)
2. Try to log in:
   - Email: test@customer.com
   - Password: Test123456!
3. Observe error message

Expected: ✅ Shows AdBlocker error message
Expected: ✅ User stays logged in with minimal data
```

### Test 3: Check LocalStorage (Security)
```
1. Log in
2. Open DevTools → Application → Local Storage
3. Search for "erandevu_role"

Expected: ✅ No "erandevu_role_" keys found
Expected: ✅ Cannot manipulate role via localStorage
```

### Test 4: Create Business Account
```
1. Log out
2. Click "Kayıt Olun"
3. Select "İşletme"
4. Fill in:
   - Email: test@business.com
   - Şifre: Test123456!
   - Ad Soyad: Test Business
   - İşletme Adı: Test Salon
   - Telefon: 5551234567
5. Click "Kayıt Ol"

Expected: ✅ Business account created
Expected: ✅ Logged in as admin
Expected: ✅ Business document created in Firestore
```

---

## Debug Commands

### Check Firestore Rules
```bash
# View rules
firebase firestore:rules

# Test rules in playground
firebase firestore:test
```

### Check Cloud Functions Logs
```bash
# View function logs
firebase functions:log

# Stream logs in real-time
firebase functions:log --only sendNotification
```

### Check Firestore Data
```javascript
// In browser console
import { getDoc, doc } from 'firebase/firestore';

// Check user document
const userDoc = await getDoc(doc(db, 'users', 'USER_UID'));
console.log('User data:', userDoc.data());

// Check business document
const bizDoc = await getDoc(doc(db, 'businesses', 'BIZ_ID'));
console.log('Business data:', bizDoc.data());
```

### Test Auth Context
```javascript
// In browser console
import { useAuth } from './contexts/AuthContext';

const { user, error, loading } = useAuth();
console.log('User:', user);
console.log('Error:', error);
console.log('Loading:', loading);
```

---

## What to Test First

### 1. Basic Authentication (5 minutes)
- [ ] Can register as customer
- [ ] Can log in as customer
- [ ] Can register as business
- [ ] Can log in as business
- [ ] Error messages are clear

### 2. Security (5 minutes)
- [ ] No localStorage role manipulation
- [ ] AdBlocker shows specific error
- [ ] User stays logged in on errors
- [ ] Cannot bypass authentication

### 3. Firestore Rules (10 minutes)
- [ ] Cannot list all appointments
- [ ] Can only access own data
- [ ] Create operations require ownership
- [ ] Permission denied for unauthorized access

---

## Known Limitations

### Current Limitations (Temporary)
1. **Cloud Functions not deployed** — Requires Blaze plan
2. **SMS/WhatsApp not configured** — Requires environment variables
3. **Scheduled functions not tested** — Need Blaze plan to deploy

### What Works
- ✅ Frontend builds successfully
- ✅ Authentication works (no lockout)
- ✅ Firestore rules deployed
- ✅ Security fixes in place
- ✅ Error handling improved

---

## Next Steps

### Immediate (Before Testing)
1. Disable AdBlocker OR whitelist localhost
2. Ensure internet connection is stable
3. Clear browser cache if needed
4. Run: `npm run dev`

### After Testing
1. If issues found, document them
2. If all works, proceed to Phase 2
3. Upgrade to Blaze plan for Cloud Functions
4. Configure environment variables

---

## How to Report Issues

When reporting issues, include:

```
Error message: [Copy exact error]
Console logs: [DevTools Console screenshot]
Network tab: [DevTools Network tab screenshot]
Reproduction steps: [Step-by-step what you did]
Expected behavior: [What should happen]
Actual behavior: [What actually happened]
```

---

## Quick Reference

### Error Messages Meaning

| Error Message | Cause | Action |
|---|---|---|
| "Firebase bağlantısı engellendi" | AdBlocker blocking | Disable AdBlocker or whitelist site |
| "Veritabanı bağlantı hatası" | Network issue | Check internet connection |
| "Veritabanı erişim izni yok" | Permission denied | Check Firestore rules, contact support |
| "Beklenmeyen bir hata oluştu" | Unknown error | Refresh page, try again |

### Firestore Rules Summary

| Collection | Read | Create | Update | Delete |
|---|---|---|---|---|
| businesses | Auth + Active | Owner | Owner | Owner |
| services | Auth + Active | Owner | Owner | Owner |
| staff | Auth + Active | Owner | Owner | Owner |
| appointments | Auth + Limit 100 | Auth + Fields | Owner | Owner |
| customers | Owner | Owner | Owner | Owner |
| daily_schedules | Auth + Active | Owner + Schema | Owner + Schema | Owner |

---

## Success Criteria

### ✅ Authentication Works
- Can register as customer and business
- Can log in with correct credentials
- Cannot log in with wrong credentials
- Error messages are clear and helpful
- User stays logged in on Firestore errors

### ✅ Security Intact
- No localStorage role manipulation
- AdBlocker shows specific error
- Cannot bypass authentication
- Multi-tenant isolation working
- Permission denied for unauthorized access

### ✅ User Experience Improved
- Helpful error messages
- No complete lockout on errors
- Graceful fallback to minimal data
- Clear indication of what's wrong

---

**Test Instructions:** Use `PHASE1_TEST_SCENARIOS.md` for detailed test scenarios.
