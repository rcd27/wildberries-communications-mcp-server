import axios from 'axios';
import { z } from 'zod';
import { createResponseSchema } from '../../createResponseSchema.js';

/* ----------------------------------------
 * Тип ответа
 * ---------------------------------------- */
export const GetUnansweredFeedbackCountResponseSchema = createResponseSchema(
  z.object({
    countUnanswered: z.number().int().describe('Количество необработанных отзывов'),
    countUnansweredToday: z.number().int().describe('Количество необработанных отзывов за сегодня'),
    valuation: z.string().describe('Средняя оценка всех отзывов')
  })
);

export type GetUnansweredFeedbackCountResponse = z.infer<typeof GetUnansweredFeedbackCountResponseSchema>;

/* ----------------------------------------
 * Функция запроса
 * ---------------------------------------- */
export async function getUnansweredFeedbackCount(
  apiKey: string
): Promise<GetUnansweredFeedbackCountResponse> {
  const response = await axios.get(
    'https://feedbacks-api.wildberries.ru/api/v1/feedbacks/count-unanswered',
    {
      headers: {
        Authorization: apiKey
      }
    }
  );

  return GetUnansweredFeedbackCountResponseSchema.parse(response.data);
}