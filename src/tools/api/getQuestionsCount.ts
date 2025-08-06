import axios from 'axios';
import { z } from 'zod';

/* ----------------------------------------
 * Типы запроса и ответа
 * ---------------------------------------- */
export const GetQuestionsCountQuerySchema = z.object({
  dateFrom: z.number().describe('Дата начала периода (Unix timestamp)'),
  dateTo: z.number().describe('Дата конца периода (Unix timestamp)'),
  isAnswered: z
    .boolean()
    .optional()
    .describe('true — обработанные, false — необработанные. По умолчанию: обработанные'),
});

export const GetQuestionsCountResponseSchema = z.object({
  data: z.number().describe('Количество вопросов'),
  error: z.boolean().describe('Есть ли ошибка'),
  errorText: z.string().describe('Описание ошибки'),
  additionalErrors: z
    .array(z.string())
    .nullable()
    .describe('Дополнительные ошибки'),
});

export type GetQuestionsCountQuery = z.infer<typeof GetQuestionsCountQuerySchema>;
export type GetQuestionsCountResponse = z.infer<typeof GetQuestionsCountResponseSchema>;

/* ----------------------------------------
 * Функция запроса
 * ---------------------------------------- */
export async function getQuestionsCount(
  params: GetQuestionsCountQuery,
  apiKey: string
): Promise<GetQuestionsCountResponse> {
  const response = await axios.get(
    'https://feedbacks-api.wildberries.ru/api/v1/questions/count',
    {
      headers: {
        Authorization: apiKey,
      },
      params,
    }
  );

  return GetQuestionsCountResponseSchema.parse(response.data);
}
