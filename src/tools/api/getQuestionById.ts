import axios from 'axios';
import { z } from 'zod';

/* ----------------------------------------
 * Тип запроса
 * ---------------------------------------- */
export const GetQuestionByIdRequestSchema = z.object({
  id: z.string().describe('ID вопроса, который необходимо получить'),
});

export type GetQuestionByIdRequest = z.infer<typeof GetQuestionByIdRequestSchema>;

/* ----------------------------------------
 * Тип ответа
 * ---------------------------------------- */
export const GetQuestionByIdResponseSchema = z.object({
  data: z.object({
    id: z.string().describe('ID вопроса'),
    text: z.string().describe('Текст вопроса'),
    createdDate: z
      .string()
      .datetime()
      .describe('Дата и время создания вопроса (ISO 8601)'),
    state: z
      .enum(['none', 'wbRu', 'suppliersPortalSynch'])
      .describe(
        'Статус вопроса:\n' +
        ' - `none` — вопрос отклонён продавцом (не отображается покупателю)\n' +
        ' - `wbRu` — ответ предоставлен, отображается на портале\n' +
        ' - `suppliersPortalSynch` — новый вопрос'
      ),
    answer: z
      .object({
        text: z.string().describe('Текст ответа'),
        editable: z
          .boolean()
          .describe('Можно ли отредактировать ответ (`true` — можно, `false` — нельзя)'),
        createDate: z
          .string()
          .datetime()
          .describe('Дата и время создания ответа (ISO 8601)'),
      })
      .nullable()
      .describe('Ответ на вопрос (если есть)'),
    productDetails: z
      .object({
        nmId: z.number().describe('Артикул Wildberries'),
        imtId: z.number().describe('ID карточки товара'),
        productName: z.string().describe('Название товара'),
        supplierArticle: z.string().describe('Артикул продавца'),
        supplierName: z.string().describe('Имя продавца'),
        brandName: z.string().describe('Название бренда'),
      })
      .describe('Информация о товаре, к которому относится вопрос'),
    wasViewed: z
      .boolean()
      .describe('Флаг, указывающий, был ли вопрос просмотрен'),
    isWarned: z
      .boolean()
      .describe(
        'Признак подозрительного вопроса. Если `true`, то вопрос сопровождается предупреждением.'
      ),
  }),
  error: z.boolean().describe('Флаг ошибки выполнения запроса'),
  errorText: z.string().describe('Описание ошибки (если есть)'),
  additionalErrors: z.array(z.string()).nullable().describe('Список дополнительных ошибок'),
});

export type GetQuestionByIdResponse = z.infer<typeof GetQuestionByIdResponseSchema>;

/* ----------------------------------------
 * Функция запроса
 * ---------------------------------------- */
export async function getQuestionById(
  params: GetQuestionByIdRequest,
  apiKey: string
): Promise<GetQuestionByIdResponse> {
  const response = await axios.get('https://feedbacks-api.wildberries.ru/api/v1/question', {
    headers: {
      Authorization: apiKey,
    },
    params,
  });

  return GetQuestionByIdResponseSchema.parse(response.data);
}
