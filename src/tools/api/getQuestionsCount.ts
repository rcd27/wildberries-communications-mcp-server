import axios from 'axios';
import { z } from 'zod';

/* ----------------------------------------
 * Типы запроса и ответа
 * ---------------------------------------- */
export const GetQuestionsCountQuerySchema = z.object({
  dateFrom: z
    .number()
    .int()
    .describe('Дата начала периода в формате Unix timestamp'),
  // .example(1688465092),
  dateTo: z
    .number()
    .int()
    .describe('Дата конца периода в формате Unix timestamp'),
  // .example(1688465092),
  isAnswered: z
    .boolean()
    .optional()
    .describe('Обработанные вопросы (true) или необработанные вопросы (false). Если не указать, вернутся' +
              ' обработанные вопросы.')
  // .example(false),
});

export const GetQuestionsCountResponseSchema = z.object({
  data: z
    .number()
    .int()
    .nonnegative()
    .describe('Количество вопросов'),
  error: z
    .boolean()
    .describe('Есть ли ошибка'),
  errorText: z
    .string()
    .describe('Описание ошибки'),
  additionalErrors: z
    .array(z.string())
    .nullable()
    .describe('Дополнительные ошибки')
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
        Authorization: apiKey
      },
      params
    }
  );

  return GetQuestionsCountResponseSchema.parse(response.data);
}
