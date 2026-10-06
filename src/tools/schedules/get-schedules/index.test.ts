import { describe, it, expect, vi, beforeEach } from 'vitest';

// CRITICAL: Mock before imports
vi.mock('../../../actual-api.js', () => ({
  getSchedules: vi.fn(),
  getAccounts: vi.fn(),
  getPayees: vi.fn(),
}));

import { handler } from './index.js';
import { getSchedules, getAccounts, getPayees } from '../../../actual-api.js';
import { textContent } from '../../../utils/response.js';
import type { APIScheduleEntity } from '@actual-app/api/models';

function schedule(overrides: Partial<APIScheduleEntity> = {}): APIScheduleEntity {
  return {
    id: 's1',
    name: 'Rent',
    account: 'a1',
    payee: 'p1',
    amount: -120000,
    amountOp: 'is',
    next_date: '2026-11-01',
    completed: false,
    posts_transaction: false,
    date: { frequency: 'monthly', start: '2026-01-01' },
    ...overrides,
  } as APIScheduleEntity;
}

describe('get-schedules handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAccounts).mockResolvedValue([{ id: 'a1', name: 'Checking' }]);
    vi.mocked(getPayees).mockResolvedValue([{ id: 'p1', name: 'Landlord' }]);
  });

  it('returns schedules with resolved account and payee names', async () => {
    vi.mocked(getSchedules).mockResolvedValue([schedule()]);

    const result = await handler();
    const schedules = JSON.parse(textContent(result.content[0]));

    expect(schedules).toEqual([
      {
        id: 's1',
        name: 'Rent',
        account: 'Checking',
        payee: 'Landlord',
        amount: -120000,
        amountOp: 'is',
        nextDate: '2026-11-01',
        completed: false,
        postsTransaction: false,
        recurrence: { frequency: 'monthly', start: '2026-01-01' },
      },
    ]);
  });

  it('falls back to raw ids and nulls when references are missing', async () => {
    vi.mocked(getAccounts).mockResolvedValue([]);
    vi.mocked(getPayees).mockResolvedValue([]);
    vi.mocked(getSchedules).mockResolvedValue([
      schedule({ account: 'missing-account', payee: undefined, name: undefined, completed: undefined }),
    ]);

    const result = await handler();
    const schedules = JSON.parse(textContent(result.content[0]));

    expect(schedules[0].account).toBe('missing-account');
    expect(schedules[0].payee).toBeNull();
    expect(schedules[0].name).toBeNull();
    expect(schedules[0].completed).toBe(false);
  });

  it('returns an empty list when there are no schedules', async () => {
    vi.mocked(getSchedules).mockResolvedValue([]);

    const result = await handler();

    expect(JSON.parse(textContent(result.content[0]))).toEqual([]);
  });

  it('surfaces an API failure as a tool error', async () => {
    vi.mocked(getSchedules).mockRejectedValue(new Error('API Error'));

    const result = await handler();

    expect(result.isError).toBe(true);
    expect(textContent(result.content[0])).toContain('API Error');
  });
});
