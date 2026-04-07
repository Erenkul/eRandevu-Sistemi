import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useAvailableSlots } from '../useFirestore';

vi.mock('../../services/firestore', () => ({
  getAvailableSlots: vi.fn(),
}));

import { getAvailableSlots } from '../../services/firestore';
const mockGetAvailableSlots = vi.mocked(getAvailableSlots);

const baseParams = {
  businessId: 'biz-1',
  staffId: 'staff-1',
  date: new Date('2025-06-15'),
  durationMinutes: 30,
};

const mockSlots = ['2025-06-15T09:00:00', '2025-06-15T09:30:00', '2025-06-15T10:00:00'];

describe('useAvailableSlots', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty state when businessId is missing', () => {
    const { result } = renderHook(() =>
      useAvailableSlots({ ...baseParams, businessId: undefined })
    );
    expect(result.current.data).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('returns empty state when staffId is missing', () => {
    const { result } = renderHook(() =>
      useAvailableSlots({ ...baseParams, staffId: undefined })
    );
    expect(result.current.data).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('returns empty state when date is missing', () => {
    const { result } = renderHook(() =>
      useAvailableSlots({ ...baseParams, date: undefined })
    );
    expect(result.current.data).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('fetches and returns available slots on success', async () => {
    mockGetAvailableSlots.mockResolvedValueOnce(mockSlots);

    const { result } = renderHook(() => useAvailableSlots(baseParams));

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual(mockSlots);
    expect(result.current.error).toBeNull();
    expect(mockGetAvailableSlots).toHaveBeenCalledWith(
      'biz-1',
      'staff-1',
      baseParams.date,
      30
    );
  });

  it('returns empty slots array when no slots available', async () => {
    mockGetAvailableSlots.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useAvailableSlots(baseParams));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('sets error when fetch fails', async () => {
    mockGetAvailableSlots.mockRejectedValueOnce(new Error('Slot query failed'));

    const { result } = renderHook(() => useAvailableSlots(baseParams));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBe('Slot query failed');
  });

  it('falls back to default error message', async () => {
    mockGetAvailableSlots.mockRejectedValueOnce({});

    const { result } = renderHook(() => useAvailableSlots(baseParams));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Müsait saatler alınamadı.');
  });

  it('re-fetches when date changes', async () => {
    const slotsDay2 = ['2025-06-16T09:00:00'];
    mockGetAvailableSlots
      .mockResolvedValueOnce(mockSlots)
      .mockResolvedValueOnce(slotsDay2);

    const { result, rerender } = renderHook(
      ({ date }) => useAvailableSlots({ ...baseParams, date }),
      { initialProps: { date: new Date('2025-06-15') } }
    );

    await waitFor(() => expect(result.current.data).toHaveLength(3));

    rerender({ date: new Date('2025-06-16') });

    await waitFor(() => expect(result.current.data).toHaveLength(1));
    expect(mockGetAvailableSlots).toHaveBeenCalledTimes(2);
  });

  it('re-fetches when staffId changes', async () => {
    mockGetAvailableSlots
      .mockResolvedValueOnce(mockSlots)
      .mockResolvedValueOnce(['2025-06-15T14:00:00']);

    const { result, rerender } = renderHook(
      ({ staffId }) => useAvailableSlots({ ...baseParams, staffId }),
      { initialProps: { staffId: 'staff-1' } }
    );

    await waitFor(() => expect(result.current.data).toHaveLength(3));

    rerender({ staffId: 'staff-2' });

    await waitFor(() => expect(result.current.data).toHaveLength(1));
    expect(mockGetAvailableSlots).toHaveBeenCalledTimes(2);
  });
});
