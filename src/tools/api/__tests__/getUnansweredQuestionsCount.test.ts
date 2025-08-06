import dotenv from 'dotenv';
import { getUnansweredQuestionsCount } from '../getUnsansweredQuestionsCount.js';

dotenv.config();

describe('getUnansweredQuestionsCount test', () => {
  const apiKey = process.env.WB_COMMUNICATIONS_OAUTH_TOKEN;

  beforeAll(() => {
    if (!apiKey) {
      throw new Error('WB_COMMUNICATIONS_OAUTH_TOKEN environment variable is not set');
    }
  });

  it('Test integration', async () => {
    const response = await getUnansweredQuestionsCount(apiKey as string);

    expect(response).not.toBeNull();
    expect(typeof response.data.countUnanswered).toBe('number');
    expect(typeof response.data.countUnansweredToday).toBe('number');
    expect(response.error).toBe(false);
  });
});