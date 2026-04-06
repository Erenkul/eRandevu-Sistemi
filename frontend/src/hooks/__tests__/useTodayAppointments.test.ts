import { renderHook, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useTodayAppointments } from '../useTodayAppointments';
import { mockAppointment } from '../../test/fixtures';

vi.mock('../../services/firestore', () => ({
  subscribeToAppointments: vi.fn(),
}));

import { subscribeToAppointments } from '../../services/firestore';
const mockSubscribe = vi.mocked(subscribeToAppointments);

// Appointment with a dateTime that toDate() returns today
const todayDate = new Date();
todayDate.setHours(10, 0, 0, 0);

const todayAppointment = {
  ...mockAppointment,
  dateTime: {
    toDate: () => todayDate,
    seconds: Math.floor(todayDate.getTime() / 1000),
    nanoseconds: 0,
  } as unknown as typeof mockAppointment['dateTime'],
};

// Appointment from yesterday — should be filtered out
const yesterdayDate = new Date(todayDate);
yesterdayDate.setDate(yesterdayDate.getDate() - 1);
const yesterdayAppointment = {
  ...mockAppointment,
  id: 'appt-yesterday',
  dateTime: {
    toDate: () => yesterdayDate,
    seconds: Math.floor(yesterdayDate.getTime() / 1000),
    nanoseconds: 0,
  } as unknown as typeof mockAppointment['dateTime'],
};

describe('useTodayAppointments (standalone)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns empty array when businessId is undefined', () => {
    const { result } = renderHook(() => useTodayAppointments(undefined));
    expect(result.current.data).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('filters appointments to only today', async () => {
    const unsubscribeMock = vi.fn();
    mockSubscribe.mockImplementation((_id, callback) => {
      callback([todayAppointment, yesterdayAppointment]);
      return unsubscribeMock;
    });

    const { result } = renderHook(() => useTodayAppointments('biz-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data[0].id).toBe(mockAppointment.id);
  });

  it('returns empty array when all appointments are from other days', async () => {
    const unsubscribeMock = vi.fn();
    mockSubscribe.mockImplementation((_id, callback) => {
      callback([yesterdayAppointment]);
      return unsubscribeMock;
    });

    const { result } = renderHook(() => useTodayAppointments('biz-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toHaveLength(0);
  });

  it('subscribes with the correct businessId', async () => {
    const unsubscribeMock = vi.fn();
    mockSubscribe.mockImplementation((_id, callback) => {
      callback([]);
      return unsubscribeMock;
    });

    renderHook(() => useTodayAppointments('biz-1'));

    expect(mockSubscribe).toHaveBeenCalledWith('biz-1', expect.any(Function));
  });

  it('calls unsubscribe on unmount', () => {
    const unsubscribeMock = vi.fn();
    mockSubscribe.mockImplementation((_id, callback) => {
      callback([]);
      return unsubscribeMock;
    });

    const { unmount } = renderHook(() => useTodayAppointments('biz-1'));
    unmount();

    expect(unsubscribeMock).toHaveBeenCalledTimes(1);
  });

  it('updates reactively when subscription emits new data', async () => {
    let storedCallback: ((appts: typeof todayAppointment[]) => void) | null = null;
    const unsubscribeMock = vi.fn();

    mockSubscribe.mockImplementation((_id, callback) => {
      storedCallback = callback;
      callback([]);
      return unsubscribeMock;
    });

    const { result } = renderHook(() => useTodayAppointments('biz-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toHaveLength(0);

    act(() => storedCallback!([todayAppointment]));

    expect(result.current.data).toHaveLength(1);
  });
});
