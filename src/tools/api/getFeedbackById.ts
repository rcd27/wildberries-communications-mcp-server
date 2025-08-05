import axios from 'axios';
import { z } from 'zod';

export const GetFeedbackByIdRequestSchema = z.object({
  id: z
    .string()
    .describe('ID отзыва')
});

export type GetFeedbackByIdRequest = z.infer<typeof GetFeedbackByIdRequestSchema>;

export interface FeedbackAnswer {
  text: string;
  state: 'none' | 'wbRu' | 'reviewRequired' | 'rejected';
  editable: boolean;
}

export interface FeedbackProductDetails {
  nmId: number;
  imtId: number;
  productName: string;
  supplierArticle: string | null;
  supplierName: string | null;
  brandName: string | null;
  size: string;
}

export interface FeedbackPhotoLink {
  fullSize: string;
  miniSize: string;
}

export interface FeedbackVideo {
  previewImage: string;
  link: string;
  duration_sec: number;
}

export interface Feedback {
  id: number;
  userName: string;
  pros: string;
  cons: string;
  matchingSize: string;
  text: string;
  productValuation: number;
  createdDate: string;
  answer: FeedbackAnswer | null;
  state: 'none' | 'wbRu';
  productDetails: FeedbackProductDetails;
  photoLinks: FeedbackPhotoLink[] | null;
  video: FeedbackVideo | null;
  wasViewed: boolean;
  isAbleSupplierFeedbackValuation: boolean;
  supplierFeedbackValuation: number;
  isAbleSupplierProductValuation: boolean;
  supplierProductValuation: number;
  isAbleReturnProductOrders: boolean;
  returnProductOrdersDate: string;
  bables: string[] | null;
  lastOrderShkId: number;
  lastOrderCreatedAt: string;
  color: string;
  subjectId: number;
  subjectName: string;
  parentFeedbackId: string | null;
  childFeedbackId: string | null;
}

export interface GetFeedbackByIdResponse {
  data: Feedback;
  error: boolean;
  errorText: string;
  additionalErrors: string[] | null;
}

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

  return response.data;
}
