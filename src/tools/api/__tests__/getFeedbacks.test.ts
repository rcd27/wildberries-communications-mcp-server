import dotenv from 'dotenv';
import { getFeedbacks } from '../getFeedbacks.js';

dotenv.config();

describe('getFeedbacks integration test', () => {
  const apiKey = process.env.WB_COMMUNICATIONS_OAUTH_TOKEN;

  beforeAll(() => {
    if (!apiKey) {
      throw new Error('WB_COMMUNICATIONS_OAUTH_TOKEN env var is not set');
    }
  });

  it('Should return list of feedbacks with default parameters', async () => {
    const response = await getFeedbacks(
      {
        isAnswered: false,
        take: 10,
        skip: 0
      },
      apiKey as string
    );

    expect(response.error).toBe(false);
    expect(response.errorText).toBe('');
    expect(response.data).toBeDefined();
    expect(typeof response.data.countUnanswered).toBe('number');
    expect(typeof response.data.countArchive).toBe('number');
    expect(Array.isArray(response.data.feedbacks)).toBe(true);
  });

  it('Should return feedbacks for specific period', async () => {
    const now = Math.floor(Date.now() / 1000);
    const oneDayAgo = now - 86400; // 24 часа назад

    const response = await getFeedbacks(
      {
        isAnswered: false,
        take: 5,
        skip: 0,
        dateFrom: oneDayAgo,
        dateTo: now,
        order: 'dateDesc'
      },
      apiKey as string
    );

    expect(response.error).toBe(false);
    expect(Array.isArray(response.data.feedbacks)).toBe(true);

    if (response.data.feedbacks.length > 0) {
      const feedback = response.data.feedbacks[0];
      expect(feedback).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          userName: expect.any(String),
          productDetails: expect.objectContaining({
            imtId: expect.any(Number),
            nmId: expect.any(Number),
            productName: expect.any(String)
          }),
          createdDate: expect.any(String),
          productValuation: expect.any(Number)
        })
      );
    }
  });

  it('Should return answered feedbacks', async () => {
    const response = await getFeedbacks(
      {
        isAnswered: true,
        take: 5,
        skip: 0
      },
      apiKey as string
    );

    expect(response.error).toBe(false);

    if (response.data.feedbacks.length > 0) {
      const feedback = response.data.feedbacks[0];
      if (feedback.answer) {
        expect(feedback.answer).toEqual(
          expect.objectContaining({
            text: expect.any(String),
            state: expect.stringMatching(/^(none|wbRu|reviewRequired|rejected)$/),
            editable: expect.any(Boolean)
          })
        );
      }
    }
  });

  it('Should handle pagination correctly', async () => {
    const pageSize = 5;
    const [firstPage, secondPage] = await Promise.all([
      getFeedbacks(
        {
          isAnswered: false,
          take: pageSize,
          skip: 0
        },
        apiKey as string
      ),
      getFeedbacks(
        {
          isAnswered: false,
          take: pageSize,
          skip: pageSize
        },
        apiKey as string
      )
    ]);

    expect(firstPage.error).toBe(false);
    expect(secondPage.error).toBe(false);

    if (firstPage.data.feedbacks.length === pageSize && secondPage.data.feedbacks.length > 0) {
      // Проверяем, что ID отзывов на разных страницах не пересекаются
      const firstPageIds = new Set(firstPage.data.feedbacks.map(f => f.id));
      const secondPageIds = new Set(secondPage.data.feedbacks.map(f => f.id));
      const intersection = [...firstPageIds].filter(id => secondPageIds.has(id));
      expect(intersection.length).toBe(0);
    }
  });
});