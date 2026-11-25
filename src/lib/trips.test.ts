import { beforeEach, describe, expect, it } from 'vitest';
import { initialTrips, readTravelState, registerTravelers, remainingPlaces, STORAGE_KEY, type Registration } from './trips';

const registration: Registration = { id: 'test-1', tripId: 'alger', fullName: 'Amira Ben Ali', phone: '+216 20123456', email: 'amira@example.com', travelers: 2, createdAt: '2026-11-25T10:39:00Z' };
const state = () => ({ trips: initialTrips.map((trip) => ({ ...trip })), registrations: [] });

describe('Trip registration', () => {
  beforeEach(() => localStorage.clear());
  it('increments the participant count by the number of travelers', () => {
    const next = registerTravelers(state(), registration);
    expect(next.trips.find((trip) => trip.id === 'alger')?.registered).toBe(20);
    expect(next.registrations).toEqual([registration]);
  });
  it('rejects travelers exceeding the remaining six spots', () => {
    expect(() => registerTravelers(state(), { ...registration, travelers: 7 })).toThrow('Il reste seulement 6');
  });
  it('allows booking exactly all remaining places', () => {
    const next = registerTravelers(state(), { ...registration, travelers: 6 });
    const trip = next.trips.find((item) => item.id === 'alger');
    expect(trip ? remainingPlaces(trip) : -1).toBe(0);
  });
  it('rejects a registration for a full trip', () => {
    expect(() => registerTravelers(state(), { ...registration, tripId: 'oran' })).toThrow('seulement 0');
  });
  it('rejects zero and fractional traveler counts', () => {
    expect(() => registerTravelers(state(), { ...registration, travelers: 0 })).toThrow('au moins un');
    expect(() => registerTravelers(state(), { ...registration, travelers: 1.5 })).toThrow('au moins un');
  });
  it('reads back trips and registrations saved on this device', () => {
    const next = registerTravelers(state(), registration);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    expect(readTravelState()).toEqual(next);
  });
});