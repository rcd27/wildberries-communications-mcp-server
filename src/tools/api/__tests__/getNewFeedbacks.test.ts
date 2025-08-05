import dotenv from 'dotenv';
import { getNewFeedbacksQuestions } from '../getNewFeedbacks.js';

dotenv.config();

describe('getNewFeedbacksQuestions test', () => {
  const apiKey = process.env.WB_COMMUNICATIONS_OAUTH_TOKEN;

  beforeAll(() => {
    if (!apiKey) {
      throw new Error('WB_COMMUNICATIONS_OAUTH_TOKEN environment variable is not set');
    }
  });

  it('Test integration', async () => {
    const response = await getNewFeedbacksQuestions(
      {},
      apiKey as string
    );

    expect(response).not.toBeNull();
    expect(typeof response.error).toBe('boolean');
    expect(typeof response.data.hasNewQuestions).toBe('boolean');
    expect(typeof response.data.hasNewFeedbacks).toBe('boolean');
  });
});