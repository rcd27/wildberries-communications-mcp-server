import axios from 'axios';
import { z } from 'zod';

/* ----------------------------------------
 * Тип ответа
 * ---------------------------------------- */
export const GetUnansweredFeedbackCountResponseSchema = z.object({
  data: z.object({
    countUnanswered: z.number().int().describe('Количество необработанных отзывов'),
    countUnansweredToday: z.number().int().describe('Количество необработанных отзывов за сегодня'),
    valuation: z.string().describe('Средняя оценка всех отзывов'),
  }),
  error: z.boolean().describe('Есть ли ошибка'),
  errorText: z.string().describe('Описание ошибки'),
  additionalErrors: z.array(z.string()).nullable().describe('Дополнительные ошибки'),
});

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