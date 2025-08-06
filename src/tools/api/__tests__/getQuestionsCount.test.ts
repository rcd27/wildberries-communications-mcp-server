import dotenv from 'dotenv';
import { getQuestionsCount } from '../getQuestionsCount.js';
dotenv.config();

describe('getQuestionsCount integration test', () => {
  const apiKey = process.env.WB_COMMUNICATIONS_OAUTH_TOKEN;

  beforeAll(() => {
    if (!apiKey) {
      throw new Error('WB_COMMUNICATIONS_OAUTH_TOKEN env var is not set');
    }
  });

  it('Should return questions count for period', async () => {
    const now = Math.floor(Date.now() / 1000);
    const oneDayAgo = now - 86400;

    const response = await getQuestionsCount(
      {
        dateFrom: oneDayAgo,
        dateTo: now,
        isAnswered: false,
      },
      apiKey as string
    );

    expect(typeof response.data).toBe('number');
    expect(response.error).toBe(false);
  });
});