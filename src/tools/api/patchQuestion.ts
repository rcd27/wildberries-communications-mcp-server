import axios from 'axios';
import { z } from 'zod';

/* ----------------------------------------
 * Общие схемы ошибок
 * ---------------------------------------- */
export const ErrorResponseSchema = z.object({
  title: z.string().describe('Заголовок ошибки'),
  detail: z.string().describe('Детали ошибки'),
  code: z.string().describe('Внутренний код ошибки'),
  requestId: z.string().describe('Уникальный ID запроса'),
  origin: z.string().describe('ID внутреннего сервиса WB'),
  status: z.number().describe('HTTP статус-код'),
  statusText: z.string().describe('Расшифровка HTTP статус-кода'),
  timestamp: z.string().describe('Дата и время запроса'),
});

/* ----------------------------------------
 * Типы запроса
 * ---------------------------------------- */
export const PatchQuestionMarkViewedSchema = z.object({
  id: z.string().describe('Id вопроса, который нужно отметить как просмотренный'),
  wasViewed: z.boolean().describe('Просмотрен (`true`) или не просмотрен (`false`)'),
});

export const PatchQuestionAnswerSchema = z.object({
  id: z.string().describe('Id вопроса, на который нужно ответить или отредактировать ответ'),
  answer: z.object({
    text: z.string().describe('Текст ответа на вопрос покупателя'),
  }),
  state: z.enum(['none', 'wbRu']).describe(
    'Статус вопроса:\n' +
    ' - `none` — вопрос отклонён продавцом (не отображается покупателю);\n' +
    ' - `wbRu` — ответ отправлен, отображается на сайте покупателей.'
  ),
});

export const PatchQuestionRequestSchema = z.union([
  PatchQuestionMarkViewedSchema,
  PatchQuestionAnswerSchema,
]);

/* ----------------------------------------
 * Тип ответа
 * ---------------------------------------- */
export const PatchQuestionResponseSchema = z.object({
  data: z.null(),
  error: z.boolean().describe('Есть ли ошибка'),
  errorText: z.string().describe('Описание ошибки'),
  additionalErrors: z.array(z.string()).nullable().describe('Дополнительные ошибки'),
  requestId: z.string().optional().describe('ID запроса'),
});

export type PatchQuestionRequest = z.infer<typeof PatchQuestionRequestSchema>;
export type PatchQuestionResponse = z.infer<typeof PatchQuestionResponseSchema>;

/* ----------------------------------------
 * Функция запроса
 * ---------------------------------------- */
export async function patchQuestion(
  body: PatchQuestionRequest,
  apiKey: string
): Promise<PatchQuestionResponse> {
  try {
    const response = await axios.patch(
      'https://feedbacks-api.wildberries.ru/api/v1/questions',
      body,
      {
        headers: {
          Authorization: apiKey,
        },
      }
    );

    return PatchQuestionResponseSchema.parse(response.data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 401 || error.response.status === 429) {
        throw ErrorResponseSchema.parse(error.response.data);
      }
    }
    throw error;
  }
}