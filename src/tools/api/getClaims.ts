import axios from 'axios';
import { z } from 'zod';

/* ----------------------------------------
 * Типы запроса
 * ---------------------------------------- */

export const GetClaimsRequestSchema = z.object({
  is_archive: z.boolean().describe('Состояние заявки: false — на рассмотрении, true — в архиве'),
  id: z.string().uuid().optional().describe('ID заявки'),
  limit: z.number().min(1).max(200).optional().describe('Количество заявок в ответе. По умолчанию 50'),
  offset: z.number().min(0).optional().describe('После какого элемента выдавать данные. По умолчанию 0'),
  nm_id: z.number().optional().describe('Артикул WB')
});

export type GetClaimsRequest = z.infer<typeof GetClaimsRequestSchema>;

/* ----------------------------------------
 * Типы ответа
 * ---------------------------------------- */

const ClaimSchema = z.object({
  id: z.string().uuid().describe('ID заявки'),
  claim_type: z.number().describe('Источник заявки: 1 — портал покупателей, 3 — чат'),
  status: z.number().describe('Решение по возврату: 0 — на рассмотрении, 1 — отказ, 2 — одобрено'),
  status_ex: z.number().describe(
    'Статус товара: ' +
    '0 — заявка на рассмотрении, ' +
    '1 — товар остается у покупателя (Заявка отклонена), ' +
    '2 — покупатель сдает товар на WB, товар отправляется в утиль, ' +
    '5 — товар остается у покупателя (Заявка одобрена), ' +
    '8 — товар будет возвращён в реализацию после проверки WB, ' +
    '10 — товар возвращается продавцу'
  ),
  nm_id: z.number().describe('Артикул WB'),
  user_comment: z.string().max(1000).describe('Комментарий покупателя'),
  wb_comment: z.string().max(10000).nullable().describe('Ответ покупателю'),
  dt: z.string().datetime().describe('Дата и время оформления заявки покупателем'),
  imt_name: z.string().nullable().describe('Название товара'),
  order_dt: z.string().datetime().describe('Дата и время заказа'),
  dt_update: z.string().datetime().describe('Дата и время рассмотрения заявки. Для нерассмотренной заявки — дата и время оформления'),
  photos: z.array(z.string()).describe('Фотографии из заявки покупателя'),
  video_paths: z.array(z.string()).describe('Видео из заявки покупателя'),
  actions: z.array(z.string()).describe('Варианты ответа продавца на заявку'),
  price: z.number().describe('Фактическая цена с учетом всех скидок'),
  currency_code: z.string().describe('Код валюты цены'),
  srid: z.string().describe('Уникальный ID заказа, по товару которого создана заявка')
});

export const GetClaimsResponseSchema = z.object({
  claims: z.array(ClaimSchema).describe('Заявки'),
  total: z.number().describe('Количество заявок, соответствующих параметрам запроса')
});

export type GetClaimsResponse = z.infer<typeof GetClaimsResponseSchema>;

/* ----------------------------------------
 * Функция запроса
 * ---------------------------------------- */

export async function getClaims(
  params: GetClaimsRequest,
  apiKey: string
): Promise<GetClaimsResponse> {
  const response = await axios.get('https://feedbacks-api.wildberries.ru/api/v1/claims', {
    headers: {
      Authorization: apiKey,
    },
    params,
  });

  return GetClaimsResponseSchema.parse(response.data);
}