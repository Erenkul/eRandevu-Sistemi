import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useDashboardStats } from '../useFirestore';
import { mockAppointment, mockAppointmentPending, mockCustomer } from '../../test/fixtures';

vi.mock('../../services/firestore', () => ({
  getTodayAppointments: vi.fn(),
  getCustomers: vi.fn(),
}));

import { getTodayAppointments, getCustomers } from '../../services/firestore';
const mockGetToday = vi.mocked(getTodayAppointments);
const mockGetCustomers = vi.mocked(getCustomers);

describe('useDashboardStats (useFirestore)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns null when businessId is undefined', async () => {
    const { result } = renderHook(() => useDashboardStats(undefined));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBeNull();
  });

  it('computes stats correctly', async () => {
    const completed = { ...mockAppointment, status: 'completed' as const, totalPrice: 150 };
    mockGetToday.mockResolvedValueOnce([completed, mockAppointmentPending]);
    mockGetCustomers.mockResolvedValueOnce([mockCustomer]);

    const { result } = renderHook(() => useDashboardStats('biz-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual({
      todayAppointments: 2,
      todayRevenue: 150,
      totalCustomers: 1,
      pendingAppointments: 1,
    });
  });

  it('counts confirmed as pending', async () => {
    const confirmed = { ...mockAppointment, status: 'confirmed' as const };
    mockGetToday.mockResolvedValueOnce([confirmed]);
    mockGetCustomers.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useDashboardStats('biz-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data!.pendingAppointments).toBe(1);
    expect(result.current.data!.todayRevenue).toBe(0); // confirmed, not completed
  });

  it('sets error on failure', async () => {
    mockGetToday.mockRejectedValueOnce(new Error('Stats failed'));
    mockGetCustomers.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useDashboardStats('biz-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Stats failed');
    expect(result.current.data).toBeNull();
  });

  it('falls back to default error message', async () => {
    mockGetToday.mockRejectedValueOnce({});
    mockGetCustomers.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useDashboardStats('biz-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('İstatistikler alınamadı.');
  });
});
