import { renderHook, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useBusiness } from '../useBusiness';
import { mockBusiness } from '../../test/fixtures';

vi.mock('../../services/firestore', () => ({
  getBusiness: vi.fn(),
}));

import { getBusiness } from '../../services/firestore';
const mockGetBusiness = vi.mocked(getBusiness);

describe('useBusiness', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty state when businessId is undefined', () => {
    const { result } = renderHook(() => useBusiness(undefined));
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('fetches and returns business data on success', async () => {
    mockGetBusiness.mockResolvedValueOnce(mockBusiness);

    const { result } = renderHook(() => useBusiness('biz-1'));

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual(mockBusiness);
    expect(result.current.error).toBeNull();
    expect(mockGetBusiness).toHaveBeenCalledWith('biz-1');
  });

  it('sets error when fetch fails', async () => {
    mockGetBusiness.mockRejectedValueOnce(new Error('Firestore unavailable'));

    const { result } = renderHook(() => useBusiness('biz-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('Firestore unavailable');
  });

  it('falls back to default error message when error has no message', async () => {
    mockGetBusiness.mockRejectedValueOnce({});

    const { result } = renderHook(() => useBusiness('biz-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('İşletme bilgileri alınamadı.');
  });

  it('refetch triggers a new fetch', async () => {
    mockGetBusiness.mockResolvedValue(mockBusiness);

    const { result } = renderHook(() => useBusiness('biz-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockGetBusiness).toHaveBeenCalledTimes(1);

    act(() => result.current.refetch());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockGetBusiness).toHaveBeenCalledTimes(2);
  });

  it('returns null data when business is not found', async () => {
    mockGetBusiness.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useBusiness('biz-999'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
