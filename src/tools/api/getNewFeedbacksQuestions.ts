import axios from 'axios';
import { z } from 'zod';
import { createResponseSchema } from '../../createResponseSchema.js';

// Схема ответа с успешным результатом
export const NewFeedbacksQuestionsDataSchema = z.object({
  hasNewQuestions: z.boolean().describe('Есть ли непросмотренные вопросы (true есть, false нет)'),
  hasNewFeedbacks: z.boolean().describe('Есть ли непросмотренные отзывы (true есть, false нет)')
});

export const GetNewFeedbacksQuestionsResponseSchema = createResponseSchema(NewFeedbacksQuestionsDataSchema);

// Схема ответа с ошибкой 403
export const GetNewFeedbacksQuestionsErrorResponseSchema = z.object({
  data: z.null().describe('Данные (null при ошибке)'),
  error: z.boolean().describe('Есть ли ошибка'),
  errorText: z.string().describe('Описание ошибки'),
  additionalErrors: z.array(z.string()).nullable().describe('Дополнительные ошибки'),
  requestId: z.string().describe('ID запроса')
});

// Схема ответа с ошибкой авторизации 401
export const AuthorizationErrorResponseSchema = z.object({
  title: z.string().describe('Заголовок ошибки'),
  detail: z.string().describe('Детали ошибки'),
  code: z.string().describe('Внутренний код ошибки'),
  requestId: z.string().describe('Уникальный ID запроса'),
  origin: z.string().describe('ID внутреннего сервиса WB'),
  status: z.number().describe('HTTP статус-код'),
  statusText: z.string().describe('Расшифровка HTTP статус-кода'),
  timestamp: z.string().describe('Дата и время запроса')
});

// Схема ответа при превышении лимита запросов 429
export const RateLimitErrorResponseSchema = z.object({
  title: z.string().describe('Заголовок ошибки'),
  detail: z.string().describe('Детали ошибки'),
  code: z.string().describe('Внутренний код ошибки'),
  requestId: z.string().describe('Уникальный ID запроса'),
  origin: z.string().describe('ID внутреннего сервиса WB'),
  status: z.number().describe('HTTP статус-код'),
  statusText: z.string().describe('Расшифровка HTTP статус-кода'),
  timestamp: z.string().datetime().describe('Дата и время запроса')
});

// Экспорт типов на основе схем
export type NewFeedbacksQuestionsData = z.infer<typeof NewFeedbacksQuestionsDataSchema>;
export type GetNewFeedbacksQuestionsResponse = z.infer<typeof GetNewFeedbacksQuestionsResponseSchema>;
export type GetNewFeedbacksQuestionsErrorResponse = z.infer<typeof GetNewFeedbacksQuestionsErrorResponseSchema>;
export type AuthorizationErrorResponse = z.infer<typeof AuthorizationErrorResponseSchema>;
export type RateLimitErrorResponse = z.infer<typeof RateLimitErrorResponseSchema>;

export async function getNewFeedbacksQuestions(
  apiKey: string
): Promise<GetNewFeedbacksQuestionsResponse> {
  const response = await axios.get('https://feedbacks-api.wildberries.ru/api/v1/new-feedbacks-questions', {
    headers: {
      Authorization: apiKey
    }
  });

  return GetNewFeedbacksQuestionsResponseSchema.parse(response.data);
}