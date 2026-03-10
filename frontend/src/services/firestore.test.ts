import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getBusiness, getAllBusinesses, createService } from './firestore';
import * as FirebaseFirestore from 'firebase/firestore';

// Mock Firebase Firestore functions
vi.mock('firebase/firestore', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    getFirestore: vi.fn(),
    collection: vi.fn().mockReturnValue('mocked-collection'),
    doc: vi.fn().mockImplementation((_db, collectionPath, id) => `mocked-doc-${collectionPath}-${id}`),
    getDoc: vi.fn(),
    getDocs: vi.fn(),
    addDoc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    query: vi.fn().mockReturnValue('mocked-query'),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    serverTimestamp: vi.fn().mockReturnValue('mocked-timestamp'),
    Timestamp: {
      fromDate: vi.fn().mockImplementation((date) => ({ toDate: () => date })),
      now: vi.fn(),
    },
    onSnapshot: vi.fn(),
  };
});

// Mock local firebase config
vi.mock('../lib/firebase', () => ({
  db: {},
  COLLECTIONS: {
    BUSINESSES: 'businesses',
    SERVICES: 'services',
  }
}));

describe('Firestore Services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Business Operations', () => {
    it('getBusiness should return business data if exists', async () => {
      const mockBusinessData = { name: 'Test Salon', email: 'test@salon.com' };
      
      // Mock getDoc to return a snapshot that exists
      vi.mocked(FirebaseFirestore.getDoc).mockResolvedValueOnce({
        exists: () => true,
        id: 'biz-123',
        data: () => mockBusinessData,
      } as any);

      const result = await getBusiness('biz-123');
      
      expect(FirebaseFirestore.doc).toHaveBeenCalledWith({}, 'businesses', 'biz-123');
      expect(result).toEqual({ id: 'biz-123', ...mockBusinessData });
    });

    it('getBusiness should return null if business does not exist', async () => {
      // Mock getDoc to return a snapshot that doesn't exist
      vi.mocked(FirebaseFirestore.getDoc).mockResolvedValueOnce({
        exists: () => false,
      } as any);

      const result = await getBusiness('non-existent');
      
      expect(result).toBeNull();
    });

    it('getAllBusinesses should return an array of businesses', async () => {
      const mockDocs = [
        { id: 'biz-1', data: () => ({ name: 'Salon 1' }) },
        { id: 'biz-2', data: () => ({ name: 'Salon 2' }) },
      ];

      vi.mocked(FirebaseFirestore.getDocs).mockResolvedValueOnce({
        docs: mockDocs,
        empty: false,
      } as any);

      const result = await getAllBusinesses();

      expect(FirebaseFirestore.collection).toHaveBeenCalledWith({}, 'businesses');
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ id: 'biz-1', name: 'Salon 1' });
      expect(result[1]).toEqual({ id: 'biz-2', name: 'Salon 2' });
    });
  });

  describe('Service Operations', () => {
    it('createService should add a new document and return its ID', async () => {
      const mockServiceData = {
        name: 'Haircut',
        description: 'Basic haircut',
        durationMinutes: 30,
        price: 150,
        isActive: true,
      };

      vi.mocked(FirebaseFirestore.addDoc).mockResolvedValueOnce({
        id: 'new-service-id',
      } as any);

      const result = await createService('biz-123', mockServiceData as any);

      expect(FirebaseFirestore.addDoc).toHaveBeenCalledWith(
        'mocked-collection', 
        expect.objectContaining({
          businessId: 'biz-123',
          name: 'Haircut',
          order: 0,
          createdAt: 'mocked-timestamp',
          updatedAt: 'mocked-timestamp',
        })
      );
      expect(result).toBe('new-service-id');
    });
  });
});
