import { APIScheduleEntity } from '@actual-app/api/models';
import { getSchedules } from '../../actual-api.js';

export async function fetchAllSchedules(): Promise<APIScheduleEntity[]> {
  return getSchedules();
}
