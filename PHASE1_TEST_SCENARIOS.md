# Phase 1 Security Fixes — Test Scenarios

**Date:** April 6, 2026  
**Project:** eRandevu  
**Phase:** Phase 1 - Critical Security Fixes

---

## Setup Instructions

### Before Testing
1. ✅ Deployed Firestore rules (done)
2. ✅ Built frontend (done)
3. ⚠️ Upgrade Firebase to Blaze plan (for Cloud Functions)
4. ⚠️ Configure environment variables (SMS/WhatsApp)

### Create Test Accounts
```
Account 1 (Business Owner):
  Name: Test Business
  Email: business@test.com
  Password: Test123456!
  Business Name: Test Salon

Account 2 (Customer):
  Name: Test Customer
  Email: customer@test.com
  Password: Test123456!
```

---

## Scenario 1: Multi-Tenant Data Protection 🔴 CRITICAL

**What it tests:** User A cannot see User B's data

### Scenario 1.1: Business Owner Cannot See Other Businesses

**Steps:**
1. Open Chrome (Account 1 - Business Owner)
2. Log in as business@test.com
3. Open Firefox (Account 2 - Customer) - log out first
4. Log in as customer@test.com in Firefox
5. In Chrome, try to search for customer@test.com's bookings

**Expected:**
- ✅ Business Owner sees only their own appointments
- ❌ Cannot see customer@test.com's appointments
- ❌ Cannot see other businesses' customer data

**Fail if:**
- Business Owner sees other customers' data
- Business Owner can search/acess other businesses' appointments

---

### Scenario 1.2: Customer Cannot See Other Customers

**Steps:**
1. Open Chrome (Account 2 - Customer)
2. Log in as customer@test.com
3. Book an appointment at Test Salon
4. Check customer dashboard
5. Try to find bookings from other customers

**Expected:**
- ✅ Customer sees only their own appointments
- ❌ Cannot see other customers' appointments
- ✅ Can only access their own booking details

**Fail if:**
- Customer sees other customers' appointments
- Customer can access booking IDs they didn't create

---

## Scenario 2: Authentication Security 🔴 CRITICAL

**What it tests:** Authentication cannot be bypassed

### Scenario 2.1: Cannot Manipulate Role via LocalStorage

**Steps:**
1. Log in as customer@test.com
2. Open DevTools → Application → Local Storage
3. Try to find "erandevu_role_" keys
4. If found, try to change value to "admin"
5. Refresh page
6. Try to access admin dashboard at `/admin`

**Expected:**
- ✅ No "erandevu_role_" keys in localStorage
- ✅ Cannot change role by modifying localStorage
- ❌ Cannot access admin dashboard
- ❌ User is signed out if role doesn't match Firestore

**Fail if:**
- Can change role via localStorage
- Can access admin dashboard without proper permissions
- Role is stored in localStorage

---

### Scenario 2.2: Invalid Login Shows Clear Error

**Steps:**
1. Log out
2. Try to log in with wrong credentials:
   - Email: wrong@test.com
   - Password: WrongPass123!
3. Try to log in as business with customer account
4. Try to log in as customer with business account

**Expected:**
- ✅ Clear error message: "Bu e-posta veya şifre hatalı."
- ✅ Role mismatch error for business/customer portal
- ❌ No vague error messages
- ✅ User stays logged out on invalid credentials

**Fail if:**
- Generic error message
- Can bypass role checks
- Logged in with wrong credentials

---

## Scenario 3: AdBlocker Handling ⚠️ MEDIUM

**What it tests:** Users with ad blockers see helpful error messages

### Scenario 3.1: AdBlocker Shows Specific Error

**Steps:**
1. Enable AdBlocker extension (uBlock Origin, AdBlock Plus)
2. Refresh page (if logged in)
3. Try to log in or refresh page

**Expected:**
- ✅ Specific error: "Firebase bağlantısı engellendi. Lütfen Reklam Engelleyici (AdBlock) eklentisini devre dışı bırakın veya bu site için beyaz listeye alın."
- ✅ User stays logged in (doesn't get signed out)
- ❌ No generic error
- ❌ Not signed out immediately

**Fail if:**
- Generic error message
- User gets signed out immediately
- Error doesn't mention AdBlocker

---

### Scenario 3.2: Disabling AdBlocker Fixes Issue

**Steps:**
1. With AdBlocker enabled, see the error message
2. Disable AdBlocker for localhost or turn off completely
3. Refresh page

**Expected:**
- ✅ Error message disappears
- ✅ User data loads correctly from Firestore
- ✅ App works normally
- ✅ Role displays correctly

**Fail if:**
- Error persists after disabling AdBlocker
- User data doesn't load
- App still has connection issues

---

## Scenario 4: Cloud Functions Security 🔴 CRITICAL

**What it tests:** Cloud Functions have proper authentication

### Scenario 4.1: Unauthenticated User Cannot Send Notifications

**Steps:**
1. Log out
2. Open DevTools → Console
3. Try to call sendNotification function:
```javascript
// This should fail because not logged in
firebase.functions().httpsCallable('sendNotification')({
  type: 'booking_confirmation',
  bookingData: { /* ... */ }
})
```

**Expected:**
- ✅ Returns error: "unauthenticated" or "Must be logged in"
- ❌ Cannot send notification
- ❌ No notification sent via SMS/WhatsApp

**Fail if:**
- Notification sent successfully while logged out
- No authentication check
- Generic error message

---

### Scenario 4.2: Business Owner Can Send Notifications

**Steps:**
1. Log in as business@test.com (Business Owner)
2. Create a test booking
3. Try to send booking confirmation:
   - Use admin panel or call function
4. Check if SMS/WhatsApp is sent (if configured)

**Expected:**
- ✅ Business owner can send notifications
- ✅ Notification sent via WhatsApp or SMS fallback
- ✅ Logs show successful send
- ❌ No permission errors

**Fail if:**
- Business owner cannot send notifications
- Permission denied error
- No notification sent

---

### Scenario 4.3: Customer Cannot Send Other's Notifications

**Steps:**
1. Log in as customer@test.com
2. Try to send notification for business@test.com's booking:
   - Use booking ID from business owner's account
3. Check if request is allowed

**Expected:**
- ❌ Customer cannot send notifications for other businesses
- ✅ Customer can send notifications for their own bookings
- ❌ Returns "permission-denied" or similar error

**Fail if:**
- Customer can send other business's notifications
- No permission check
- Notification sent for unowned booking

---

## Scenario 5: Scheduled Notifications ✅ NEW

**What it tests:** Automated reminders actually work

### Scenario 5.1: 24-Hour Reminder Sent

**Steps:**
1. Log in as business@test.com
2. Create a booking for tomorrow at 14:00
3. Check Firestore for booking:
   - `reminderSent24h: false`
   - `reminderSent2h: false`
4. Wait for scheduled function to run (or manually trigger)
5. Check phone (or logs) for SMS

**Expected:**
- ✅ SMS/WhatsApp sent 24 hours before appointment
- ✅ Firestore updated: `reminderSent24h: true`
- ✅ Cloud Functions logs show success
- ❌ No "function crashed" errors

**Fail if:**
- Only flag set, no SMS sent
- Function crashes
- No reminder sent

---

### Scenario 5.2: 2-Hour Reminder Sent

**Steps:**
1. Create a booking for 2 hours from now
2. Wait for scheduled function (runs every 30 minutes)
3. Check phone (or logs) for SMS
4. Check Firestore:
   - `reminderSent2h: true`
   - `reminderSent24h: true` (if >24h away)

**Expected:**
- ✅ SMS/WhatsApp sent 2 hours before appointment
- ✅ Firestore updated: `reminderSent2h: true`
- ✅ Timestamp-based query works
- ✅ No errors in logs

**Fail if:**
- 2-hour reminder not sent
- Timestamp query fails
- Function errors

---

## Scenario 6: Business Owner CRUD Operations ✅ WORKING

**What it tests:** Business owners can manage their data

### Scenario 6.1: Create/Update/Delete Services

**Steps:**
1. Log in as business@test.com
2. Go to Services page
3. Create a new service:
   - Name: "Test Service"
   - Price: 100
   - Duration: 30 min
4. Update the service
5. Delete the service

**Expected:**
- ✅ Can create services
- ✅ Can update services
- ✅ Can delete services
- ✅ Only own services shown
- ❌ Cannot access other businesses' services

**Fail if:**
- Cannot create/update/delete
- Can access other businesses' services
- Permission denied for own data

---

### Scenario 6.2: Create/Update/Delete Staff

**Steps:**
1. Log in as business@test.com
2. Go to Staff page
3. Create a new staff member:
   - Name: "Test Staff"
   - Phone: "5551234567"
4. Update the staff
5. Delete the staff

**Expected:**
- ✅ Can create staff
- ✅ Can update staff
- ✅ Can delete staff
- ✅ Phone validation works (10 digits, starts with 5)
- ❌ Cannot access other businesses' staff

**Fail if:**
- Cannot create/update/delete
- Phone validation doesn't work
- Can access other businesses' staff

---

## Scenario 7: Customer Booking Flow ✅ WORKING

**What it tests:** End-to-end booking works with security

### Scenario 7.1: Complete Booking Journey

**Steps:**
1. Log in as customer@test.com
2. Search for "Test Salon"
3. Select service: "Test Service"
4. Select staff: "Test Staff"
5. Select date and time
6. Fill contact form:
   - Name: "Test Booking"
   - Phone: "5551234567"
   - Email: "booking@test.com"
7. Confirm booking

**Expected:**
- ✅ Booking created successfully
- ✅ Confirmation message shown
- ✅ Booking appears in customer dashboard
- ✅ Business owner sees booking in dashboard
- ✅ Notification sent (if configured)

**Fail if:**
- Booking creation fails
- No confirmation shown
- Booking not visible to customer
- Booking not visible to business owner

---

### Scenario 7.2: Booking Conflict Handling

**Steps:**
1. Log in as customer@test.com
2. Book same slot twice (or use two accounts)
3. Second booking attempt should fail

**Expected:**
- ✅ Second booking shows conflict error
- ✅ Message: "Maalesef bu saat dilimi az önce başka bir kullanıcı tarafından rezerve edildi"
- ✅ Only one booking created
- ❌ No double bookings

**Fail if:**
- Can book same slot multiple times
- No conflict error
- Double bookings created

---

## Scenario 8: Security Bypass Attempts 🔴 CRITICAL

**What it tests:** Attackers cannot bypass security

### Scenario 8.1: Direct URL Access Without Login

**Steps:**
1. Log out
2. Try to access admin dashboard: http://localhost:5173/admin
3. Try to access protected pages:
   - `/admin/services`
   - `/admin/staff`
   - `/admin/schedule`

**Expected:**
- ✅ Redirected to login page
- ✅ Cannot access admin without authentication
- ✅ Protected routes work correctly
- ❌ Cannot access admin dashboard

**Fail if:**
- Can access admin without login
- Protected routes accessible
- No redirect to login

---

### Scenario 8.2: Role Bypass Attempt

**Steps:**
1. Log in as customer@test.com
2. Open DevTools → Console
3. Try to manually change user role:
```javascript
// This should not work
localStorage.setItem('erandevu_role_CUSTOMER_UID', 'admin');
// Navigate to admin
window.location.href = '/admin';
```

**Expected:**
- ✅ Role change ignored
- ✅ Cannot access admin dashboard
- ✅ Redirected back to customer dashboard
- ❌ No admin access

**Fail if:**
- Can access admin dashboard
- Role change works
- No security check

---

### Scenario 8.3: API Key Exposure Check

**Steps:**
1. Check browser DevTools → Network tab
2. Refresh page
3. Look at Firebase API calls
4. Check if API key is exposed

**Expected:**
- ✅ API key is in `.env.local` (not committed)
- ✅ API key is not in bundle
- ✅ API key is not visible in network requests (normal for Firebase)

**Fail if:**
- API key hardcoded in JavaScript
- API key visible in bundle
- Sensitive credentials in source code

---

## Scenario 9: Error Handling & User Experience ⚠️ MEDIUM

**What it tests:** Users see helpful error messages

### Scenario 9.1: Network Error Shows Clear Message

**Steps:**
1. Disconnect internet
2. Try to log in
3. Try to refresh page
4. Try to create booking

**Expected:**
- ✅ Clear error: "Veritabanı bağlantı hatası. Lütfen internet bağlantınızı kontrol edin."
- ✅ User stays logged in if already authenticated
- ✅ App doesn't crash
- ❌ No generic error

**Fail if:**
- Generic error message
- App crashes
- User gets signed out

---

### Scenario 9.2: Permission Error Shows Clear Message

**Steps:**
1. Log in as customer@test.com
2. Try to access admin URL directly
3. Try to access business owner pages

**Expected:**
- ✅ Clear error or redirect
- ✅ Redirected to appropriate page
- ✅ No vague "Access denied" message
- ✅ User knows why access denied

**Fail if:**
- Vague error message
- No explanation
- User confusion

---

## Scenario 10: Cross-Browser Testing ✅ QUALITY

**What it tests:** Security works across browsers

### Scenario 10.1: Test in Chrome

**Steps:**
1. Open Chrome
2. Run all critical scenarios:
   - Scenario 1 (Multi-tenant)
   - Scenario 2 (Auth)
   - Scenario 4 (Cloud Functions)
3. Check if all work as expected

**Expected:**
- ✅ All scenarios pass in Chrome
- ✅ No browser-specific issues
- ✅ Console shows no errors

**Fail if:**
- Browser-specific issues
- Different behavior than expected

---

### Scenario 10.2: Test in Firefox

**Steps:**
1. Open Firefox
2. Run all critical scenarios
3. Check behavior matches Chrome

**Expected:**
- ✅ Consistent behavior with Chrome
- ✅ All scenarios pass
- ✅ No browser-specific issues

**Fail if:**
- Different behavior than Chrome
- Browser-specific bugs

---

### Scenario 10.3: Test in Safari (if available)

**Steps:**
1. Open Safari
2. Run critical scenarios
3. Check behavior

**Expected:**
- ✅ Consistent behavior
- ✅ All scenarios pass
- ✅ No Safari-specific issues

**Fail if:**
- Safari-specific bugs
- Different behavior

---

## Test Execution Summary

### Quick Reference

| Scenario | What it Tests | Criticality | Time |
|---|---|---|---|
| 1.1 | Business owner data isolation | 🔴 CRITICAL | 5 min |
| 1.2 | Customer data isolation | 🔴 CRITICAL | 5 min |
| 2.1 | localStorage role bypass | 🔴 CRITICAL | 5 min |
| 2.2 | Invalid login errors | 🔴 CRITICAL | 5 min |
| 3.1 | AdBlocker error message | ⚠️ MEDIUM | 5 min |
| 3.2 | AdBlocker fix | ⚠️ MEDIUM | 5 min |
| 4.1 | Unauthenticated Cloud Functions | 🔴 CRITICAL | 5 min |
| 4.2 | Business owner notifications | 🔴 CRITICAL | 5 min |
| 4.3 | Customer notification restrictions | 🔴 CRITICAL | 5 min |
| 5.1 | 24-hour reminder | ✅ NEW | 1 hr* |
| 5.2 | 2-hour reminder | ✅ NEW | 30 min* |
| 6.1 | Service CRUD | ✅ WORKING | 5 min |
| 6.2 | Staff CRUD | ✅ WORKING | 5 min |
| 7.1 | Booking flow | ✅ WORKING | 10 min |
| 7.2 | Booking conflict | ✅ WORKING | 5 min |
| 8.1 | Direct URL access | 🔴 CRITICAL | 5 min |
| 8.2 | Role bypass | 🔴 CRITICAL | 5 min |
| 8.3 | API key exposure | 🔴 CRITICAL | 5 min |
| 9.1 | Network error | ⚠️ MEDIUM | 5 min |
| 9.2 | Permission error | ⚠️ MEDIUM | 5 min |
| 10.1 | Chrome browser | ✅ QUALITY | 30 min |
| 10.2 | Firefox browser | ✅ QUALITY | 30 min |
| 10.3 | Safari browser | ✅ QUALITY | 30 min |

* Requires waiting for scheduled functions

**Total Time:** ~3 hours (excluding wait times for scheduled functions)

---

## Test Execution Order

### 1. Critical Security (30 minutes)
- Scenario 1.1 (Business data isolation)
- Scenario 1.2 (Customer data isolation)
- Scenario 2.1 (localStorage bypass)
- Scenario 2.2 (Invalid login)
- Scenario 4.1 (Unauthenticated Cloud Functions)
- Scenario 4.2 (Business notifications)
- Scenario 4.3 (Customer restrictions)
- Scenario 8.1 (Direct URL access)
- Scenario 8.2 (Role bypass)
- Scenario 8.3 (API key exposure)

### 2. Functional Testing (30 minutes)
- Scenario 3.1 (AdBlocker error)
- Scenario 3.2 (AdBlocker fix)
- Scenario 9.1 (Network error)
- Scenario 9.2 (Permission error)
- Scenario 6.1 (Service CRUD)
- Scenario 6.2 (Staff CRUD)
- Scenario 7.1 (Booking flow)
- Scenario 7.2 (Booking conflict)

### 3. New Features (1.5 hours*)
- Scenario 5.1 (24-hour reminder)
- Scenario 5.2 (2-hour reminder)

### 4. Cross-Browser (1 hour)
- Scenario 10.1 (Chrome)
- Scenario 10.2 (Firefox)
- Scenario 10.3 (Safari)

---

## Reporting Format

For each scenario, report:

```
Scenario: X.Y
Status: ✅ PASS / ❌ FAIL
What happened: [Brief description]
Expected: [What should happen]
Screenshots: [Attach if applicable]
Notes: [Any additional observations]
```

---

## Success Criteria

### ✅ All Critical Scenarios Pass
- Scenarios 1, 2, 4, 8 all pass
- Security vulnerabilities fixed
- Multi-tenant isolation working
- Authentication bypass prevented

### ✅ All Medium Scenarios Pass
- Scenarios 3, 9 pass
- Error messages helpful
- User experience improved

### ✅ All Working Scenarios Pass
- Scenarios 6, 7 pass
- Existing functionality intact
- No regressions

### ✅ New Features Work
- Scenarios 5 pass
- Scheduled notifications working
- Cloud Functions functioning

### ✅ Cross-Browser Consistency
- Scenarios 10 pass
- Consistent behavior
- No browser-specific issues

---

## Next Steps

### If All Scenarios Pass ✅
1. Document results
2. Upgrade to Firebase Blaze plan
3. Configure environment variables
4. Deploy Cloud Functions
5. Proceed to Phase 2: Testing Infrastructure

### If Any Scenario Fails ❌
1. Document failure details
2. Investigate root cause
3. Fix issue
4. Re-test failed scenario
5. Update security rules if needed
