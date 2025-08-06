import axios from 'axios';
import { z } from 'zod';

export const GetFeedbackByIdRequestSchema = z.object({
  id: z.string().describe('ID отзыва')
});

// Определяем схемы для вложенных объектов
const FeedbackAnswerSchema = z.object({
  text: z.string().describe('Текст ответа'),
  state: z.enum(['none', 'wbRu', 'reviewRequired', 'rejected'])
    .describe('Статус:\n  ' +
              '- `none` - новый\n  ' +
              '- `wbRu` - отображается на сайте\n ' +
              '- `reviewRequired` - ответ проходит проверку\n ' +
              '- `rejected` - ответ отклонён\n'),
  editable: z.boolean().describe('Можно ли отредактировать ответ')
});

const FeedbackProductDetailsSchema = z.object({
  nmId: z.number().describe('Артикул WB'),
  imtId: z.number().describe('ID карточки товара'),
  productName: z.string().describe('Название товара'),
  supplierArticle: z.string().nullable().describe('Артикул продавца'),
  supplierName: z.string().nullable().describe('Имя продавца'),
  brandName: z.string().nullable().describe('Бренд товара'),
  size: z.string().describe('Размер товара (`techSize` в КТ)')
});

const FeedbackPhotoLinkSchema = z.object({
  fullSize: z.string().describe('Адрес фотографии полного размера'),
  miniSize: z.string().describe('Адрес фотографии маленького размера')
});

const FeedbackVideoSchema = z.object({
  previewImage: z.string().describe('Ссылка на обложку видео'),
  link: z.string().describe('Ссылка на файл плейлиста видео'),
  duration_sec: z.number().describe('Общая продолжительность видео')
});

const FeedbackSchema = z.object({
  id: z.number().describe('ID отзыва'),
  userName: z.string().describe('Имя автора отзыва'),
  pros: z.string().describe('Достоинства товара'),
  cons: z.string().describe('Недостатки товара'),
  matchingSize: z.string().describe('Соответствие заявленного размера реальному'),
  text: z.string().describe('Текст отзыва'),
  productValuation: z.number().describe('Оценка товара'),
  createdDate: z.string().describe('Дата и время создания отзыва'),
  answer: FeedbackAnswerSchema.nullable().describe('Структура ответа'),
  state: z.enum(['none', 'wbRu']).describe('Статус отзыва'),
  productDetails: FeedbackProductDetailsSchema,
  photoLinks: z.array(FeedbackPhotoLinkSchema).nullable().describe('Массив структур фотографий'),
  video: FeedbackVideoSchema.nullable().describe('Структура видео'),
  wasViewed: z.boolean().describe('Просмотрен ли отзыв'),
  isAbleSupplierFeedbackValuation: z.boolean().describe('Доступна ли продавцу возможность оставить жалобу на отзыв'),
  supplierFeedbackValuation: z.number().describe('Ключ причины жалобы на отзыв'),
  isAbleSupplierProductValuation: z.boolean().describe('Доступна ли продавцу возможность сообщить о проблеме с товаром'),
  supplierProductValuation: z.number().describe('Ключ проблемы с товаром'),
  isAbleReturnProductOrders: z.boolean().describe('Доступна ли товару опция возврата'),
  returnProductOrdersDate: z.string().describe('Дата и время ответа на запрос возврата'),
  bables: z.array(z.string()).nullable().describe('Список тегов покупателя'),
  lastOrderShkId: z.number().describe('Штрихкод единицы товара'),
  lastOrderCreatedAt: z.string().describe('Дата покупки'),
  color: z.string().describe('Цвет товара'),
  subjectId: z.number().describe('ID предмета'),
  subjectName: z.string().describe('Название предмета'),
  parentFeedbackId: z.string().nullable().describe('ID начального отзыва'),
  childFeedbackId: z.string().nullable().describe('ID дополненного отзыва')
});

export const GetFeedbackByIdResponseSchema = z.object({
  data: FeedbackSchema,
  error: z.boolean().describe('Есть ли ошибка'),
  errorText: z.string().describe('Описание ошибки'),
  additionalErrors: z.array(z.string()).nullable().describe('Дополнительные ошибки')
});

export type GetFeedbackByIdRequest = z.infer<typeof GetFeedbackByIdRequestSchema>;
export type GetFeedbackByIdResponse = z.infer<typeof GetFeedbackByIdResponseSchema>;

export async function getFeedbackById(
  args: GetFeedbackByIdRequest,
  apiKey: string
): Promise<GetFeedbackByIdResponse> {
  const response = await axios.get('https://feedbacks-api.wildberries.ru/api/v1/feedback', {
    params: {
      id: args.id
    },
    headers: {
      Authorization: apiKey
    }
  });

  // Валидируем ответ через схему
  return GetFeedbackByIdResponseSchema.parse(response.data);
}