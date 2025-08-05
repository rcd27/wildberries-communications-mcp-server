import dotenv from 'dotenv';
import { getFeedbackById } from '../getFeedbackById.js';
dotenv.config();

describe('getFeedbackById test', () => {
  const apiKey = process.env.WB_COMMUNICATIONS_OAUTH_TOKEN;

  beforeAll(() => {
    if (!apiKey) {
      throw new Error('WB_COMMUNICATIONS_OAUTH_TOKEN environment variable is not set');
    }
  });

  it('Test integration', async () => {
    const response = await getFeedbackById(
      {
        id: 'G7Y9Y1kBAtKOitoBT_lV'
      },
      apiKey as string
    );

    expect(response).not.toBeNull();
    expect(typeof response.error).toBe('boolean');
  });
});