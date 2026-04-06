import { renderHook, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useRealtimeAppointments } from '../useFirestore';
import { mockAppointment, mockAppointmentPending } from '../../test/fixtures';

vi.mock('../../services/firestore', () => ({
  subscribeToAppointments: vi.fn(),
}));

import { subscribeToAppointments } from '../../services/firestore';
const mockSubscribe = vi.mocked(subscribeToAppointments);

describe('useRealtimeAppointments', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns empty array and stops loading when businessId is undefined', async () => {
    const { result } = renderHook(() => useRealtimeAppointments(undefined));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual([]);
  });

  it('calls subscribeToAppointments and populates data via callback', async () => {
    const unsubscribeMock = vi.fn();
    mockSubscribe.mockImplementation((_id, callback) => {
      callback([mockAppointment]);
      return unsubscribeMock;
    });

    const { result } = renderHook(() => useRealtimeAppointments('biz-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual([mockAppointment]);
    expect(result.current.error).toBeNull();
    expect(mockSubscribe).toHaveBeenCalledWith('biz-1', expect.any(Function));
  });

  it('calls unsubscribe on unmount', () => {
    const unsubscribeMock = vi.fn();
    mockSubscribe.mockImplementation((_id, callback) => {
      callback([]);
      return unsubscribeMock;
    });

    const { unmount } = renderHook(() => useRealtimeAppointments('biz-1'));
    unmount();

    expect(unsubscribeMock).toHaveBeenCalledTimes(1);
  });

  it('updates data reactively when subscription emits new data', async () => {
    let storedCallback: ((appts: typeof mockAppointment[]) => void) | null = null;
    const unsubscribeMock = vi.fn();

    mockSubscribe.mockImplementation((_id, callback) => {
      storedCallback = callback;
      callback([]);
      return unsubscribeMock;
    });

    const { result } = renderHook(() => useRealtimeAppointments('biz-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual([]);

    act(() => storedCallback!([mockAppointment, mockAppointmentPending]));

    expect(result.current.data).toHaveLength(2);
  });
});
