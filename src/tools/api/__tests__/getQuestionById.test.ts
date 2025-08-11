import dotenv from 'dotenv';
import { getQuestionById } from '../getQuestionById.js';
import { getQuestions } from '../getQuestions.js';

dotenv.config();

describe('getQuestionById integration test', () => {
  const apiKey = process.env.WB_COMMUNICATIONS_OAUTH_TOKEN;

  beforeAll(() => {
    if (!apiKey) {
      throw new Error('WB_COMMUNICATIONS_OAUTH_TOKEN env var is not set');
    }
  });

  it('Should get question by ID', async () => {
    const now = Math.floor(Date.now() / 1000);
    const oneWeekAgo = now - 7 * 24 * 3600;
    const questions = await getQuestions(
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

    const id = questions.data.questions[0].id;
    const result = await getQuestionById(
      {
        id: id
      },
      apiKey as string
    );

    expect(result.error).toBe(false);
    expect(result.data.id).toBe(id);
  });
});