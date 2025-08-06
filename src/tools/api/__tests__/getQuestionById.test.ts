import dotenv from 'dotenv';
import { getQuestionById } from '../getQuestionById.js';

dotenv.config();

describe('getQuestionById integration test', () => {
  const apiKey = process.env.WB_COMMUNICATIONS_OAUTH_TOKEN;

  beforeAll(() => {
    if (!apiKey) {
      throw new Error('WB_COMMUNICATIONS_OAUTH_TOKEN env var is not set');
    }
  });

  it('Should get question by ID', async () => {
    const result = await getQuestionById(
      {
        id: '2ncBtX4B9I0UHoornoqG'
      },
      apiKey as string
    );

    expect(result.error).toBe(false);
    expect(result.data.id).toBe('2ncBtX4B9I0UHoornoqG');
  });
});