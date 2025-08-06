import axios from 'axios';

export interface GetUnansweredFeedbackCountResponse {
  data: {
    countUnanswered: number;
    countUnansweredToday: number;
    valuation: string;
  };
  error: boolean;
  errorText: string;
  additionalErrors: string[] | null;
}

/* ----------------------------------------
 * Функция запроса
 * ---------------------------------------- */
export async function getUnansweredFeedbackCount(
  apiKey: string
): Promise<GetUnansweredFeedbackCountResponse> {
  const response = await axios.get(
    'https://feedbacks-api.wildberries.ru/api/v1/feedbacks/count-unanswered',
    {
      headers: {
        Authorization: apiKey
      }
    }
  );

  return response.data;
}
