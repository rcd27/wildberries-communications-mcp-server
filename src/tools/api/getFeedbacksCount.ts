import axios from 'axios';
import { z } from 'zod';
import { createResponseSchema } from '../../createResponseSchema.js';

export const GetFeedbacksCountQuerySchema = z.object({
  dateFrom: z.number().int().optional().describe('Дата начала периода в формате Unix timestamp'),
  dateTo: z.number().int().optional().describe('Дата конца периода в формате Unix timestamp'),
  isAnswered: z.boolean().optional().describe('Обработанные отзывы(`true`) или необработанные отзывы(`false`)')
});

export const GetFeedbacksCountResponseSchema = createResponseSchema(
  z.number().nullable().describe("Количество отзывов")
);

export type GetFeedbacksCountQuery = z.infer<typeof GetFeedbacksCountQuerySchema>;
export type GetFeedbacksCountResponse = z.infer<typeof GetFeedbacksCountResponseSchema>;

export async function getFeedbacksCount(
  params: GetFeedbacksCountQuery,
  apiKey: string
): Promise<GetFeedbacksCountResponse> {
  const response = await axios.get('https://feedbacks-api.wildberries.ru/api/v1/feedbacks/count', {
    headers: {
      Authorization: apiKey,
      'Content-Type': 'application/json'
    },
    params
  });

  return response.data;
}