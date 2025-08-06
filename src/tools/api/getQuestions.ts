import axios from 'axios';
import { z } from 'zod';

/* ----------------------------------------
 * Типы запроса и ответа
 * ---------------------------------------- */
export const GetQuestionsQuerySchema = z.object({
  isAnswered: z.boolean().describe('Отвеченные (true) или неотвеченные (false) вопросы'),
  take: z
    .number()
    .min(1)
    .max(10000)
    .describe('Количество запрашиваемых вопросов (максимально допустимое значение - 10 000, при этом сумма значений take и skip не должна превышать 10 000)'),
  skip: z
    .number()
    .min(0)
    .max(10000)
    .describe('Количество вопросов для пропуска (максимально допустимое значение - 10 000, при этом сумма значений take и skip не должна превышать 10 000)'),
  nmId: z.number().optional().describe('Артикул WB'),
  order: z.enum(['dateAsc', 'dateDesc']).optional().describe('Сортировка вопросов по дате (dateAsc/dateDesc)'),
  dateFrom: z.number().optional().describe('Дата начала периода в формате Unix timestamp'),
  dateTo: z.number().optional().describe('Дата конца периода в формате Unix timestamp'),
});

const QuestionSchema = z.object({
  id: z.string().describe('id вопроса'),
  text: z.string().describe('Текст вопроса'),
  createdDate: z.string().datetime().describe('Дата и время создания вопроса'),
  state: z.enum(['none', 'wbRu', 'suppliersPortalSynch']).describe(
    `Статус вопроса:
- none - вопрос отклонён продавцом (не отображается на портале покупателей)
- wbRu - ответ предоставлен, вопрос отображается на сайте покупателей
- suppliersPortalSynch - новый вопрос`
  ),
  answer: z
    .object({
      text: z.string().describe('Текст ответа'),
      editable: z.boolean().describe('Можно ли отредактировать ответ (false - нельзя, true - можно)'),
      createDate: z.string().datetime().describe('Дата и время создания ответа'),
    })
    .nullable()
    .describe('Структура ответа'),
  productDetails: z
    .object({
      nmId: z.number().describe('Артикул WB'),
      imtId: z.number().describe('ID карточки товара'),
      productName: z.string().describe('Название товара'),
      supplierArticle: z.string().describe('Артикул продавца'),
      supplierName: z.string().describe('Имя продавца'),
      brandName: z.string().describe('Название бренда'),
    })
    .describe('Структура товара'),
  wasViewed: z.boolean().describe('Просмотрен ли вопрос'),
  isWarned: z.boolean().describe('Признак подозрительного вопроса. Если true, то вопрос опубликован, но на портале продавцов будет баннер "Сообщение подозрительное"'),
});

export const GetQuestionsResponseSchema = z.object({
  data: z.object({
    countUnanswered: z.number().describe('Количество необработанных вопросов'),
    countArchive: z.number().describe('Количество обработанных вопросов'),
    questions: z.array(QuestionSchema).describe('Массив структур вопросов'),
  }),
  error: z.boolean().describe('Есть ли ошибка'),
  errorText: z.string().describe('Описание ошибки'),
  additionalErrors: z.array(z.string()).nullable().describe('Дополнительные ошибки'),
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