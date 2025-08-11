import dotenv from 'dotenv';
import { getFeedbacksCount } from '../getFeedbacksCount.js';

dotenv.config();

describe('getFeedbacksCount integration test', () => {
  const apiKey = process.env.WB_COMMUNICATIONS_OAUTH_TOKEN;

  beforeAll(() => {
    if (!apiKey) {
      throw new Error('WB_COMMUNICATIONS_OAUTH_TOKEN env var is not set');
    }
  });

  it('Should mark a question as viewed', async () => {
    const result = await getFeedbacksCount(
      {
        dateFrom: 1688465092,
        dateTo: 1688465092,
        isAnswered: false
      },
      apiKey as string
    );

    expect(result.error).toBe(false);
  });
});