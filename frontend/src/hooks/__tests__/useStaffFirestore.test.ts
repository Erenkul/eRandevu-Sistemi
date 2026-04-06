import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useStaff } from '../useFirestore';
import { mockStaff } from '../../test/fixtures';

vi.mock('../../services/firestore', () => ({
  getStaff: vi.fn(),
  getAllStaff: vi.fn(),
}));

import { getStaff, getAllStaff } from '../../services/firestore';
const mockGetStaff = vi.mocked(getStaff);
const mockGetAllStaff = vi.mocked(getAllStaff);

describe('useStaff (useFirestore) — includeInactive flag', () => {
  beforeEach(() => vi.clearAllMocks());

  it('uses getStaff by default (active only)', async () => {
    mockGetStaff.mockResolvedValueOnce([mockStaff]);

    const { result } = renderHook(() => useStaff('biz-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockGetStaff).toHaveBeenCalledWith('biz-1');
    expect(mockGetAllStaff).not.toHaveBeenCalled();
    expect(result.current.data).toEqual([mockStaff]);
  });

  it('uses getAllStaff when includeInactive is true', async () => {
    const inactiveStaff = { ...mockStaff, id: 'staff-2', isActive: false };
    mockGetAllStaff.mockResolvedValueOnce([mockStaff, inactiveStaff]);

    const { result } = renderHook(() => useStaff('biz-1', true));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockGetAllStaff).toHaveBeenCalledWith('biz-1');
    expect(mockGetStaff).not.toHaveBeenCalled();
    expect(result.current.data).toHaveLength(2);
  });

  it('returns empty array when businessId is undefined', async () => {
    const { result } = renderHook(() => useStaff(undefined));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual([]);
    expect(mockGetStaff).not.toHaveBeenCalled();
  });

  it('sets error on failure', async () => {
    mockGetStaff.mockRejectedValueOnce(new Error('Firestore error'));

    const { result } = renderHook(() => useStaff('biz-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Firestore error');
  });
});
