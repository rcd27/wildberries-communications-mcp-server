import { z } from 'zod';

export const createResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) => {
  return z.object({
    data: dataSchema,
    error: z.boolean().describe('Есть ли ошибка'),
    errorText: z.string().describe('Описание ошибки'),
    additionalErrors: z.array(z.string()).nullable().describe('Дополнительные ошибки')
  });
};