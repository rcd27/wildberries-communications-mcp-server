import axios from 'axios';
import { z } from 'zod';
import { createResponseSchema } from '../../createResponseSchema.js';

export const GetFeedbacksQuerySchema = z.object({
  isAnswered: z
    .boolean()
    .describe('Обработанные отзывы (true) или необработанные отзывы (false)'),
  nmId: z
    .number()
    .optional()
    .describe('Артикул WB'),
  take: z
    .number()
    .min(1)
    .max(5000)
    .describe('Количество отзывов (max. 5000)'),
  skip: z
    .number()
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
  id: z.string().optional().nullable().describe('ID отзыва'),
  text: z.string().optional().nullable().describe('Текст отзыва'),
  pros: z.string().optional().nullable().describe('Достоинства товара'),
  cons: z.string().optional().nullable().describe('Недостатки товара'),
  productValuation: z.number().int().optional().nullable().describe('Оценка товара'),
  createdDate: z.string().datetime().optional().nullable().describe('Дата и время создания отзыва'),
  answer: z.object({
    text: z.string().optional().nullable().describe('Текст ответа'),
    state: z.enum(['none', 'wbRu', 'reviewRequired', 'rejected']).optional().nullable().describe(
      'Статус ответа:\n' +
      '- none - новый\n' +
      '- wbRu - отображается на сайте\n' +
      '- reviewRequired - ответ проходит проверку\n' +
      '- rejected - ответ отклонён'
    ),
    editable: z.boolean().optional().nullable().describe('Можно ли отредактировать ответ')
  }).nullable().optional().nullable().describe('Структура ответа'),
  state: z.enum(['none', 'wbRu']).optional().nullable().describe('Статус отзыва'),
  productDetails: z.object({
    nmId: z.number().int().optional().nullable().describe('Артикул WB'),
    imtId: z.number().int().optional().nullable().describe('ID карточки товара'),
    productName: z.string().optional().nullable().describe('Название товара'),
    supplierArticle: z.string().nullable().optional().nullable().describe('Артикул продавца'),
    supplierName: z.string().nullable().optional().nullable().describe('Имя продавца'),
    brandName: z.string().nullable().optional().nullable().describe('Бренд товара'),
    size: z.string().optional().nullable().describe('Размер товара')
  }).optional().nullable().describe('Структура товара'),
  photoLinks: z.array(z.object({
    fullSize: z.string().optional().nullable().describe('Адрес фотографии полного размера'),
    miniSize: z.string().optional().nullable().describe('Адрес фотографии маленького размера')
  })).nullable().optional().nullable().describe('Массив структур фотографий'),
  video: z.object({
    previewImage: z.string().optional().nullable().describe('Ссылка на обложку видео'),
    link: z.string().optional().nullable().describe('Ссылка на файл плейлиста видео'),
    durationSec: z.number().int().optional().nullable().describe('Общая продолжительность видео')
  }).nullable().optional().nullable().describe('Структура видео'),
  wasViewed: z.boolean().optional().nullable().describe('Просмотрен ли отзыв'),
  userName: z.string().optional().nullable().describe('Имя автора отзыва'),
  matchingSize: z.string().optional().nullable().describe('Соответствие заявленного размера реальному'),
  isAbleSupplierFeedbackValuation: z.boolean().optional().nullable().describe('Доступна ли продавцу возможность оставить жалобу на отзыв'),
  supplierFeedbackValuation: z.number().int().optional().nullable().describe('Ключ причины жалобы на отзыв'),
  isAbleSupplierProductValuation: z.boolean().optional().nullable().describe('Доступна ли продавцу возможность сообщить о проблеме с товаром'),
  supplierProductValuation: z.number().int().optional().nullable().describe('Ключ проблемы с товаром'),
  isAbleReturnProductOrders: z.boolean().optional().nullable().describe('Доступна ли товару опция возврата'),
  returnProductOrdersDate: z.string().optional().nullable().describe('Дата и время ответа на запрос возврата'),
  bables: z.array(z.string()).nullable().optional().nullable().describe('Список тегов покупателя'),
  lastOrderShkId: z.number().int().optional().nullable().describe('Штрихкод единицы товара'),
  lastOrderCreatedAt: z.string().optional().nullable().describe('Дата покупки'),
  color: z.string().optional().nullable().describe('Цвет товара'),
  subjectId: z.number().int().optional().nullable().describe('ID предмета'),
  subjectName: z.string().optional().nullable().describe('Название предмета'),
  parentFeedbackId: z.string().nullable().optional().nullable().describe('ID начального отзыва'),
  childFeedbackId: z.string().nullable().optional().nullable().describe('ID дополненного отзыва')
}).passthrough(); // passthrough разрешает дополнительные поля

export const GetFeedbacksResponseSchema = createResponseSchema(z.object({
  countUnanswered: z.number().int().describe('Количество необработанных отзывов'),
  countArchive: z.number().int().describe('Количество обработанных отзывов'),
  feedbacks: z.array(FeedbackSchema).describe('Массив отзывов')
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