#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import dotenv from 'dotenv';
import {
  getFeedbackById,
  GetFeedbackByIdRequestSchema,
  GetFeedbackByIdResponseSchema
} from './tools/api/getFeedbackById.js';
import { getNewFeedbacksQuestions, GetNewFeedbacksQuestionsResponseSchema } from './tools/api/getNewFeedbacks.js';
import {
  getQuestionById,
  GetQuestionByIdRequestSchema,
  GetQuestionByIdResponseSchema
} from './tools/api/getQuestionById.js';
import { getQuestions, GetQuestionsQuerySchema, GetQuestionsResponseSchema } from './tools/api/getQuestions.js';
import {
  getQuestionsCount,
  GetQuestionsCountQuerySchema,
  GetQuestionsCountResponseSchema
} from './tools/api/getQuestionsCount.js';
import {
  getUnansweredFeedbackCount,
  GetUnansweredFeedbackCountResponseSchema
} from './tools/api/getUnansweredFeedbackCount.js';
import {
  getUnansweredQuestionsCount,
  GetUnansweredQuestionsCountResponseSchema
} from './tools/api/getUnsansweredQuestionsCount.js';
import {
  patchQuestion,
  PatchQuestionAnswerSchema,
  PatchQuestionMarkViewedSchema,
  PatchQuestionResponseSchema
} from './tools/api/patchQuestion.js';

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

type MCPResponse = {content: any[], isError: boolean}

async function withApiKey(block: (apiKey: string) => Promise<any>): Promise<MCPResponse> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return {
      content: [
        {
          type: 'text', text: 'API key is required. Please set WB_COMMUNICATIONS_OAUTH_TOKEN environment' +
                              ' variable or provide --apiKey argument.'
        }
      ],
      isError: true
    };
  } else {
    return block(apiKey);
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
    inputSchema: GetFeedbackByIdRequestSchema.shape,
    outputSchema: GetFeedbackByIdResponseSchema.shape
  },
  async ({ ...args }) => {
    return withApiKey(async (apiKey: string) => {
      return getFeedbackById(args, apiKey);
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
    inputSchema: {},
    outputSchema: GetNewFeedbacksQuestionsResponseSchema.shape
  },
  async () => {
    return withApiKey(async (apiKey: string) => {
      return getNewFeedbacksQuestions(apiKey);
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
      return await getQuestionById(args, apiKey);
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
    inputSchema: GetQuestionsQuerySchema.shape,
    outputSchema: GetQuestionsResponseSchema.shape
  },
  async ({ ...args }) => {
    return withApiKey(async (apiKey: string) => {
      return getQuestions(args, apiKey);
    });
  }
);

server.registerTool(
  'getQuestionsCount',
  {
    description: 'Метод предоставляет количество обработанных или необработанных вопросов за заданный период. ' +
                 'Максимум 1 запрос в секунду для всех методов категории "Вопросы и отзывы" на один аккаунт продавца. ' +
                 'При превышении лимита в 3 запроса в секунду отправка запросов будет заблокирована на 60 секунд.',
    inputSchema: GetQuestionsCountQuerySchema.shape,
    outputSchema: GetQuestionsCountResponseSchema.shape
  },
  async ({ ...args }) => {
    return withApiKey(async (apiKey: string) => {
      return getQuestionsCount(args, apiKey);
    });
  }
);

server.registerTool(
  'getUnansweredFeedbackCount',
  {
    description: 'Метод предоставляет количество необработанных отзывов за сегодня и за всё время, а также среднюю оценку всех отзывов. ' +
                 'Максимум 1 запрос в секунду для всех методов категории "Вопросы и отзывы" на один аккаунт продавца.',
    inputSchema: {},
    outputSchema: GetUnansweredFeedbackCountResponseSchema.shape
  },
  async () => {
    return withApiKey(async (apiKey: string) => {
      return getUnansweredFeedbackCount(apiKey);
    });
  }
);

server.registerTool(
  'getUnansweredQuestionsCount',
  {
    description: 'Метод предоставляет общее количество неотвеченных вопросов и количество неотвеченных вопросов за сегодня. ' +
                 'Максимум 1 запрос в секунду для всех методов категории "Вопросы и отзывы" на один аккаунт продавца.',
    inputSchema: {},
    outputSchema: GetUnansweredQuestionsCountResponseSchema.shape
  },
  async () => {
    return withApiKey(async (apiKey: string) => {
      return getUnansweredQuestionsCount(apiKey);
    });
  }
);

server.registerTool(
  'patchQuestionMarkViewed',
  {
    description: 'Метод позволяет отметить вопрос как просмотренный. ' +
                 'Максимум 1 запрос в секунду для всех методов категории "Вопросы и отзывы".',
    inputSchema: PatchQuestionMarkViewedSchema.shape,
    outputSchema: PatchQuestionResponseSchema.shape
  },
  async ({ ...args }) => {
    return withApiKey(async (apiKey: string) => {
      return patchQuestion(args, apiKey);
    });
  }
);

server.registerTool(
  'patchQuestionAnswer',
  {
    description: 'Метод позволяет ответить на вопрос или отредактировать ответ. ' +
                 'Отредактировать ответ на вопрос можно 1 раз в течение 60 дней после отправки ответа. ' +
                 'Максимум 1 запрос в секунду для всех методов категории "Вопросы и отзывы".',
    inputSchema: PatchQuestionAnswerSchema.shape,
    outputSchema: PatchQuestionResponseSchema.shape
  },
  async ({ ...args }) => {
    return withApiKey(async (apiKey: string) => {
      return patchQuestion(args, apiKey);
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
