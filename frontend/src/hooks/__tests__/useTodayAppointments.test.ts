import { renderHook, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useTodayAppointments } from '../useFirestore';

vi.mock('../../services/firestore', () => ({
  getTodayAppointments: vi.fn(),
}));

import { getTodayAppointments } from '../../services/firestore';
const mockGetToday = vi.mocked(getTodayAppointments);

describe('useTodayAppointments', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns empty array when businessId is undefined', () => {
    const { result } = renderHook(() => useTodayAppointments(undefined));
    expect(result.current.data).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('fetches today appointments on success', async () => {
    mockGetToday.mockResolvedValueOnce([{ id: 'apt-1', businessId: 'biz-1' } as any]);

    const { result } = renderHook(() => useTodayAppointments('biz-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toHaveLength(1);
    expect(mockGetToday).toHaveBeenCalledWith('biz-1');
  });

  it('returns empty array when no appointments found', async () => {
    mockGetToday.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useTodayAppointments('biz-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual([]);
  });

  it('sets error when fetch fails', async () => {
    mockGetToday.mockRejectedValueOnce(new Error('Firestore error'));

    const { result } = renderHook(() => useTodayAppointments('biz-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBe('Firestore error');
  });

  it('falls back to default error message', async () => {
    mockGetToday.mockRejectedValueOnce({});

    const { result } = renderHook(() => useTodayAppointments('biz-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Bugünkü randevular alınamadı.');
  });

  it('refetch triggers a new request', async () => {
    mockGetToday.mockResolvedValue([]);

    const { result } = renderHook(() => useTodayAppointments('biz-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockGetToday).toHaveBeenCalledTimes(1);

    act(() => result.current.refetch());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockGetToday).toHaveBeenCalledTimes(2);
  });
});
