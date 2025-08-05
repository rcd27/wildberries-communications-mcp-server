#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// Поддержка загрузки .env файла для переменных окружения
import dotenv from 'dotenv';
import { getClaims, GetClaimsRequestSchema } from './tools/api/getClaims.js';
import { getFeedbackById, GetFeedbackByIdRequestSchema } from './tools/api/getFeedbackById.js';

dotenv.config();

// Функция для получения apiKey из переменных окружения или аргументов командной строки
function getApiKey() {
  if (process.env.WB_FINANCES_OAUTH_TOKEN) {
    return process.env.WB_FINANCES_OAUTH_TOKEN;
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

/* ----------------------------------------
 * Регистрация server.registerTool
 * ---------------------------------------- */
server.registerTool(
  'getFeedbackById',
  {
    description: 'Метод предоставляет данные отзыва по его ID',
    inputSchema: GetFeedbackByIdRequestSchema.shape
  },
  async (args, _): Promise<MCPResponse> => {
    return withApiKey(async (apiKey: string): Promise<MCPResponse> => {
      const feedback = await getFeedbackById(args, apiKey);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(feedback, null, 2)
          }
        ],
        isError: false
      };
    });
  }
);

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

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('WB Communications MCP Server Running');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
