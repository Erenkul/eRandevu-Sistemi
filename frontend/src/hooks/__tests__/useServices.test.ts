import { renderHook, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useServices } from '../useFirestore';
import { mockService, mockService2 } from '../../test/fixtures';

vi.mock('../../services/firestore', () => ({
  getServices: vi.fn(),
  getAllServices: vi.fn(),
}));

import { getServices, getAllServices } from '../../services/firestore';
const mockGetServices = vi.mocked(getServices);
const mockGetAllServices = vi.mocked(getAllServices);

describe('useServices', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty array when businessId is undefined', () => {
    const { result } = renderHook(() => useServices(undefined));
    expect(result.current.data).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('fetches active services by default', async () => {
    mockGetServices.mockResolvedValueOnce([mockService]);

    const { result } = renderHook(() => useServices('biz-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual([mockService]);
    expect(mockGetServices).toHaveBeenCalledWith('biz-1');
    expect(mockGetAllServices).not.toHaveBeenCalled();
  });

  it('fetches all services including inactive when includeInactive is true', async () => {
    mockGetAllServices.mockResolvedValueOnce([mockService, mockService2]);

    const { result } = renderHook(() => useServices('biz-1', true));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toHaveLength(2);
    expect(mockGetAllServices).toHaveBeenCalledWith('biz-1');
    expect(mockGetServices).not.toHaveBeenCalled();
  });

  it('sets error when fetch fails', async () => {
    mockGetServices.mockRejectedValueOnce(new Error('Permission denied'));

    const { result } = renderHook(() => useServices('biz-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBe('Permission denied');
  });

  it('falls back to default error message', async () => {
    mockGetServices.mockRejectedValueOnce({});

    const { result } = renderHook(() => useServices('biz-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Hizmetler alınamadı.');
  });

  it('refetch triggers a new request', async () => {
    mockGetServices.mockResolvedValue([mockService]);

    const { result } = renderHook(() => useServices('biz-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockGetServices).toHaveBeenCalledTimes(1);

    act(() => result.current.refetch());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockGetServices).toHaveBeenCalledTimes(2);
  });

  it('re-fetches when includeInactive flag changes', async () => {
    mockGetServices.mockResolvedValueOnce([mockService]);
    mockGetAllServices.mockResolvedValueOnce([mockService, mockService2]);

    const { result, rerender } = renderHook(
      ({ include }) => useServices('biz-1', include),
      { initialProps: { include: false } }
    );

    await waitFor(() => expect(result.current.data).toHaveLength(1));

    rerender({ include: true });

    await waitFor(() => expect(result.current.data).toHaveLength(2));
  });
});
