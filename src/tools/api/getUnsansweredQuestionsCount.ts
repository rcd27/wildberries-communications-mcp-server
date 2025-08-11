import axios from 'axios';
import { z } from 'zod';
import { createResponseSchema } from '../../createResponseSchema.js';

export const GetUnansweredQuestionsCountResponseSchema = createResponseSchema(
  z.object({
    countUnanswered: z.number().describe('Количество неотвеченных вопросов'),
    countUnansweredToday: z.number().describe('Количество неотвеченных вопросов за сегодня')
  })
);

export type GetUnansweredQuestionsCountResponse = z.infer<typeof GetUnansweredQuestionsCountResponseSchema>;

export async function getUnansweredQuestionsCount(apiKey: string): Promise<GetUnansweredQuestionsCountResponse> {
  const response = await axios.get(
    'https://feedbacks-api.wildberries.ru/api/v1/questions/count-unanswered',
    {
      headers: {
        Authorization: apiKey
      }
    }
  );

  return GetUnansweredQuestionsCountResponseSchema.parse(response.data);
}
