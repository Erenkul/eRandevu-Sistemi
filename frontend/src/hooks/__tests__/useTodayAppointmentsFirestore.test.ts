import { renderHook, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useTodayAppointments } from '../useFirestore';
import { mockAppointment } from '../../test/fixtures';

vi.mock('../../services/firestore', () => ({
  getTodayAppointments: vi.fn(),
}));

import { getTodayAppointments } from '../../services/firestore';
const mockGetToday = vi.mocked(getTodayAppointments);

describe('useTodayAppointments (useFirestore)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns empty array when businessId is undefined', async () => {
    const { result } = renderHook(() => useTodayAppointments(undefined));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual([]);
  });

  it('fetches today appointments', async () => {
    mockGetToday.mockResolvedValueOnce([mockAppointment]);

    const { result } = renderHook(() => useTodayAppointments('biz-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual([mockAppointment]);
    expect(result.current.error).toBeNull();
    expect(mockGetToday).toHaveBeenCalledWith('biz-1');
  });

  it('returns empty array when no appointments today', async () => {
    mockGetToday.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useTodayAppointments('biz-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual([]);
  });

  it('sets error when fetch fails', async () => {
    mockGetToday.mockRejectedValueOnce(new Error('Fetch error'));

    const { result } = renderHook(() => useTodayAppointments('biz-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Fetch error');
    expect(result.current.data).toEqual([]);
  });

  it('falls back to default error message', async () => {
    mockGetToday.mockRejectedValueOnce({});

    const { result } = renderHook(() => useTodayAppointments('biz-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Bugünkü randevular alınamadı.');
  });

  it('refetch works', async () => {
    mockGetToday.mockResolvedValue([mockAppointment]);

    const { result } = renderHook(() => useTodayAppointments('biz-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.refetch());
    await waitFor(() => expect(mockGetToday).toHaveBeenCalledTimes(2));
  });
});
