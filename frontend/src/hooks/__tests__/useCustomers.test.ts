import { renderHook, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useCustomers } from '../useFirestore';
import { mockCustomer } from '../../test/fixtures';

vi.mock('../../services/firestore', () => ({
  getCustomers: vi.fn(),
}));

import { getCustomers } from '../../services/firestore';
const mockGetCustomers = vi.mocked(getCustomers);

describe('useCustomers', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns empty array when businessId is undefined', async () => {
    const { result } = renderHook(() => useCustomers(undefined));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual([]);
  });

  it('fetches and returns customers', async () => {
    mockGetCustomers.mockResolvedValueOnce([mockCustomer]);

    const { result } = renderHook(() => useCustomers('biz-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual([mockCustomer]);
    expect(result.current.error).toBeNull();
    expect(mockGetCustomers).toHaveBeenCalledWith('biz-1');
  });

  it('returns empty array when no customers', async () => {
    mockGetCustomers.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useCustomers('biz-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual([]);
  });

  it('sets error on failure', async () => {
    mockGetCustomers.mockRejectedValueOnce(new Error('Permission denied'));

    const { result } = renderHook(() => useCustomers('biz-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Permission denied');
    expect(result.current.data).toEqual([]);
  });

  it('falls back to default error message', async () => {
    mockGetCustomers.mockRejectedValueOnce({});

    const { result } = renderHook(() => useCustomers('biz-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Müşteri listesi alınamadı.');
  });

  it('refetch triggers new request', async () => {
    mockGetCustomers.mockResolvedValue([mockCustomer]);

    const { result } = renderHook(() => useCustomers('biz-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.refetch());
    await waitFor(() => expect(mockGetCustomers).toHaveBeenCalledTimes(2));
  });
});
