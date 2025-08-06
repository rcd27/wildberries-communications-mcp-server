import dotenv from 'dotenv';
import { patchQuestion } from '../patchQuestion.js';

dotenv.config();

// skipped
describe.skip('patchQuestion integration test', () => {
  const apiKey = process.env.WB_COMMUNICATIONS_OAUTH_TOKEN;

  beforeAll(() => {
    if (!apiKey) {
      throw new Error('WB_COMMUNICATIONS_OAUTH_TOKEN env var is not set');
    }
  });

  it('Should mark a question as viewed', async () => {
    const result = await patchQuestion(
      {
        id: 'n5um6IUBQOOSTxXoo0gV',
        wasViewed: false
      },
      apiKey as string
    );

    expect(result.error).toBe(false);
  });
});