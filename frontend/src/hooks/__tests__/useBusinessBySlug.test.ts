import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useBusinessBySlug } from '../useBusinessBySlug';
import { mockBusiness } from '../../test/fixtures';

vi.mock('../../services/firestore', () => ({
  getBusinessBySlug: vi.fn(),
}));

import { getBusinessBySlug } from '../../services/firestore';
const mockGetBusinessBySlug = vi.mocked(getBusinessBySlug);

describe('useBusinessBySlug', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty state when slug is undefined', () => {
    const { result } = renderHook(() => useBusinessBySlug(undefined));
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('fetches business by slug on success', async () => {
    mockGetBusinessBySlug.mockResolvedValueOnce(mockBusiness);

    const { result } = renderHook(() => useBusinessBySlug('test-salon'));

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual(mockBusiness);
    expect(result.current.error).toBeNull();
    expect(mockGetBusinessBySlug).toHaveBeenCalledWith('test-salon');
  });

  it('sets error when fetch fails', async () => {
    mockGetBusinessBySlug.mockRejectedValueOnce(new Error('Not found'));

    const { result } = renderHook(() => useBusinessBySlug('bad-slug'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('Not found');
  });

  it('falls back to default error message', async () => {
    mockGetBusinessBySlug.mockRejectedValueOnce({});

    const { result } = renderHook(() => useBusinessBySlug('test-salon'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('İşletme bulunamadı.');
  });

  it('returns null when slug maps to no business', async () => {
    mockGetBusinessBySlug.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useBusinessBySlug('ghost-salon'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('re-fetches when slug changes', async () => {
    const business2 = { ...mockBusiness, id: 'biz-2', slug: 'other-salon' };
    mockGetBusinessBySlug
      .mockResolvedValueOnce(mockBusiness)
      .mockResolvedValueOnce(business2);

    const { result, rerender } = renderHook(({ slug }) => useBusinessBySlug(slug), {
      initialProps: { slug: 'test-salon' },
    });

    await waitFor(() => expect(result.current.data?.id).toBe('biz-1'));

    rerender({ slug: 'other-salon' });

    await waitFor(() => expect(result.current.data?.id).toBe('biz-2'));
    expect(mockGetBusinessBySlug).toHaveBeenCalledTimes(2);
  });
});
