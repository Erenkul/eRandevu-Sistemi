import { renderHook, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useCustomerAppointments } from '../useFirestore';
import { mockAppointment, mockAppointmentPending } from '../../test/fixtures';

vi.mock('../../services/firestore', () => ({
  getAppointmentsByPhone: vi.fn(),
}));

import { getAppointmentsByPhone } from '../../services/firestore';
const mockGetByPhone = vi.mocked(getAppointmentsByPhone);

describe('useCustomerAppointments', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns empty array when phone is undefined', async () => {
    const { result } = renderHook(() => useCustomerAppointments(undefined));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual([]);
  });

  it('fetches appointments by phone number', async () => {
    mockGetByPhone.mockResolvedValueOnce([mockAppointment]);

    const { result } = renderHook(() => useCustomerAppointments('+905551234567'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual([mockAppointment]);
    expect(result.current.error).toBeNull();
    expect(mockGetByPhone).toHaveBeenCalledWith('+905551234567');
  });

  it('returns empty array when no appointments found', async () => {
    mockGetByPhone.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useCustomerAppointments('+905551234567'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual([]);
  });

  it('sets error on failure', async () => {
    mockGetByPhone.mockRejectedValueOnce(new Error('Phone lookup failed'));

    const { result } = renderHook(() => useCustomerAppointments('+905551234567'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Phone lookup failed');
  });

  it('falls back to default error message', async () => {
    mockGetByPhone.mockRejectedValueOnce({});

    const { result } = renderHook(() => useCustomerAppointments('+905551234567'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Randevularınız alınamadı.');
  });

  it('re-fetches when phone changes', async () => {
    mockGetByPhone
      .mockResolvedValueOnce([mockAppointment])
      .mockResolvedValueOnce([mockAppointmentPending]);

    const { result, rerender } = renderHook(
      ({ phone }) => useCustomerAppointments(phone),
      { initialProps: { phone: '+905551234567' } }
    );

    await waitFor(() => expect(result.current.data).toHaveLength(1));

    rerender({ phone: '+905559999999' });

    await waitFor(() => expect(mockGetByPhone).toHaveBeenCalledTimes(2));
  });

  it('refetch triggers a new request', async () => {
    mockGetByPhone.mockResolvedValue([mockAppointment]);

    const { result } = renderHook(() => useCustomerAppointments('+905551234567'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.refetch());
    await waitFor(() => expect(mockGetByPhone).toHaveBeenCalledTimes(2));
  });
});
