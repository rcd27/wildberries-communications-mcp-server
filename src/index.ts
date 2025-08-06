#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import dotenv from 'dotenv';
import { getFeedbackById, GetFeedbackByIdRequestSchema, GetFeedbackByIdResponse } from './tools/api/getFeedbackById.js';
import { getNewFeedbacksQuestions, GetNewFeedbacksQuestionsRequestSchema } from './tools/api/getNewFeedbacks.js';
import { getQuestionById, GetQuestionByIdRequestSchema } from './tools/api/getQuestionById.js';
import { getQuestions, GetQuestionsQuerySchema } from './tools/api/getQuestions.js';
import { getQuestionsCount, GetQuestionsCountQuerySchema } from './tools/api/getQuestionsCount.js';
import { getUnansweredFeedbackCount } from './tools/api/getUnansweredFeedbackCount.js';
import { getUnansweredQuestionsCount } from './tools/api/getUnsansweredQuestionsCount.js';
import { patchQuestion, PatchQuestionAnswerSchema, PatchQuestionMarkViewedSchema } from './tools/api/patchQuestion.js';

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

async function withApiKey(block: (apiKey: string) => Promise<MCPResponse>): Promise<MCPResponse> {
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
    description: 'Метод предоставляет данные отзыва по его ID',
    inputSchema: GetFeedbackByIdRequestSchema.shape
  },
  async (args, _): Promise<MCPResponse> => {
    return withApiKey(async (apiKey: string): Promise<MCPResponse> => {
      const feedback: GetFeedbackByIdResponse = await getFeedbackById(args, apiKey);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(feedback, null, 2)
          }
        ],
        isError: feedback.error
      };
    });
  }
);

/* FIXME: требует другого API ключа
 server.registerTool(
 'getClaims',
 {
 description: 'Метод предоставляет заявки покупателей на возврат товаров за последние 14 дней',
 inputSchema: GetClaimsRequestSchema.shape
 },
 async (args, _): Promise<MCPResponse> => {
 return withApiKey(async (apiKey: string): Promise<MCPResponse> => {
 const result = await getClaims(args, apiKey);
 return {
 content: [
 {
 type: 'text',
 text: JSON.stringify(result)
 }
 ],
 isError: false
 };
 });
 }
 );
 */

server.registerTool(
  'getNewFeedbacksQuestions',
  {
    description: 'Метод проверяет наличие непросмотренных вопросов и отзывов от покупателей. ' +
                 'Если у продавца есть непросмотренные вопросы или отзывы, возвращает true. ' +
                 'Максимум 1 запрос в секунду для всех методов категории Вопросы и отзывы на один аккаунт продавца.' +
                 'Если превысить лимит в 3 запроса в секунду, отправка запросов будет заблокирована на 60 секунд',
    // FIXME: попробовать убрать, потому что выглядит, как ненужное тело запроса
    inputSchema: GetNewFeedbacksQuestionsRequestSchema.shape
  },
  async (args, _): Promise<MCPResponse> => {
    return withApiKey(async (apiKey: string): Promise<MCPResponse> => {
      const result = await getNewFeedbacksQuestions(args, apiKey);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
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
    description:
      'Метод предоставляет количество необработанных отзывов (всего и за сегодня) и среднюю оценку всех отзывов',
    inputSchema: {}
  },
  async (_args, _): Promise<MCPResponse> => {
    return withApiKey(async (apiKey: string): Promise<MCPResponse> => {
      const stats = await getUnansweredFeedbackCount(apiKey);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(stats, null, 2)
          }
        ],
        isError: stats.error
      };
    });
  }
);

server.registerTool(
  'getUnansweredQuestionsCount',
  {
    description:
      'Метод предоставляет количество неотвеченных вопросов (всего и за сегодня).',
    inputSchema: {}
  },
  async (_args, _): Promise<MCPResponse> => {
    return withApiKey(async (apiKey: string): Promise<MCPResponse> => {
      const stats = await getUnansweredQuestionsCount(apiKey);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(stats, null, 2)
          }
        ],
        isError: stats.error
      };
    });
  }
);

server.registerTool(
  'getQuestionsCount',
  {
    description:
      'Метод предоставляет количество обработанных или необработанных вопросов за заданный период.',
    inputSchema: GetQuestionsCountQuerySchema.shape
  },
  async (args, _ctx): Promise<MCPResponse> => {
    return withApiKey(async (apiKey: string): Promise<MCPResponse> => {
      const result = await getQuestionsCount(args, apiKey);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
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
    description:
      'Получает список вопросов покупателей с возможностью фильтрации, сортировки и пагинации.',
    inputSchema: GetQuestionsQuerySchema.shape
  },
  async (args, _ctx): Promise<MCPResponse> => {
    return withApiKey(async (apiKey: string): Promise<MCPResponse> => {
      const result = await getQuestions(args, apiKey);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ],
        isError: result.error
      };
    });
  }
);

server.registerTool(
  'markQuestionAsViewed',
  {
    description: 'Позволяет отметить вопрос как просмотренный.' +
                 '<instruction>Спрашивать пользователя перед действием</instruction>',
    inputSchema: PatchQuestionMarkViewedSchema.shape
  },
  async (args, _ctx): Promise<MCPResponse> => {
    return withApiKey(async (apiKey: string): Promise<MCPResponse> => {
      const result = await patchQuestion(args, apiKey);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ],
        isError: result.error
      };
    });
  }
);

server.registerTool(
  'answerQuestion',
  {
    description: 'Позволяет отклонить его или ответить на вопрос. В зависимости от параметров запроса.' +
                 '<instruction>Спрашивать пользователя перед действием</instruction>',
    inputSchema: PatchQuestionAnswerSchema.shape
  },
  async (args, _ctx): Promise<MCPResponse> => {
    return withApiKey(async (apiKey: string): Promise<MCPResponse> => {
      const result = await patchQuestion(args, apiKey);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
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
    description: 'Получить вопрос покупателя по его ID',
    inputSchema: GetQuestionByIdRequestSchema.shape
  },
  async (args, _ctx): Promise<MCPResponse> => {
    return withApiKey(async (apiKey: string): Promise<MCPResponse> => {
      const result = await getQuestionById(args, apiKey);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ],
        isError: result.error
      };
    });
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('WB Communications MCP Server Running');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
