import { renderHook, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useStaff } from '../useFirestore';
import { mockStaff } from '../../test/fixtures';

vi.mock('../../services/firestore', () => ({
  getStaff: vi.fn(),
}));

import { getStaff } from '../../services/firestore';
const mockGetStaff = vi.mocked(getStaff);

describe('useStaff', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty array when businessId is undefined', () => {
    const { result } = renderHook(() => useStaff(undefined));
    expect(result.current.data).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('fetches and returns staff list on success', async () => {
    mockGetStaff.mockResolvedValueOnce([mockStaff]);

    const { result } = renderHook(() => useStaff('biz-1'));

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual([mockStaff]);
    expect(result.current.error).toBeNull();
    expect(mockGetStaff).toHaveBeenCalledWith('biz-1');
  });

  it('returns empty array when no staff found', async () => {
    mockGetStaff.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useStaff('biz-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('sets error when fetch fails', async () => {
    mockGetStaff.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useStaff('biz-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBe('Network error');
  });

  it('falls back to default error message', async () => {
    mockGetStaff.mockRejectedValueOnce({});

    const { result } = renderHook(() => useStaff('biz-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Personel listesi alınamadı.');
  });

  it('refetch triggers a new request', async () => {
    mockGetStaff.mockResolvedValue([mockStaff]);

    const { result } = renderHook(() => useStaff('biz-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockGetStaff).toHaveBeenCalledTimes(1);

    act(() => result.current.refetch());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockGetStaff).toHaveBeenCalledTimes(2);
  });

});
