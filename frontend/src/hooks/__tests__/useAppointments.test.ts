import { renderHook, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useAppointments } from '../useFirestore';
import { mockAppointment } from '../../test/fixtures';

vi.mock('../../services/firestore', () => ({
  getAppointments: vi.fn(),
}));

import { getAppointments } from '../../services/firestore';
const mockGetAppointments = vi.mocked(getAppointments);

describe('useAppointments', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns empty array when businessId is undefined', async () => {
    const { result } = renderHook(() => useAppointments(undefined));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual([]);
  });

  it('fetches appointments without filters', async () => {
    mockGetAppointments.mockResolvedValueOnce([mockAppointment]);

    const { result } = renderHook(() => useAppointments('biz-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual([mockAppointment]);
    expect(result.current.error).toBeNull();
    expect(mockGetAppointments).toHaveBeenCalledWith('biz-1', undefined);
  });

  it('passes filters to the service call', async () => {
    mockGetAppointments.mockResolvedValueOnce([mockAppointment]);
    const filters = { staffId: 'staff-1', status: 'confirmed' };

    const { result } = renderHook(() => useAppointments('biz-1', filters));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockGetAppointments).toHaveBeenCalledWith('biz-1', filters);
  });

  it('sets error when fetch fails', async () => {
    mockGetAppointments.mockRejectedValueOnce(new Error('Query failed'));

    const { result } = renderHook(() => useAppointments('biz-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Query failed');
    expect(result.current.data).toEqual([]);
  });

  it('falls back to default error message', async () => {
    mockGetAppointments.mockRejectedValueOnce({});

    const { result } = renderHook(() => useAppointments('biz-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Randevular alınamadı.');
  });

  it('refetch triggers a new request', async () => {
    mockGetAppointments.mockResolvedValue([mockAppointment]);

    const { result } = renderHook(() => useAppointments('biz-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockGetAppointments).toHaveBeenCalledTimes(1);

    act(() => result.current.refetch());
    await waitFor(() => expect(mockGetAppointments).toHaveBeenCalledTimes(2));
  });
});
