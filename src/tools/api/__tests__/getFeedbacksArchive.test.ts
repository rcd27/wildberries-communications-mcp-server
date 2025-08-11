import dotenv from 'dotenv';
import { getArchivedFeedbacks } from '../getFeedbacksArchive.js';

dotenv.config();

describe('getArchivedFeedbacks integration test', () => {
  const apiKey = process.env.WB_COMMUNICATIONS_OAUTH_TOKEN;

  beforeAll(() => {
    if (!apiKey) {
      throw new Error('WB_COMMUNICATIONS_OAUTH_TOKEN env var is not set');
    }
  });

  it('Should return archived feedbacks with minimal params', async () => {
    const res = await getArchivedFeedbacks(
      {
        take: 5,
        skip: 0
      },
      apiKey as string
    );

    expect(res.error).toBe(false);
    expect(res.errorText).toBeDefined();
    expect(res.data).toBeDefined();
    expect(Array.isArray(res.data.feedbacks)).toBe(true);
  });

  it('Should support nmId and ordering', async () => {
    const res = await getArchivedFeedbacks(
      {
        nmId: 14917842,
        take: 5,
        skip: 0,
        order: 'dateDesc'
      },
      apiKey as string
    );

    expect(res.error).toBe(false);
    expect(Array.isArray(res.data.feedbacks)).toBe(true);
  });
});
