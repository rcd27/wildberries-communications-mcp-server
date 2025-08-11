import { z } from "zod";
import axios from "axios";

// --- Query schema
export const GetArchivedFeedbacksQuerySchema = z.object({
  nmId: z
    .number()
    .int()
    .optional()
    .describe("Артикул WB"),
  take: z
    .number()
    .int()
    .min(1)
    .max(5000)
    .describe("Количество отзывов (max. 5 000)"),
  skip: z
    .number()
    .int()
    .min(0)
    .describe("Количество отзывов для пропуска"),
  order: z
    .enum(["dateAsc", "dateDesc"])
    .optional()
    .describe(
      `Сортировка отзывов по дате:
- dateDesc — по убыванию (новые сверху),
- dateAsc — по возрастанию (старые сверху).`
    ),
});

export type GetArchivedFeedbacksQuery = z.infer<
  typeof GetArchivedFeedbacksQuerySchema
>;

// --- Reusable feedback / sub-schemas (maximally described)
export const FeedbackAnswerSchema = z
  .object({
    text: z.string().describe("Текст ответа"),
    state: z
      .enum(["none", "wbRu", "reviewRequired", "rejected"])
      .describe(
        "Статус ответа:\n- `none` - новый\n- `wbRu` - отображается на сайте\n- `reviewRequired` - ответ проходит проверку\n- `rejected` - ответ отклонён"
      ),
    editable: z
      .boolean()
      .describe(
        "Можно ли отредактировать ответ. false — нельзя, true — можно"
      ),
  })
  .nullable()
  .describe("Ответ продавца на отзыв (null если ответа нет)");

export const ProductDetailsSchema = z
  .object({
    imtId: z
      .number()
      .int()
      .optional()
      .describe("ID карточки товара (imtId)"),
    nmId: z
      .number()
      .int()
      .optional()
      .describe("Артикул WB (nmId)"),
    productName: z
      .string()
      .optional()
      .describe("Название товара"),
    supplierArticle: z
      .string()
      .nullable()
      .optional()
      .describe("Артикул продавца (nullable)"),
    supplierName: z
      .string()
      .nullable()
      .optional()
      .describe("Имя продавца (nullable)"),
    brandName: z
      .string()
      .nullable()
      .optional()
      .describe("Бренд товара (nullable)"),
    size: z
      .string()
      .optional()
      .describe("Размер товара (`techSize` в КТ)")
  })
  .describe("Структура товара");

export const PhotoLinkSchema = z
  .object({
    fullSize: z.string().describe("Адрес фотографии полного размера"),
    miniSize: z.string().describe("Адрес фотографии маленького размера"),
  })
  .describe("Структура ссылки на фото");

export const VideoSchema = z
  .object({
    previewImage: z.string().describe("Ссылка на обложку видео"),
    link: z.string().describe("Ссылка на файл плейлиста видео (HLS)"),
    durationSec: z.number().int().describe("Общая продолжительность видео в секундах"),
  })
  .nullable()
  .describe("Структура видео (nullable)");

export const FeedbackSchema = z.object({
  id: z.string().describe("ID отзыва"),
  text: z.string().nullable().describe("Текст отзыва"),
  pros: z.string().nullable().describe("Достоинства товара"),
  cons: z.string().nullable().describe("Недостатки товара"),
  productValuation: z
    .number()
    .int()
    .optional()
    .describe("Оценка товара (целое число)"),
  createdDate: z
    .string()
    .datetime()
    .optional()
    .describe("Дата и время создания отзыва (ISO 8601)"),
  answer: FeedbackAnswerSchema,
  state: z
    .enum(["none", "wbRu"])
    .optional()
    .describe("Статус отзыва: `none` — не обработан, `wbRu` — обработан"),
  productDetails: ProductDetailsSchema.optional().describe("Детали товара (если доступны)"),
  photoLinks: z
    .array(PhotoLinkSchema)
    .nullable()
    .optional()
    .describe("Массив структур фотографий (nullable)"),
  video: VideoSchema,
  wasViewed: z.boolean().optional().describe("Просмотрен ли отзыв"),
  userName: z.string().optional().describe("Имя автора отзыва"),
  matchingSize: z.string().optional().describe(
    "Соответствие заявленного размера реальному. Возможные значения: '' (безразмерные), 'ок', 'smaller', 'bigger'"
  ),
  isAbleSupplierFeedbackValuation: z
    .boolean()
    .optional()
    .describe("Доступна ли продавцу возможность оставить жалобу на отзыв (true/false)"),
  supplierFeedbackValuation: z
    .number()
    .int()
    .optional()
    .describe("Ключ причины жалобы на отзыв (если применимо)"),
  isAbleSupplierProductValuation: z
    .boolean()
    .optional()
    .describe("Доступна ли продавцу возможность сообщить о проблеме с товаром (true/false)"),
  supplierProductValuation: z
    .number()
    .int()
    .optional()
    .describe("Ключ проблемы с товаром (если применимо)"),
  isAbleReturnProductOrders: z
    .boolean()
    .optional()
    .nullable()
    .describe("Доступна ли товару опция возврата (true/false)"),
  returnProductOrdersDate: z.string().optional().nullable().describe(
    "Дата и время, когда на запрос возврата был получен ответ со статус-кодом 200"
  ),
  bables: z
    .array(z.string())
    .nullable()
    .optional()
    .describe("Список тегов покупателя (nullable)"),
  lastOrderShkId: z.number().int().optional().describe("Штрихкод единицы товара"),
  lastOrderCreatedAt: z.string().optional().describe("Дата покупки"),
  color: z.string().optional().describe("Цвет товара"),
  subjectId: z.number().int().optional().describe("ID предмета"),
  subjectName: z.string().optional().describe("Название предмета"),
  parentFeedbackId: z.string().nullable().optional().describe("ID начального отзыва (nullable)"),
  childFeedbackId: z.string().nullable().optional().describe("ID дополненного отзыва (nullable)")
}).describe("Структура отзыва");

export const ResponseFeedbackSchema = z.array(FeedbackSchema).describe("Массив отзывов");

export const GetArchivedFeedbacksResponseSchema = z.object({
  data: z.object({
    feedbacks: ResponseFeedbackSchema.describe("Список архивных отзывов"),
  }).describe("Тело данных ответа"),
  error: z.boolean().describe("Есть ли ошибка"),
  errorText: z.string().describe("Описание ошибки (пустая строка при отсутствии ошибки)"),
  additionalErrors: z.array(z.string()).nullable().describe("Дополнительные ошибки (nullable)"),
});

export type GetArchivedFeedbacksResponse = z.infer<
  typeof GetArchivedFeedbacksResponseSchema
>;

export async function getArchivedFeedbacks(
  query: GetArchivedFeedbacksQuery,
  token: string
): Promise<GetArchivedFeedbacksResponse> {
  const response = await axios.get("https://feedbacks-api.wildberries.ru/api/v1/feedbacks/archive", {
    headers: {
      Authorization: token,
    },
    params: query,
  });

  return GetArchivedFeedbacksResponseSchema.parse(response.data);
}
