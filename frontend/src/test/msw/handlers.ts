import { http, HttpResponse } from 'msw';

// Firebase Firestore REST API base
const FIRESTORE_BASE = 'https://firestore.googleapis.com/v1/projects/*/databases/*/documents';

export const handlers = [
  // Businesses collection
  http.get(`${FIRESTORE_BASE}/businesses*`, () => {
    return HttpResponse.json({
      documents: [
        {
          name: 'projects/test/databases/(default)/documents/businesses/biz-1',
          fields: {
            name: { stringValue: 'Test Salon' },
            email: { stringValue: 'test@salon.com' },
            slug: { stringValue: 'test-salon' },
            isActive: { booleanValue: true },
            onboardingCompleted: { booleanValue: true },
            ownerId: { stringValue: 'user-1' },
            settings: {
              mapValue: {
                fields: {
                  slotDuration: { integerValue: '30' },
                  currency: { stringValue: 'TRY' },
                  timezone: { stringValue: 'Europe/Istanbul' },
                },
              },
            },
          },
        },
      ],
    });
  }),

  // Services collection
  http.get(`${FIRESTORE_BASE}/services*`, () => {
    return HttpResponse.json({
      documents: [
        {
          name: 'projects/test/databases/(default)/documents/services/srv-1',
          fields: {
            name: { stringValue: 'Saç Kesimi' },
            durationMinutes: { integerValue: '30' },
            price: { integerValue: '150' },
            category: { stringValue: 'Saç' },
            isActive: { booleanValue: true },
            businessId: { stringValue: 'biz-1' },
          },
        },
        {
          name: 'projects/test/databases/(default)/documents/services/srv-2',
          fields: {
            name: { stringValue: 'Saç Boyama' },
            durationMinutes: { integerValue: '60' },
            price: { integerValue: '300' },
            category: { stringValue: 'Saç' },
            isActive: { booleanValue: true },
            businessId: { stringValue: 'biz-1' },
          },
        },
      ],
    });
  }),

  // Staff collection
  http.get(`${FIRESTORE_BASE}/staff*`, () => {
    return HttpResponse.json({
      documents: [
        {
          name: 'projects/test/databases/(default)/documents/staff/staff-1',
          fields: {
            name: { stringValue: 'Ayşe Hanım' },
            email: { stringValue: 'ayse@salon.com' },
            phone: { stringValue: '+905001234567' },
            isActive: { booleanValue: true },
            businessId: { stringValue: 'biz-1' },
          },
        },
      ],
    });
  }),

  // Appointments collection
  http.get(`${FIRESTORE_BASE}/appointments*`, () => {
    return HttpResponse.json({
      documents: [
        {
          name: 'projects/test/databases/(default)/documents/appointments/appt-1',
          fields: {
            customerName: { stringValue: 'Ahmet Yılmaz' },
            customerPhone: { stringValue: '+905551234567' },
            status: { stringValue: 'confirmed' },
            businessId: { stringValue: 'biz-1' },
            staffId: { stringValue: 'staff-1' },
          },
        },
      ],
    });
  }),
];