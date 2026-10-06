import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchAllSchedules } from './fetch-schedules.js';

// CRITICAL: Mock before imports
vi.mock('../../actual-api.js', () => ({
  getSchedules: vi.fn(),
}));

import { getSchedules } from '../../actual-api.js';

describe('fetchAllSchedules', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return schedules from API', async () => {
    const mockSchedules = [
      { id: 's1', name: 'Rent', account: 'a1', payee: 'p1', amount: -120000, amountOp: 'is' },
      { id: 's2', name: 'Salary', account: 'a1', payee: 'p2', amount: 250000, amountOp: 'is' },
    ];
    vi.mocked(getSchedules).mockResolvedValue(mockSchedules as never);

    const result = await fetchAllSchedules();

    expect(result).toEqual(mockSchedules);
    expect(getSchedules).toHaveBeenCalledOnce();
  });

  it('should handle empty response', async () => {
    vi.mocked(getSchedules).mockResolvedValue([]);

    const result = await fetchAllSchedules();

    expect(result).toEqual([]);
    expect(getSchedules).toHaveBeenCalledOnce();
  });

  it('should handle API errors', async () => {
    vi.mocked(getSchedules).mockRejectedValue(new Error('Schedules API Error'));

    await expect(fetchAllSchedules()).rejects.toThrow('Schedules API Error');
    expect(getSchedules).toHaveBeenCalledOnce();
  });
});
