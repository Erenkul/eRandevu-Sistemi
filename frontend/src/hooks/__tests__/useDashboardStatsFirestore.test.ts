import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useDashboardStats } from '../useFirestore';
import { mockAppointment, mockCustomer } from '../../test/fixtures';

vi.mock('../../services/firestore', () => ({
  getTodayAppointments: vi.fn(),
  getAppointments: vi.fn(),
  getCustomers: vi.fn(),
}));

import { getTodayAppointments, getAppointments, getCustomers } from '../../services/firestore';
const mockGetToday = vi.mocked(getTodayAppointments);
const mockGetAppointments = vi.mocked(getAppointments);
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
    const pending = { ...mockAppointment, id: 'appt-2', status: 'pending' as const, totalPrice: 100 };
    mockGetToday.mockResolvedValueOnce([completed, pending]);
    mockGetAppointments.mockResolvedValueOnce([completed]);
    mockGetCustomers.mockResolvedValueOnce([mockCustomer]);

    const { result } = renderHook(() => useDashboardStats('biz-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual({
      todayCount: 2,
      todayRevenue: 250,
      totalCustomers: 1,
      pendingCount: 1,
      confirmedCount: 0,
      weeklyCount: 1,
    });
  });

  it('counts confirmed appointments correctly', async () => {
    const confirmed = { ...mockAppointment, status: 'confirmed' as const, totalPrice: 150 };
    mockGetToday.mockResolvedValueOnce([confirmed]);
    mockGetAppointments.mockResolvedValueOnce([confirmed]);
    mockGetCustomers.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useDashboardStats('biz-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data!.pendingCount).toBe(0);
    expect(result.current.data!.confirmedCount).toBe(1);
    expect(result.current.data!.todayRevenue).toBe(150);
  });

  it('sets error on failure', async () => {
    mockGetToday.mockRejectedValueOnce(new Error('Stats failed'));
    mockGetAppointments.mockResolvedValueOnce([]);
    mockGetCustomers.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useDashboardStats('biz-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Stats failed');
    expect(result.current.data).toBeNull();
  });

  it('falls back to default error message', async () => {
    mockGetToday.mockRejectedValueOnce({});
    mockGetAppointments.mockResolvedValueOnce([]);
    mockGetCustomers.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useDashboardStats('biz-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('İstatistikler alınamadı.');
  });
});
