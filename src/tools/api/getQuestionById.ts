import axios from 'axios';
import { z } from 'zod';
import { createResponseSchema } from '../../createResponseSchema.js';

/* ----------------------------------------
 * Общие схемы ошибок
 * ---------------------------------------- */
const ErrorResponseBaseSchema = z.object({
  title: z.string().describe('Заголовок ошибки'),
  detail: z.string().describe('Детали ошибки'),
  code: z.string().describe('Внутренний код ошибки'),
  requestId: z.string().describe('Уникальный ID запроса'),
  origin: z.string().describe('ID внутреннего сервиса WB'),
  status: z.number().describe('HTTP статус-код'),
  statusText: z.string().describe('Расшифровка HTTP статус-кода'),
  timestamp: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/).describe('Дата и время запроса (RFC3339)')
});

const FeedbackErrorSchema = z.object({
  data: z.null(),
  error: z.boolean().describe('Есть ли ошибка'),
  errorText: z.string().describe('Описание ошибки'),
  additionalErrors: z.array(z.string()).nullable().describe('Дополнительные ошибки'),
  requestId: z.string().describe('Уникальный идентификатор запроса')
});

/* ----------------------------------------
 * Тип запроса
 * ---------------------------------------- */
export const GetQuestionByIdRequestSchema = z.object({
  id: z.string().min(1).describe('ID вопроса, который необходимо получить')
});

/* ----------------------------------------
 * Тип ответа
 * ---------------------------------------- */
export const GetQuestionByIdResponseSchema = createResponseSchema(z.object({
  id: z.string().describe('ID вопроса'),
  text: z.string().describe('Текст вопроса'),
  createdDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/)
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
        .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/)
        .describe('Дата и время создания ответа (ISO 8601)')
    })
    .nullable()
    .describe('Ответ на вопрос (если есть)'),
  productDetails: z
    .object({
      nmId: z.number().int().describe('Артикул Wildberries'),
      imtId: z.number().int().describe('ID карточки товара'),
      productName: z.string().describe('Название товара'),
      supplierArticle: z.string().describe('Артикул продавца'),
      supplierName: z.string().describe('Имя продавца'),
      brandName: z.string().describe('Название бренда')
    })
    .describe('Информация о товаре, к которому относится вопрос'),
  wasViewed: z.boolean().describe('Флаг, указывающий, был ли вопрос просмотрен'),
  isWarned: z.boolean().describe(
    'Признак подозрительного вопроса. Если `true`, то вопрос сопровождается предупреждением.'
  )
}));

export type GetQuestionByIdRequest = z.infer<typeof GetQuestionByIdRequestSchema>;
export type GetQuestionByIdResponse = z.infer<typeof GetQuestionByIdResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseBaseSchema>;
export type FeedbackError = z.infer<typeof FeedbackErrorSchema>;

/* ----------------------------------------
 * Функция запроса
 * ---------------------------------------- */
export async function getQuestionById(
  params: GetQuestionByIdRequest,
  apiKey: string
): Promise<GetQuestionByIdResponse> {
  const response = await axios.get('https://feedbacks-api.wildberries.ru/api/v1/question', {
    headers: {
      Authorization: apiKey
    },
    params
  });

  return GetQuestionByIdResponseSchema.parse(response.data);
}