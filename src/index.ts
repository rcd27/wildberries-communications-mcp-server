#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import dotenv from 'dotenv';
import { z } from 'zod';
import { getFeedbackById, GetFeedbackByIdRequestSchema } from './tools/api/getFeedbackById.js';
import { getFeedbacks, GetFeedbacksQuerySchema } from './tools/api/getFeedbacks.js';
import {
  getArchivedFeedbacks,
  GetArchivedFeedbacksQuery,
  GetArchivedFeedbacksQuerySchema
} from './tools/api/getFeedbacksArchive.js';
import { getFeedbacksCount, GetFeedbacksCountQuerySchema } from './tools/api/getFeedbacksCount.js';
import { getNewFeedbacksQuestions } from './tools/api/getNewFeedbacks.js';
import {
  getQuestionById,
  GetQuestionByIdRequestSchema,
  GetQuestionByIdResponseSchema
} from './tools/api/getQuestionById.js';
import { getQuestions, GetQuestionsQuerySchema } from './tools/api/getQuestions.js';
import { getQuestionsCount, GetQuestionsCountQuerySchema } from './tools/api/getQuestionsCount.js';
import { getSupplierValuations } from './tools/api/getSupplierValuations.js';
import { getUnansweredFeedbackCount } from './tools/api/getUnansweredFeedbackCount.js';
import { getUnansweredQuestionsCount } from './tools/api/getUnsansweredQuestionsCount.js';
import { patchQuestion, PatchQuestionAnswerSchema, PatchQuestionMarkViewedSchema } from './tools/api/patchQuestion.js';
import { postFeedbackAnswer, PostFeedbackAnswerRequestSchema } from './tools/api/postFeedbackAnswer.js';

dotenv.config();

// Функция для получения apiKey из переменных окружения или аргументов командной строки
function getApiKey() {
  if (process.env.WB_COMMUNICATIONS_OAUTH_TOKEN) {
    return process.env.WB_COMMUNICATIONS_OAUTH_TOKEN;
  }
  const argApiKey = process.argv.find(arg => arg.startsWith('--apiKey='));
  if (argApiKey) {
    return argApiKey.split('=')[1];
  }
  return undefined;
}

type MCPResponse = {content: any, isError: boolean}

async function withApiKey(block: (apiKey: string) => Promise<MCPResponse>): Promise<MCPResponse> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return {
      content: [
        {
          type: 'text',
          content: 'API key is required. Please set WB_COMMUNICATIONS_OAUTH_TOKEN environment ' +
                   'variable or provide --apiKey argument.'
        }
      ],
      isError: true
    };
  } else {
    return await block(apiKey);
  }
}

const server = new McpServer(
  {
    name: 'wb-communications-mcp',
    version: '0.0.1'
  },
  {
    capabilities: { logging: {} }
  }
);

server.registerTool(
  'getFeedbackById',
  {
    description: 'Метод предоставляет данные отзыва по его ID. ' +
                 'Максимум 1 запрос в секунду для всех методов категории "Вопросы и отзывы" на один аккаунт продавца. ' +
                 'При превышении лимита в 3 запроса в секунду отправка запросов будет заблокирована на 60 секунд.',
    inputSchema: GetFeedbackByIdRequestSchema.shape
  },
  async (args, _): Promise<MCPResponse> => {
    return withApiKey(async (apiKey: string): Promise<MCPResponse> => {
      const feedback = await getFeedbackById(args, apiKey);
      return {
        content: [
          {
            type: 'text',
            content: JSON.stringify(feedback, null, 2)
          }
        ],
        isError: feedback.error
      };
    });
  }
);

server.registerTool(
  'getNewFeedbacksQuestions',
  {
    description: 'Метод проверяет наличие непросмотренных вопросов и отзывов от покупателей. ' +
                 'Если у продавца есть непросмотренные вопросы или отзывы, возвращает true. ' +
                 'Максимум 1 запрос в секунду для всех методов категории "Вопросы и отзывы" на один аккаунт продавца. ' +
                 'При превышении лимита в 3 запроса в секунду отправка запросов будет заблокирована на 60 секунд.',
    inputSchema: {}
  },
  async (_, __): Promise<MCPResponse> => {
    return withApiKey(async (apiKey: string): Promise<MCPResponse> => {
      const result = await getNewFeedbacksQuestions(apiKey);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result)
          }
        ],
        isError: result.error
      };
    });
  }
);

server.registerTool(
  'getQuestions',
  {
    description: 'Метод предоставляет список вопросов по заданным фильтрам. ' +
                 'Позволяет получить данные отвеченных и неотвеченных вопросов, сортировать вопросы по дате, ' +
                 'настроить пагинацию и количество вопросов в ответе. Максимально можно получить 10 000 вопросов в одном ответе. ' +
                 'Максимум 1 запрос в секунду для всех методов категории "Вопросы и отзывы" на один аккаунт продавца.',
    inputSchema: GetQuestionsQuerySchema.shape
  },
  async (args, _): Promise<MCPResponse> => {
    return withApiKey(async (apiKey: string): Promise<MCPResponse> => {
      const result = await getQuestions(args, apiKey);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result)
          }
        ],
        isError: result.error
      };
    });
  }
);

server.registerTool(
  'getQuestionsCount',
  {
    description: 'Метод предоставляет количество обработанных или необработанных вопросов за заданный период. ' +
                 'Максимум 1 запрос в секунду для всех методов категории "Вопросы и отзывы" на один аккаунт продавца. ' +
                 'При превышении лимита в 3 запроса в секунду отправка запросов будет заблокирована на 60 секунд.',
    inputSchema: GetQuestionsCountQuerySchema.shape
  },
  async (args, _): Promise<MCPResponse> => {
    return withApiKey(async (apiKey: string): Promise<MCPResponse> => {
      const result = await getQuestionsCount(args, apiKey);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result)
          }
        ],
        isError: result.error
      };
    });
  }
);

server.registerTool(
  'getUnansweredFeedbackCount',
  {
    description: 'Метод предоставляет количество необработанных отзывов за сегодня и за всё время, а также среднюю оценку всех отзывов. ' +
                 'Максимум 1 запрос в секунду для всех методов категории "Вопросы и отзывы" на один аккаунт продавца.',
    inputSchema: {}
  },
  async (_, __): Promise<MCPResponse> => {
    return withApiKey(async (apiKey: string): Promise<MCPResponse> => {
      const result = await getUnansweredFeedbackCount(apiKey);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result)
          }
        ],
        isError: result.error
      };
    });
  }
);

server.registerTool(
  'getUnansweredQuestionsCount',
  {
    description: 'Метод предоставляет общее количество неотвеченных вопросов и количество неотвеченных вопросов за сегодня. ' +
                 'Максимум 1 запрос в секунду для всех методов категории "Вопросы и отзывы" на один аккаунт продавца.',
    inputSchema: {}
  },
  async (_, __): Promise<MCPResponse> => {
    return withApiKey(async (apiKey: string): Promise<MCPResponse> => {
      const result = await getUnansweredQuestionsCount(apiKey);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result)
          }
        ],
        isError: result.error
      };
    });
  }
);

server.registerTool(
  'patchQuestionMarkViewed',
  {
    description: 'Метод позволяет отметить вопрос как просмотренный. ' +
                 'Максимум 1 запрос в секунду для всех методов категории "Вопросы и отзывы".',
    inputSchema: PatchQuestionMarkViewedSchema.shape
  },
  async (args, _): Promise<MCPResponse> => {
    return withApiKey(async (apiKey: string): Promise<MCPResponse> => {
      const result = await patchQuestion(args, apiKey);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result)
          }
        ],
        isError: result.error
      };
    });
  }
);

server.registerTool(
  'patchQuestionAnswer',
  {
    description: 'Метод позволяет ответить на вопрос или отредактировать ответ. ' +
                 'Отредактировать ответ на вопрос можно 1 раз в течение 60 дней после отправки ответа. ' +
                 'Максимум 1 запрос в секунду для всех методов категории "Вопросы и отзывы".',
    inputSchema: PatchQuestionAnswerSchema.shape
  },
  async (args, _): Promise<MCPResponse> => {
    return withApiKey(async (apiKey: string): Promise<MCPResponse> => {
      const result = await patchQuestion(args, apiKey);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result)
          }
        ],
        isError: result.error
      };
    });
  }
);

server.registerTool(
  'getQuestionById',
  {
    description: 'Метод предоставляет данные вопроса по его ID. ' +
                 'Далее вы можете работать с этим вопросом через другие методы API. ' +
                 'Максимум 1 запрос в секунду для всех методов категории "Вопросы и отзывы" на один аккаунт продавца. ' +
                 'При превышении лимита в 3 запроса в секунду отправка запросов будет заблокирована на 60 секунд.',
    inputSchema: GetQuestionByIdRequestSchema.shape,
    outputSchema: GetQuestionByIdResponseSchema.shape
  },
  async ({ ...args }) => {
    return withApiKey(async (apiKey: string) => {
      const result = await getQuestionById(args, apiKey);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result)
          }
        ],
        isError: result.error
      };
    });
  }
);

server.registerTool(
  'getFeedbacksCount',
  {
    description: 'Метод предоставляет количество обработанных или необработанных отзывов за заданный период. ' +
                 'Максимум 1 запрос в секунду для всех методов категории "Вопросы и отзывы" на один аккаунт продавца. ' +
                 'При превышении лимита в 3 запроса в секунду отправка запросов будет заблокирована на 60 секунд.',
    inputSchema: GetFeedbacksCountQuerySchema.shape
  },
  async (args, _): Promise<MCPResponse> => {
    return withApiKey(async (apiKey: string): Promise<MCPResponse> => {
      const result = await getFeedbacksCount(args, apiKey);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result)
          }
        ],
        isError: result.error
      };
    });
  }
);

server.registerTool(
  'postFeedbackAnswer',
  {
    description: 'Позволяет продавцу ответить на отзыв покупателя. ' +
                 'ID отзыва не валидируется — ошибка не вернётся при его некорректности.',
    inputSchema: PostFeedbackAnswerRequestSchema.shape
  },
  async (args, _): Promise<MCPResponse> => {
    return withApiKey(async (apiKey: string): Promise<MCPResponse> => {
      const result = await postFeedbackAnswer(apiKey, args);
      return {
        content: [
          {
            type: 'text',
            text: 'Ответ отправлен'
          }
        ],
        isError: false
      };
    });
  }
);

server.registerTool(
  'getFeedbacks',
  {
    description:
      'Метод позволяет получить список отзывов по фильтрам (например, только с ответами, сортировка по дате, пропуск и лимит). ' +
      'Максимум 1 запрос в секунду для всех методов категории "Вопросы и отзывы" на один аккаунт продавца. ' +
      'При превышении лимита в 3 запроса в секунду отправка запросов будет заблокирована на 60 секунд.',
    inputSchema: GetFeedbacksQuerySchema.shape
  },
  async (args, _): Promise<MCPResponse> => {
    return withApiKey(async (apiKey: string): Promise<MCPResponse> => {
      const res = await getFeedbacks(args, apiKey);
      return {
        content: [
          {
            type: 'text',
            content: JSON.stringify(res)
          }
        ],
        isError: res.error
      };
    });
  }
);

server.registerTool(
  'getArchivedFeedbacks',
  {
    description:
      'Метод возвращает список архивных отзывов. Отзыв считается архивным если: ' +
      '— на отзыв получен ответ; ' +
      '— на отзыв не получен ответ в течение 30 дней; ' +
      '— в отзыве нет текста и фото. ' +
      'Максимум 1 запрос в секунду для всех методов категории "Вопросы и отзывы" на один аккаунт продавца. ' +
      'При превышении лимита в 3 запроса в секунду отправка запросов будет заблокирована на 60 секунд.',
    inputSchema: GetArchivedFeedbacksQuerySchema.shape
  },
  async (args, _): Promise<MCPResponse> => {
    return withApiKey(async (apiKey: string): Promise<MCPResponse> => {
      const res = await getArchivedFeedbacks(args as GetArchivedFeedbacksQuery, apiKey);
      return {
        content: [
          {
            type: 'text',
            content: JSON.stringify(res)
          }
        ],
        isError: res.error
      };
    });
  }
);

server.registerTool(
  'getSupplierValuations',
  {
    description:
      'Получить списки причин жалоб на отзыв и проблем с товаром. ' +
      'Максимум 1 запрос в секунду на аккаунт. ' +
      'Если превысить лимит 3 запроса в секунду, блокировка на 60 секунд.',
    inputSchema: z
      .object({
        locale: z.string().optional().describe('Выбор языка значений (ru, en, zh)')
      })
      .describe('Параметры запроса')
      .shape
  },
  async (args, _): Promise<MCPResponse> => {
    return withApiKey(async (apiKey: string): Promise<MCPResponse> => {
      const res = await getSupplierValuations(args.locale, apiKey);
      return {
        content: [
          {
            type: 'text',
            content: JSON.stringify(res)
          }
        ],
        isError: res.error
      };
    });
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.info('WB Communications MCP Server Running');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
