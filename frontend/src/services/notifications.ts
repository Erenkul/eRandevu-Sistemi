import { collection, addDoc, updateDoc, doc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

export type NotificationType = 
  | 'appointment_created'
  | 'appointment_confirmed' 
  | 'appointment_completed'
  | 'appointment_cancelled'
  | 'new_appointment_request';

interface NotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  appointmentId?: string;
  businessId?: string;
  read: boolean;
  createdAt: Timestamp;
}

export async function createNotification(data: Omit<NotificationData, 'read' | 'createdAt'>): Promise<string> {
  console.log('[createNotification] Creating notification:', data);
  try {
    const docRef = await addDoc(collection(db, 'notifications'), {
      ...data,
      read: false,
      createdAt: serverTimestamp(),
    });
    console.log('[createNotification] Success, ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('[createNotification] Error:', error);
    throw error;
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  await updateDoc(doc(db, 'notifications', notificationId), { read: true });
}
