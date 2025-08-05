import axios from 'axios';
import { z } from 'zod';

export const GetNewFeedbacksQuestionsRequestSchema = z.object({});

export type GetNewFeedbacksQuestionsRequest = z.infer<typeof GetNewFeedbacksQuestionsRequestSchema>;

export interface NewFeedbacksQuestionsData {
  /** Есть ли непросмотренные вопросы (true есть, false нет) */
  hasNewQuestions: boolean;
  /** Есть ли непросмотренные отзывы (true есть, false нет) */
  hasNewFeedbacks: boolean;
}

export interface GetNewFeedbacksQuestionsResponse {
  /** Данные о непросмотренных вопросах и отзывах */
  data: NewFeedbacksQuestionsData;
  /** Есть ли ошибка */
  error: boolean;
  /** Описание ошибки */
  errorText: string;
  /** Дополнительные ошибки */
  additionalErrors: string[] | null;
}

export interface GetNewFeedbacksQuestionsErrorResponse {
  /** Данные (null при ошибке) */
  data: null;
  /** Есть ли ошибка */
  error: boolean;
  /** Описание ошибки */
  errorText: string;
  /** Дополнительные ошибки */
  additionalErrors: string[] | null;
  /** ID запроса */
  requestId: string;
}

export interface AuthorizationErrorResponse {
  /** Заголовок ошибки */
  title: string;
  /** Детали ошибки */
  detail: string;
  /** Внутренний код ошибки */
  code: string;
  /** Уникальный ID запроса */
  requestId: string;
  /** ID внутреннего сервиса WB */
  origin: string;
  /** HTTP статус-код */
  status: number;
  /** Расшифровка HTTP статус-кода */
  statusText: string;
  /** Дата и время запроса */
  timestamp: string;
}

export interface RateLimitErrorResponse {
  /** Заголовок ошибки */
  title: string;
  /** Детали ошибки */
  detail: string;
  /** Внутренний код ошибки */
  code: string;
  /** Уникальный ID запроса */
  requestId: string;
  /** ID внутреннего сервиса WB */
  origin: string;
  /** HTTP статус-код */
  status: number;
  /** Расшифровка HTTP статус-кода */
  statusText: string;
  /** Дата и время запроса в формате RFC3339 */
  timestamp: string;
}

export async function getNewFeedbacksQuestions(
  // FIXME: не используется
  args: GetNewFeedbacksQuestionsRequest,
  apiKey: string
): Promise<GetNewFeedbacksQuestionsResponse> {
  const response = await axios.get('https://feedbacks-api.wildberries.ru/api/v1/new-feedbacks-questions', {
    headers: {
      Authorization: apiKey
    }
  });

  // TODO: Обработать выше описанные ошибки
  return response.data;
}