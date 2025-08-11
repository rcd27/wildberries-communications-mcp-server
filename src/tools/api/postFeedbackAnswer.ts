import axios from 'axios';
import { z } from 'zod';

export const PostFeedbackAnswerRequestSchema = z.object({
  id: z.string().describe(
    'ID отзыва, на который вы хотите ответить. Не проходит валидацию на корректность — ошибка не вернётся даже при некорректном ID.'),
  text: z.string().min(2, 'Минимальная длина текста ответа — 2 символа').max(
    5000,
    'Максимальная длина текста ответа — 5000 символов'
  ).describe('Текст ответа на отзыв покупателя')
});

export type PostFeedbackAnswerRequest = z.infer<typeof PostFeedbackAnswerRequestSchema>

export async function postFeedbackAnswer(apiKey: string, body: PostFeedbackAnswerRequest): Promise<void> {
  return await axios.post('https://feedbacks-api.wildberries.ru/api/v1/feedbacks/answer', body, {
    headers: {
      Authorization: apiKey,
      'Content-Type': 'application/json'
    },
    validateStatus: (status) => status === 204 // Успешный статус
  });
}
