import dotenv from 'dotenv';
import { getUnansweredFeedbackCount } from '../getUnansweredFeedbackCount.js';
dotenv.config();

describe('getUnansweredFeedbackCount test', () => {
  const apiKey = process.env.WB_COMMUNICATIONS_OAUTH_TOKEN;

  beforeAll(() => {
    if (!apiKey) {
      throw new Error('WB_COMMUNICATIONS_OAUTH_TOKEN environment variable is not set');
    }
  });

  it('should return unanswered feedback count', async () => {
    const response = await getUnansweredFeedbackCount(apiKey as string);

    expect(response).not.toBeNull();
    expect(typeof response.error).toBe('boolean');
    expect(typeof response.data.countUnanswered).toBe('number');
    expect(typeof response.data.valuation).toBe('string');
  });
});