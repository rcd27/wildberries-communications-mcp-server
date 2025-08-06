import axios from 'axios';
import { z } from 'zod';

/* ----------------------------------------
 * Типы запроса и ответа
 * ---------------------------------------- */
export const GetQuestionsQuerySchema = z.object({
  isAnswered: z.boolean().describe('Отвеченные (`true`) или неотвеченные (`false`) вопросы'),
  take: z
    .number()
    .min(1)
    .max(10000)
    .describe('Количество запрашиваемых вопросов (макс. 10 000)'),
  skip: z
    .number()
    .min(0)
    .max(10000)
    .describe('Количество вопросов для пропуска (макс. 10 000)'),
  nmId: z.number().optional().describe('Артикул WB'),
  order: z.enum(['dateAsc', 'dateDesc']).optional().describe('Сортировка по дате'),
  dateFrom: z.number().optional().describe('Дата начала периода (Unix timestamp)'),
  dateTo: z.number().optional().describe('Дата конца периода (Unix timestamp)'),
});

const QuestionSchema = z.object({
  id: z.string(),
  text: z.string(),
  createdDate: z.string().describe('Дата и время создания вопроса (ISO)'),
  state: z.enum(['none', 'wbRu', 'suppliersPortalSynch']),
  answer: z
    .object({
      text: z.string(),
      editable: z.boolean(),
      createDate: z.string(),
    })
    .nullable(),
  productDetails: z.object({
    nmId: z.number(),
    imtId: z.number(),
    productName: z.string(),
    supplierArticle: z.string(),
    supplierName: z.string(),
    brandName: z.string(),
  }),
  wasViewed: z.boolean(),
  isWarned: z.boolean(),
});

export const GetQuestionsResponseSchema = z.object({
  data: z.object({
    countUnanswered: z.number(),
    countArchive: z.number(),
    questions: z.array(QuestionSchema),
  }),
  error: z.boolean(),
  errorText: z.string(),
  additionalErrors: z.array(z.string()).nullable(),
});

export type GetQuestionsQuery = z.infer<typeof GetQuestionsQuerySchema>;
export type GetQuestionsResponse = z.infer<typeof GetQuestionsResponseSchema>;

/* ----------------------------------------
 * Функция запроса
 * ---------------------------------------- */
export async function getQuestions(
  params: GetQuestionsQuery,
  apiKey: string
): Promise<GetQuestionsResponse> {
  const response = await axios.get(
    'https://feedbacks-api.wildberries.ru/api/v1/questions',
    {
      headers: {
        Authorization: apiKey,
      },
      params,
    }
  );

  return GetQuestionsResponseSchema.parse(response.data);
}
