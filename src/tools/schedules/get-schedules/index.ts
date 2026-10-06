// ----------------------------
// GET SCHEDULES TOOL
// ----------------------------

import { successWithJson, errorFromCatch } from '../../../utils/response.js';
import { fetchAllSchedules } from '../../../core/data/fetch-schedules.js';
import { fetchAllAccounts } from '../../../core/data/fetch-accounts.js';
import { fetchAllPayees } from '../../../core/data/fetch-payees.js';
import type { Account, Payee } from '../../../core/types/domain.js';

export const schema = {
  name: 'get-schedules',
  description:
    'Retrieve a list of all recurring schedules in the budget, with their account, payee, amount, next date and recurrence.',
  inputSchema: {
    type: 'object',
    description: 'This tool does not accept any arguments.',
    properties: {},
    additionalProperties: false,
  },
};

export async function handler(): Promise<ReturnType<typeof successWithJson> | ReturnType<typeof errorFromCatch>> {
  try {
    const [schedules, accounts, payees] = await Promise.all([
      fetchAllSchedules(),
      fetchAllAccounts(),
      fetchAllPayees(),
    ]);

    // Reason: schedule entities carry only account/payee IDs. Resolve them to names so
    // the output is readable, falling back to the raw ID when a reference is missing.
    const accountNames = new Map<string, string>(accounts.map((account: Account) => [account.id, account.name]));
    const payeeNames = new Map<string, string>(payees.map((payee: Payee) => [payee.id, payee.name]));

    const structured = schedules.map((schedule) => ({
      id: schedule.id,
      name: schedule.name ?? null,
      account: schedule.account ? (accountNames.get(schedule.account) ?? schedule.account) : null,
      payee: schedule.payee ? (payeeNames.get(schedule.payee) ?? schedule.payee) : null,
      amount: schedule.amount ?? null,
      amountOp: schedule.amountOp ?? null,
      nextDate: schedule.next_date ?? null,
      completed: schedule.completed ?? false,
      postsTransaction: schedule.posts_transaction ?? false,
      recurrence: schedule.date ?? null,
    }));

    return successWithJson(structured);
  } catch (err) {
    return errorFromCatch(err);
  }
}
