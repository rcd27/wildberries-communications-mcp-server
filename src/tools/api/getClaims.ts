import axios from 'axios';
import { z } from 'zod';

export const GetClaimsRequestSchema = z.object({
  is_archive: z.boolean().describe(
    'Состояние заявки:\n  * `false` — на рассмотрении\n  * `true` — в архиве'
  ),
  id: z
    .string()
    .uuid()
    .optional()
    .describe('ID заявки'),
  limit: z
    .number()
    .min(1)
    .max(200)
    .optional()
    .default(50)
    .describe('Количество заявок в ответе. По умолчанию `50`'),
  offset: z
    .number()
    .min(0)
    .optional()
    .default(0)
    .describe('После какого элемента выдавать данные. По умолчанию `0`'),
  nm_id: z
    .number()
    .optional()
    .describe('Артикул WB')
});

export type GetClaimsRequest = z.infer<typeof GetClaimsRequestSchema>;

export interface Claim {
  id: string;
  claim_type: number;
  status: number;
  status_ex: number;
  nm_id: number;
  user_comment: string;
  wb_comment: string | null;
  dt: string;
  imt_name: string | null;
  order_dt: string;
  dt_update: string;
  photos: string[];
  video_paths: string[];
  actions: string[];
  price: number;
  currency_code: string;
  srid: string;
}

export interface GetClaimsResponse {
  claims: Claim[];
  total: number;
}

// FIXME: Требует токена для возвратов:
export async function getClaims(
  args: GetClaimsRequest,
  apiKey: string
): Promise<GetClaimsResponse> {
  const response = await axios.get('https://returns-api.wildberries.ru/api/v1/claims', {
    params: args,
    headers: {
      Authorization: apiKey
    }
  });

  return response.data;
}