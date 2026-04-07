import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useDashboardStats } from '../useFirestore';
import { mockAppointment, mockAppointmentPending, mockCustomer } from '../../test/fixtures';

vi.mock('../../services/firestore', () => ({
  getTodayAppointments: vi.fn(),
  getAppointments: vi.fn(),
  getCustomers: vi.fn(),
}));

import { getTodayAppointments, getAppointments, getCustomers } from '../../services/firestore';
const mockGetToday = vi.mocked(getTodayAppointments);
const mockGetAppointments = vi.mocked(getAppointments);
const mockGetCustomers = vi.mocked(getCustomers);

describe('useDashboardStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null data when businessId is undefined', () => {
    const { result } = renderHook(() => useDashboardStats(undefined));
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('computes stats correctly from fetched data', async () => {
    mockGetToday.mockResolvedValueOnce([mockAppointment, mockAppointmentPending]);
    mockGetAppointments.mockResolvedValueOnce([mockAppointment]);
    mockGetCustomers.mockResolvedValueOnce([mockCustomer]);

    const { result } = renderHook(() => useDashboardStats('biz-1'));

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    const stats = result.current.data;
    expect(stats).not.toBeNull();
    expect(stats!.todayCount).toBe(2); // confirmed + pending both count (neither cancelled/noShow)
    expect(stats!.todayRevenue).toBe(300); // 150 + 150
    expect(stats!.weeklyCount).toBe(1);
    expect(stats!.totalCustomers).toBe(1);
    expect(stats!.pendingCount).toBe(1);
    expect(stats!.confirmedCount).toBe(1);
  });

  it('excludes cancelled and noShow appointments from today count', async () => {
    const cancelled = { ...mockAppointment, id: 'appt-c', status: 'cancelled' as const };
    const noShow = { ...mockAppointment, id: 'appt-n', status: 'noShow' as const };
    mockGetToday.mockResolvedValueOnce([mockAppointment, cancelled, noShow]);
    mockGetAppointments.mockResolvedValueOnce([]);
    mockGetCustomers.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useDashboardStats('biz-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data!.todayCount).toBe(1);
    expect(result.current.data!.todayRevenue).toBe(150);
  });

  it('handles customer fetch failure gracefully (non-blocking)', async () => {
    mockGetToday.mockResolvedValueOnce([mockAppointment]);
    mockGetAppointments.mockResolvedValueOnce([mockAppointment]);
    mockGetCustomers.mockRejectedValueOnce(new Error('No customers collection'));

    const { result } = renderHook(() => useDashboardStats('biz-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Stats should still load, totalCustomers defaults to 0
    expect(result.current.error).toBeNull();
    expect(result.current.data!.totalCustomers).toBe(0);
  });

  it('sets error when today appointments fetch fails', async () => {
    mockGetToday.mockRejectedValueOnce(new Error('Firestore error'));
    mockGetAppointments.mockResolvedValueOnce([]);
    mockGetCustomers.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useDashboardStats('biz-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('Firestore error');
  });

  it('falls back to default error message', async () => {
    mockGetToday.mockRejectedValueOnce({});
    mockGetAppointments.mockResolvedValueOnce([]);
    mockGetCustomers.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useDashboardStats('biz-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('İstatistikler alınamadı.');
  });

  it('calls all three data sources with correct businessId', async () => {
    mockGetToday.mockResolvedValueOnce([]);
    mockGetAppointments.mockResolvedValueOnce([]);
    mockGetCustomers.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useDashboardStats('biz-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockGetToday).toHaveBeenCalledWith('biz-1');
    expect(mockGetAppointments).toHaveBeenCalledWith('biz-1', expect.objectContaining({
      startDate: expect.any(Date),
      endDate: expect.any(Date),
    }));
    expect(mockGetCustomers).toHaveBeenCalledWith('biz-1');
  });
});
