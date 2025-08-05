import dotenv from 'dotenv';
import { getClaims } from '../getClaims.js';

dotenv.config();

describe('getClaims test', () => {
  const apiKey = process.env.WB_COMMUNICATIONS_OAUTH_TOKEN;

  beforeAll(() => {
    if (!apiKey) {
      throw new Error('WB_COMMUNICATIONS_OAUTH_TOKEN environment variable is not set');
    }
  });

  it('Test integration', async () => {
    const response = await getClaims(
      {
        is_archive: false,
        limit: 10,
        offset: 0
      },
      apiKey as string
    );

    expect(response).not.toBeNull();
  });
});