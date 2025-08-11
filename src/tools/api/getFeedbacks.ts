import axios from 'axios';
import { z } from 'zod';
import { createResponseSchema } from '../../createResponseSchema.js';

export const GetFeedbacksQuerySchema = z.object({
  isAnswered: z
    .boolean()
    .describe('Обработанные отзывы (true) или необработанные отзывы (false)'),
  nmId: z
    .number()
    .int()
    .optional()
    .describe('Артикул WB'),
  take: z
    .number()
    .int()
    .min(1)
    .max(5000)
    .describe('Количество отзывов (max. 5000)'),
  skip: z
    .number()
    .int()
    .min(0)
    .max(199990)
    .describe('Количество отзывов для пропуска (max. 199990)'),
  order: z
    .enum(['dateDesc', 'dateAsc'])
    .optional()
    .describe(
      `Сортировка отзывов по дате:
- dateDesc — по убыванию (новые сверху),
- dateAsc — по возрастанию (старые сверху).`
    ),
  dateFrom: z
    .number()
    .int()
    .optional()
    .describe('Дата начала периода в формате Unix timestamp'),
  dateTo: z
    .number()
    .int()
    .optional()
    .describe('Дата конца периода в формате Unix timestamp')
});

export const FeedbackSchema = z.object({
  id: z.string().describe('Уникальный идентификатор отзыва'),
  userName: z.string().describe('Имя пользователя, оставившего отзыв'),
  productDetails: z.object({
    imtId: z.number().describe('ID карточки товара'),
    nmId: z.number().describe('Артикул WB'),
    productName: z.string().describe('Название товара'),
    supplierArticle: z.string().nullable().describe('Артикул продавца'),
    supplierName: z.string().nullable().describe('Имя продавца'),
    brandName: z.string().nullable().describe('Бренд товара'),
    size: z.string().describe('Размер товара')
  }),
  productValuation: z.number().min(1).max(5).describe('Оценка товара от 1 до 5'),
  createdDate: z.string().datetime().describe('Дата создания отзыва в формате ISO 8601'),
  text: z.string().nullable().describe('Текст отзыва'),
  pros: z.string().describe('Достоинства товара'),
  cons: z.string().describe('Недостатки товара'),
  answer: z.object({
    text: z.string().describe('Текст ответа'),
    state: z.enum(['none', 'wbRu', 'reviewRequired', 'rejected']).describe(
      'Статус ответа:\n' +
      '- none - новый\n' +
      '- wbRu - отображается на сайте\n' +
      '- reviewRequired - ответ проходит проверку\n' +
      '- rejected - ответ отклонён'
    ),
    editable: z.boolean().describe('Можно ли отредактировать ответ')
  }).nullable().describe('Ответ продавца на отзыв'),
  matchingSize: z.string().describe('Соответствие заявленного размера реальному'),
  state: z.enum(['none', 'wbRu']).describe('Статус отзыва'),
  photoLinks: z.array(z.object({
    fullSize: z.string().describe('Адрес фотографии полного размера'),
    miniSize: z.string().describe('Адрес фотографии маленького размера')
  })).nullable().describe('Массив фотографий'),
  video: z.object({
    previewImage: z.string().describe('Ссылка на обложку видео'),
    link: z.string().describe('Ссылка на файл плейлиста видео'),
    durationSec: z.number().describe('Общая продолжительность видео')
  }).nullable().describe('Видео отзыва'),
  wasViewed: z.boolean().describe('Просмотрен ли отзыв')
});

export const GetFeedbacksResponseSchema = createResponseSchema(z.object({
  countUnanswered: z.number().describe('Количество необработанных отзывов'),
  countArchive: z.number().describe('Количество обработанных отзывов'),
  feedbacks: z.array(FeedbackSchema).describe('Список отзывов')
}));

export type GetFeedbacksQuery = z.infer<typeof GetFeedbacksQuerySchema>;
export type GetFeedbacksResponse = z.infer<typeof GetFeedbacksResponseSchema>;

export async function getFeedbacks(
  query: GetFeedbacksQuery,
  token: string
): Promise<GetFeedbacksResponse> {
  const response = await axios.get('https://feedbacks-api.wildberries.ru/api/v1/feedbacks', {
    headers: {
      Authorization: token
    },
    params: query
  });

  return GetFeedbacksResponseSchema.parse(response.data);
}
