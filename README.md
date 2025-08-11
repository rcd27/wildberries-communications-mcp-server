<img src="https://badge.mcpx.dev?type=server" title="MCP Server"/>

# WB Communications MCP Server

MCP сервер для работы с API Wilberries Communications.
- Описаны все ручки из OpenAPI спецификации, выставлены как `Tool` (src/tools/api)

## Установка

```bash
npm install
```

## Настройка

1. Создайте файл `.env` в корневой директории проекта(по примеру `.env.example`)
2. Добавьте следующие переменные окружения:
   ```
   WB_COMMUNICATIONS_OAUTH_TOKEN=your_oauth_token_here
   ```

## Запуск

### Разработка
```bash
npm run dev
```

### Продакшн
```bash
npm run build
npm start
```

### Дебаг
```bash
npx @modelcontextprotocol/inspector node ./build/index.js
```

## Использование

Сервер предоставляет следующие инструменты:

[getFeedbackById.ts](src/tools/api/getFeedbackById.ts) - данные отзыва по его ID
[getFeedbacks.ts](src/tools/api/getFeedbacks.ts) - получить список отзывов по фильтрам (например, только с ответами, сортировка по дате, пропуск и лимит)
[getFeedbacksArchive.ts](src/tools/api/getFeedbacksArchive.ts) - возвращает список архивных отзывов
[getFeedbacksCount.ts](src/tools/api/getFeedbacksCount.ts) - количество обработанных или необработанных отзывов за заданный период
[getNewFeedbacks.ts](src/tools/api/getNewFeedbacks.ts) - наличие непросмотренных вопросов и отзывов от покупателей
[getQuestionById.ts](src/tools/api/getQuestionById.ts) - данные вопроса по его ID
[getQuestions.ts](src/tools/api/getQuestions.ts) - список вопросов по заданным фильтрам
[getQuestionsCount.ts](src/tools/api/getQuestionsCount.ts) - количество обработанных или необработанных вопросов за заданный период
[getSupplierValuations.ts](src/tools/api/getSupplierValuations.ts) - списки причин жалоб на отзыв и проблем с товаром
[getUnansweredFeedbackCount.ts](src/tools/api/getUnansweredFeedbackCount.ts) - количество необработанных отзывов за сегодня и за всё время
[getUnsansweredQuestionsCount.ts](src/tools/api/getUnsansweredQuestionsCount.ts) - общее количество неотвеченных вопросов
[patchQuestion.ts](src/tools/api/patchQuestion.ts) - отметить вопрос как просмотренный / ответить на вопрос или 
редеактировать ответ
[postFeedbackAnswer.ts](src/tools/api/postFeedbackAnswer.ts) - ответить на отзыв покупателя

#### Конфиг для Goose

Добавьте в конфиг Гуся(`~/.config/goose/config.yaml`):
```yaml
  wildberries-communications-mcp:
    args:
    - /path/to/wildberries-communications-mcp-server/build/index.js
    bundled: null
    cmd: node
    description: null
    enabled: true
    env_keys: []
    envs: {}
    name: wildberries-finances-mcp
    timeout: 300
    type: stdio
```

#### Конфиг для Cline:

```
    "wildberries-communications-mcp": {
      "autoApprove": [],
      "disabled": false,
      "timeout": 300,
      "command": "node",
      "args": [
        "/path/to/wildberries-communications-mcp-server/build/index.js"
      ],
      "type": "stdio"
    }
```
