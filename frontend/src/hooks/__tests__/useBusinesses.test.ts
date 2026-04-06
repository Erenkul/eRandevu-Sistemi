import { renderHook, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useBusinesses } from '../useFirestore';
import { mockBusiness } from '../../test/fixtures';

vi.mock('../../services/firestore', () => ({
  getAllBusinesses: vi.fn(),
}));

import { getAllBusinesses } from '../../services/firestore';
const mockGetAllBusinesses = vi.mocked(getAllBusinesses);

describe('useBusinesses', () => {
  beforeEach(() => vi.clearAllMocks());

  it('fetches all businesses on mount', async () => {
    mockGetAllBusinesses.mockResolvedValueOnce([mockBusiness]);

    const { result } = renderHook(() => useBusinesses());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual([mockBusiness]);
    expect(result.current.error).toBeNull();
  });

  it('returns empty array when no businesses exist', async () => {
    mockGetAllBusinesses.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useBusinesses());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual([]);
  });

  it('sets error on failure', async () => {
    mockGetAllBusinesses.mockRejectedValueOnce(new Error('DB error'));

    const { result } = renderHook(() => useBusinesses());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('DB error');
    expect(result.current.data).toEqual([]);
  });

  it('falls back to default error message', async () => {
    mockGetAllBusinesses.mockRejectedValueOnce({});

    const { result } = renderHook(() => useBusinesses());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('İşletmeler alınamadı.');
  });

  it('refetch triggers a new request', async () => {
    mockGetAllBusinesses.mockResolvedValue([mockBusiness]);

    const { result } = renderHook(() => useBusinesses());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.refetch());
    await waitFor(() => expect(mockGetAllBusinesses).toHaveBeenCalledTimes(2));
  });
});
