import { z } from "zod";
import axios from "axios";

export const FeedbackValuationsSchema = z.object({
  "1": z.string().describe("Причина жалобы: 1"),
  "2": z.string().describe("Причина жалобы: 2"),
  "3": z.string().describe("Причина жалобы: 3"),
  "4": z.string().describe("Причина жалобы: 4"),
  "5": z.string().describe("Причина жалобы: 5"),
  "6": z.string().describe("Причина жалобы: 6"),
  "7": z.string().describe("Причина жалобы: 7"),
}).describe("Причины жалоб на отзывы");

export const ProductValuationsSchema = z.object({
  "1": z.string().describe("Проблема с товаром: 1"),
  "2": z.string().describe("Проблема с товаром: 2"),
  "3": z.string().describe("Проблема с товаром: 3"),
  "4": z.string().describe("Проблема с товаром: 4"),
}).describe("Проблемы с товаром");

export const DataSchema = z.object({
  feedbackValuations: FeedbackValuationsSchema.describe(
    "Причины жалоб на отзыв и проблемы с товаром"
  ),
  productValuations: ProductValuationsSchema,
}).describe("Данные ответа");

export const ResponseSchema = z.object({
  data: DataSchema.describe("Данные").optional(),
  error: z.boolean().describe("Есть ли ошибка"),
  errorText: z.string().describe("Описание ошибки"),
  additionalErrors: z.array(z.string()).nullable().optional().describe("Дополнительные ошибки"),
}).describe("Ответ метода получения списков причин жалоб на отзыв и проблем с товаром");

export const exampleResponse = {
  data: {
    feedbackValuations: {
      "1": "Отзыв не относится к товару",
      "2": "Отзыв оставили конкуренты",
      "3": "Спам",
      "4": "Нецензурное содержимое в фото",
      "5": "Нецензурная лексика",
      "6": "Фото не имеет отношения к товару",
      "7": "Отзыв с политическим контекстом",
    },
    productValuations: {
      "1": "Повредили при доставке",
      "2": "Товар подменили",
      "3": "Случайно отправил не тот товар и хочу его вернуть",
      "4": "Товар вернули после эксплуатации",
    },
  },
  error: false,
  errorText: "",
  additionalErrors: null,
};

export type Response = z.infer<typeof ResponseSchema>;

export async function getSupplierValuations(
  locale?: string,
  apiKey?: string
): Promise<Response> {
  const headers: Record<string, string> = {};
  if (locale) headers["X-Locale"] = locale;
  if (apiKey) headers["X-API-KEY"] = apiKey;

  const response = await axios.get("https://feedbacks-api.wildberries.ru/api/v1/supplier-valuations", {
    headers: {
      Authorization: apiKey,
      'X-Locale': locale,
    },
  });
  return ResponseSchema.parse(response.data);
}
