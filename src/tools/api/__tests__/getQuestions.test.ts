import dotenv from 'dotenv';
import { getQuestions } from '../getQuestions.js';

dotenv.config();

describe('getQuestions integration test', () => {
  const apiKey = process.env.WB_COMMUNICATIONS_OAUTH_TOKEN;

  beforeAll(() => {
    if (!apiKey) {
      throw new Error('WB_COMMUNICATIONS_OAUTH_TOKEN env var is not set');
    }
  });

  it('Should fetch list of unanswered questions', async () => {
    const now = Math.floor(Date.now() / 1000);
    const oneWeekAgo = now - 7 * 24 * 3600;

    const response = await getQuestions(
      {
        isAnswered: false,
        take: 10,
        skip: 0,
        dateFrom: oneWeekAgo,
        dateTo: now,
        order: 'dateDesc'
      },
      apiKey as string
    );

    expect(response.error).toBe(false);
    expect(Array.isArray(response.data.questions)).toBe(true);
  });
});