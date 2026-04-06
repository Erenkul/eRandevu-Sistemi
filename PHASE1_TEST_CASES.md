# Phase 1 Security Fixes — Test Cases

**Date:** April 6, 2026  
**Project:** eRandevu  
**Phase:** Phase 1 - Critical Security Fixes

---

## Test Environment Setup

### Prerequisites
- Firebase Blaze plan (for Cloud Functions)
- Environment variables configured (SMS/WhatsApp)
- Updated `.env.local` with new Firebase config (if rotated)
- No ad blockers enabled (or whitelist localhost)
- Two browser profiles (for multi-tenant testing)

### Test Users Needed
```
User A (Business Owner):
  Email: test-business@example.com
  Password: Test123456!
  Role: admin
  Business ID: biz-1

User B (Customer):
  Email: test-customer@example.com
  Password: Test123456!
  Role: customer
  Business ID: None
```

---

## Test Case Categories

### 1. Firestore Security Rules (C1-C4)

#### TC-FR-1: Multi-Tenant Data Leakage Prevention
**Objective:** Verify User A cannot list User B's appointments

**Steps:**
1. Log in as User A (Business Owner)
2. Open browser DevTools → Console
3. Execute:
```javascript
import { getDocs, collection, query, orderBy, limit } from 'firebase/firestore';
const db = await getFirestore();

// Try to list ALL appointments
const allAppointments = await getDocs(query(
  collection(db, 'appointments'),
  orderBy('dateTime', 'desc'),
  limit(100)
));

console.log('Total appointments:', allAppointments.size);
allAppointments.forEach(doc => {
  console.log('Appointment:', doc.id, doc.data());
});
```

**Expected Result:**
- ✅ Only returns appointments from User A's business
- ❌ Fails or returns empty list if trying to access other businesses
- ❌ Returns permission denied if not authenticated

**Pass Criteria:** Cannot access other businesses' appointments

---

#### TC-FR-2: Appointment Get Protection
**Objective:** Verify users cannot enumerate appointments by ID

**Steps:**
1. Log in as User A
2. Get an appointment ID from Firebase Console
3. Try to access another business's appointment:
```javascript
import { getDoc, doc } from 'firebase/firestore';

// Try to get random appointment ID (from other business)
const appointmentDoc = await getDoc(doc(db, 'appointments', 'RANDOM_ID_FROM_OTHER_BUSINESS'));
console.log('Appointment data:', appointmentDoc.data());
```

**Expected Result:**
- ✅ Permission denied for non-owned appointments
- ✅ Can only get own business's appointments
- ❌ Returns null if not authorized

**Pass Criteria:** Cannot retrieve other businesses' appointment data

---

#### TC-FR-3: Public Read Restrictions
**Objective:** Verify public access is restricted

**Steps:**
1. Log out (no authentication)
2. Try to access public endpoints:
```javascript
import { getDocs, collection } from 'firebase/firestore';

// Try to read businesses (should work for active ones)
const businesses = await getDocs(collection(db, 'businesses'));
console.log('Businesses:', businesses.size);

// Try to read services (should work for active businesses)
const services = await getDocs(collection(db, 'services'));
console.log('Services:', services.size);

// Try to read appointments (should FAIL)
const appointments = await getDocs(collection(db, 'appointments'));
console.log('Appointments:', appointments.size);
```

**Expected Result:**
- ✅ Can read businesses (public read for active)
- ✅ Can read services (public read for active)
- ❌ Cannot read appointments (requires authentication)

**Pass Criteria:** Authenticated users can list active businesses/services, not appointments

---

#### TC-FR-4: Daily Schedules Access Control
**Objective:** Verify only owners can create daily schedules

**Steps:**
1. Log in as User A (Business Owner)
2. Try to create a daily schedule:
```javascript
import { setDoc, doc } from 'firebase/firestore';

try {
  await setDoc(doc(db, 'daily_schedules', 'test-schedule'), {
    businessId: 'biz-1',
    staffId: 'staff-1',
    date: '2024-01-15',
    appointments: []
  });
  console.log('✅ Schedule created successfully');
} catch (error) {
  console.error('❌ Failed to create schedule:', error);
}
```

**Expected Result:**
- ✅ Business owner can create schedule
- ❌ Non-owner cannot create schedule (permission denied)

**Pass Criteria:** Only business owners can create daily schedules

---

### 2. AuthContext Security (C5)

#### TC-AC-1: No localStorage Role Fallback
**Objective:** Verify role is not stored in localStorage

**Steps:**
1. Log in as User A (Business Owner)
2. Open DevTools → Application → Local Storage
3. Search for keys containing "erandevu_role"
4. Try to manually modify role:
```javascript
// Try to inject admin role into localStorage
localStorage.setItem('erandevu_role_USER_UID', 'admin');
localStorage.setItem('erandevu_role_USER_UID', 'staff');

// Reload page and check role
location.reload();
```

**Expected Result:**
- ✅ No "erandevu_role_" keys in localStorage
- ✅ Modifying localStorage has no effect on actual role
- ✅ Role is fetched from Firestore on every page load
- ❌ Role cannot be manipulated via localStorage

**Pass Criteria:** localStorage role manipulation prevented

---

#### TC-AC-2: Firestore as Source of Truth
**Objective:** Verify role comes from Firestore, not localStorage

**Steps:**
1. Log in as User A (Business Owner)
2. Open DevTools → Network tab
3. Observe Firestore `getDoc` request for user document
4. Check the response:
```javascript
// In Console, check user data
import { useAuth } from './contexts/AuthContext';
const { user } = useAuth();
console.log('User role from Firestore:', user.role);
```

**Expected Result:**
- ✅ Role matches Firestore data
- ✅ Not defaulting to localStorage value
- ✅ If user doc doesn't exist, user is signed out

**Pass Criteria:** Role always from Firestore

---

#### TC-AC-3: Network Error Handling
**Objective:** Verify user stays logged in during network errors

**Steps:**
1. Log in as User A
2. Disable internet connection (or block Firestore in DevTools)
3. Reload page
4. Check user state:
```javascript
// In Console
import { useAuth } from './contexts/AuthContext';
const { user, error } = useAuth();
console.log('User state:', user, 'Error:', error);
```

**Expected Result:**
- ✅ User remains logged in (minimal data)
- ✅ Shows appropriate error message
- ✅ Not signed out on temporary network issues
- ✅ Role defaults to 'customer' until Firestore sync

**Pass Criteria:** Graceful handling of network errors

---

#### TC-AC-4: AdBlocker Error Message
**Objective:** Verify helpful error message for AdBlocker users

**Steps:**
1. Enable AdBlocker extension
2. Try to log in as User A
3. Observe error message
4. Check console for "ERR_BLOCKED_BY_CLIENT"

**Expected Result:**
- ✅ Shows specific error: "Firebase bağlantısı engellendi. Lütfen Reklam Engelleyici (AdBlock) eklentisini devre dışı bırakın veya bu site için beyaz listeye alın."
- ✅ User remains logged in with minimal data
- ❌ Not signed out immediately

**Pass Criteria:** Helpful error message for AdBlocker users

---

### 3. Cloud Functions Security (C6, C7)

#### TC-CF-1: Unauthenticated Access Blocked
**Objective:** Verify unauthenticated users cannot call Cloud Functions

**Steps:**
1. Log out (no auth)
2. Try to call sendNotification directly:
```javascript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const sendNotification = httpsCallable(functions, 'sendNotification');

try {
  const result = await sendNotification({
    type: 'booking_confirmation',
    bookingData: {
      appointmentId: 'test-apt',
      customerName: 'Test',
      customerPhone: '+905551234567',
      // ... other fields
    }
  });
  console.log('Result:', result.data);
} catch (error) {
  console.error('Error:', error);
}
```

**Expected Result:**
- ❌ Returns "unauthenticated" error
- ❌ Message: "Must be logged in to send notifications"
- ✅ No notification sent

**Pass Criteria:** Unauthenticated access blocked

---

#### TC-CF-2: Permission Check for Booking Notifications
**Objective:** Verify users can only send notifications for their own bookings

**Steps:**
1. Log in as User A (Business Owner)
2. Create a test booking (via UI or console)
3. Get booking ID
4. Try to send notification:
```javascript
import { getFunctions, httpsCallable } from 'firebase/functions';

const sendNotification = httpsCallable(getFunctions(), 'sendNotification');

try {
  const result = await sendNotification({
    type: 'booking_confirmation',
    bookingData: {
      appointmentId: 'test-apt-id',
      customerName: 'Test Customer',
      customerPhone: '+905551234567',
      serviceName: 'Haircut',
      staffName: 'John',
      date: '2024-01-15',
      time: '14:00',
      businessName: 'Test Salon'
    }
  });
  console.log('✅ Notification sent:', result.data);
} catch (error) {
  console.error('❌ Error:', error);
}
```

**Expected Result:**
- ✅ Business owner can send notifications for their bookings
- ❌ Customer cannot send notifications for other businesses
- ❌ Returns "permission-denied" if not owner

**Pass Criteria:** Only business owners can send notifications

---

#### TC-CF-3: Customer Can Send Own Notifications
**Objective:** Verify customers can send notifications for their own bookings

**Steps:**
1. Log in as User B (Customer)
2. Create a booking
3. Send notification for that booking
4. Try to send notification for other booking:
```javascript
// Try to send notification for another customer's booking
await sendNotification({
  type: 'booking_confirmation',
  bookingData: {
    appointmentId: 'OTHER_CUSTOMER_BOOKING_ID', // Not owned by this user
    // ... other fields
  }
});
```

**Expected Result:**
- ✅ Can send notification for own booking
- ❌ Cannot send for other's booking (permission denied)

**Pass Criteria:** Customers can only send notifications for their own bookings

---

#### TC-CF-4: Scheduled Functions Actually Send Notifications
**Objective:** Verify scheduled functions send real notifications

**Prerequisite:** SMS/WhatsApp credentials configured

**Steps:**
1. Create a test booking for tomorrow
2. Verify booking in Firestore:
```javascript
import { getDoc, doc } from 'firebase/firestore';

const booking = await getDoc(doc(db, 'appointments', 'TEST_BOOKING_ID'));
console.log('Booking:', booking.data());
// Check: reminderSent24h: false, reminderSent2h: false
```

3. Wait for scheduled function to run (1 hour for 24h reminder)
4. Check Cloud Functions logs:
```bash
firebase functions:log
```

5. Verify phone received SMS

**Expected Result:**
- ✅ 24-hour reminder SMS/WhatsApp sent
- ✅ Firestore flag updated: `reminderSent24h: true`
- ✅ Logs show success count
- ❌ No error logs

**Pass Criteria:** Scheduled functions actually send notifications (not just set flags)

---

#### TC-CF-5: 2-Hour Reminder Works
**Objective:** Verify 2-hour reminder works with Timestamp queries

**Steps:**
1. Create a booking for 2 hours from now
2. Wait 30 minutes (scheduled function runs every 30 min)
3. Check if notification sent:
```javascript
import { getDoc, doc } from 'firebase/firestore';

const booking = await getDoc(doc(db, 'appointments', 'TEST_BOOKING_ID'));
console.log('Reminder flags:', {
  reminderSent24h: booking.data().reminderSent24h,
  reminderSent2h: booking.data().reminderSent2h
});
```

**Expected Result:**
- ✅ 2-hour reminder sent
- ✅ Timestamp query works correctly
- ✅ Firestore flag updated: `reminderSent2h: true`

**Pass Criteria:** Timestamp-based queries work correctly

---

### 4. Cross-Tenant Isolation Tests

#### TC-CT-1: User A Cannot Access User B's Data
**Objective:** Complete multi-tenant isolation test

**Steps:**
1. Open two browser profiles (incognito or different browser)
2. Profile 1: Log in as User A (Business Owner)
3. Profile 2: Log in as User B (Customer)
4. In Profile 2, try to access User A's data:
```javascript
import { getDocs, collection, query, where } from 'firebase/firestore';

// Try to get User A's appointments
const appointments = await getDocs(
  query(collection(db, 'appointments'), 
    where('businessId', '==', 'biz-1')
  )
);
console.log('Appointments from biz-1:', appointments.size);
```

**Expected Result:**
- ❌ Profile 2 cannot access User A's appointments
- ✅ Profile 1 can access their own appointments
- ✅ Each user only sees their own data

**Pass Criteria:** Complete tenant isolation

---

#### TC-CT-2: Business Owner Cannot Read Other Businesses
**Objective:** Verify business owners cannot read competitor data

**Steps:**
1. Log in as User A (Business Owner)
2. Try to read other businesses' data:
```javascript
import { getDocs, collection, query, where } from 'firebase/firestore';

// Try to read another business's services
const otherServices = await getDocs(
  query(collection(db, 'services'), 
    where('businessId', '==', 'OTHER_BUSINESS_ID')
  )
);
console.log('Other business services:', otherServices.size);
```

**Expected Result:**
- ❌ Cannot read other businesses' services
- ✅ Can only read own business's services
- ❌ Permission denied for unauthorized access

**Pass Criteria:** Business data isolation

---

### 5. Edge Cases & Security Bypass Attempts

#### TC-EC-1: Try to Bypass Auth with localStorage
**Objective:** Attempt localStorage injection attack

**Steps:**
1. Open DevTools → Console
2. Inject fake user data:
```javascript
localStorage.setItem('erandevu_role_TEST_UID', 'admin');
localStorage.setItem('erandevu_businessId_TEST_UID', 'biz-1');

// Try to access admin functionality
// (This should fail because AuthContext ignores localStorage)
```

**Expected Result:**
- ❌ Cannot bypass authentication
- ❌ Cannot access admin routes
- ✅ Server-side checks prevent access

**Pass Criteria:** localStorage injection prevented

---

#### TC-EC-2: Direct Firestore Access (Client)
**Objective:** Try to access Firestore directly

**Steps:**
1. Log in as User B (Customer)
2. Try to directly query all businesses:
```javascript
import { getDocs, collection } from 'firebase/firestore';

// Try to bypass app logic and query directly
const allBusinesses = await getDocs(collection(db, 'businesses'));
console.log('All businesses:', allBusinesses.size);

// Try to query appointments directly
const allAppointments = await getDocs(collection(db, 'appointments'));
console.log('All appointments:', allAppointments.size);
```

**Expected Result:**
- ✅ Can read businesses (public read for active)
- ❌ Cannot read appointments (requires businessId or customerPhone)
- ❌ Firestore rules prevent unauthorized access

**Pass Criteria:** Direct Firestore access controlled

---

#### TC-EC-3: Try to Modify Booking Without Auth
**Objective:** Attempt to modify booking data directly

**Steps:**
1. Log out
2. Try to update a booking:
```javascript
import { updateDoc, doc } from 'firebase/firestore';

try {
  await updateDoc(doc(db, 'appointments', 'TEST_BOOKING_ID'), {
    status: 'cancelled'
  });
  console.log('✅ Booking updated');
} catch (error) {
  console.error('❌ Failed:', error);
}
```

**Expected Result:**
- ❌ Cannot update without authentication
- ❌ Cannot update without ownership
- ✅ Permission denied

**Pass Criteria:** Write operations require auth + ownership

---

### 6. Integration Tests

#### TC-IT-1: Full Booking Flow with Security
**Objective:** Verify booking flow works with new security

**Steps:**
1. Log in as User B (Customer)
2. Navigate to booking page
3. Select service, staff, date/time
4. Fill contact form
5. Submit booking

**Expected Result:**
- ✅ Booking created successfully
- ✅ Firestore rules allow creation
- ✅ User sees confirmation
- ✅ Business owner sees booking in dashboard

**Pass Criteria:** Booking flow works end-to-end

---

#### TC-IT-2: Business Owner Workflow
**Objective:** Verify business owner can manage their data

**Steps:**
1. Log in as User A (Business Owner)
2. Try CRUD operations:
   - Create service ✅
   - Update service ✅
   - Delete service ✅
   - Create staff ✅
   - Update staff ✅
   - Delete staff ✅
3. Try to access other business's data ❌

**Expected Result:**
- ✅ Full CRUD on own data
- ❌ Cannot access other's data
- ✅ Role-based access working

**Pass Criteria:** Business owner workflow intact

---

## Test Execution Checklist

### Before Testing
- [ ] Firebase Blaze plan active
- [ ] Environment variables configured
- [ ] Ad blocker disabled (or whitelisted)
- [ ] Two test users created
- [ ] Browser DevTools open
- [ ] Network tab monitoring enabled

### Security Rules Tests
- [ ] TC-FR-1: Multi-tenant data leakage ✅
- [ ] TC-FR-2: Appointment get protection ✅
- [ ] TC-FR-3: Public read restrictions ✅
- [ ] TC-FR-4: Daily schedules access control ✅

### AuthContext Tests
- [ ] TC-AC-1: No localStorage role fallback ✅
- [ ] TC-AC-2: Firestore source of truth ✅
- [ ] TC-AC-3: Network error handling ✅
- [ ] TC-AC-4: AdBlocker error message ✅

### Cloud Functions Tests
- [ ] TC-CF-1: Unauthenticated access blocked ✅
- [ ] TC-CF-2: Permission check for bookings ✅
- [ ] TC-CF-3: Customer can send own notifications ✅
- [ ] TC-CF-4: Scheduled functions send notifications ✅
- [ ] TC-CF-5: 2-hour reminder works ✅

### Cross-Tenant Tests
- [ ] TC-CT-1: User A cannot access User B's data ✅
- [ ] TC-CT-2: Business owner cannot read other businesses ✅

### Edge Cases
- [ ] TC-EC-1: localStorage injection prevented ✅
- [ ] TC-EC-2: Direct Firestore access controlled ✅
- [ ] TC-EC-3: Write operations require auth ✅

### Integration Tests
- [ ] TC-IT-1: Full booking flow works ✅
- [ ] TC-IT-2: Business owner workflow works ✅

---

## Expected Results Summary

### Security Fixes Verification
| Fix | Test Case | Expected Behavior |
|---|---|---|
| C1: Multi-tenant data leak | TC-FR-1, TC-CT-1 | Users only see their own data |
| C2: Public read restriction | TC-FR-3 | Only authenticated users can access appointments |
| C3: Appointment get protection | TC-FR-2 | Users cannot enumerate appointments by ID |
| C4: Creation abuse prevention | TC-FR-4, TC-EC-3 | Only owners can create/update resources |
| C5: localStorage role removed | TC-AC-1, TC-AC-2 | Role always from Firestore |
| C6: Cloud Functions auth | TC-CF-1, TC-CF-2, TC-CF-3 | Unauthenticated access blocked |
| C7: Scheduled functions work | TC-CF-4, TC-CF-5 | Notifications actually sent |

---

## Pass/Fail Criteria

### ✅ PASS
- Security rule denies unauthorized access
- AuthContext doesn't use localStorage for role
- Cloud Functions return appropriate errors
- Users can only access their own data
- Error messages are clear and helpful

### ❌ FAIL
- Unauthorized access succeeds
- localStorage can be used to bypass auth
- Cloud Functions allow unauthenticated calls
- Users can access other tenants' data
- Error messages are vague or misleading

---

## Reporting Format

For each test case, report:

```
Test Case: TC-XXX
Status: ✅ PASS / ❌ FAIL
Actual Result: [What actually happened]
Expected Result: [What should happen]
Screenshots/Logs: [Attach evidence]
```

---

## Next Steps After Testing

### If All Tests Pass ✅
1. Document test results
2. Proceed to Phase 2: Testing Infrastructure
3. Consider deployment to production

### If Tests Fail ❌
1. Document failures
2. Investigate root cause
3. Fix issues
4. Re-test failed cases
5. Update security rules if needed

---

## Additional Notes

- Always test in both dev and production environments
- Use browser DevTools to inspect network requests
- Check Cloud Functions logs for errors: `firebase functions:log`
- Verify Firestore rules in Console Playground
- Test with different user roles (admin, staff, customer)
- Test with multiple browsers (Chrome, Firefox, Safari)
