import { nanoid } from 'nanoid';
import { env } from '../config/env.js';
import { database } from '../database/connection.js';
import { createProvider } from '../ai/providerFactory.js';
import { AppError } from '../utils/appError.js';

const extractAssistantMessage = (completion) => {
  if (completion?.choices?.[0]?.message?.content) return completion.choices[0].message.content;
  if (completion?.choices?.[0]?.text) return completion.choices[0].text;
  if (completion?.message) return completion.message;
  if (completion?.content) return completion.content;
  return '';
};

const normalizeMessages = ({ message, messages = [], systemPrompt }) => {
  const finalMessages = [];
  const system = systemPrompt ?? env.DEFAULT_SYSTEM_PROMPT;

  if (system) finalMessages.push({ role: 'system', content: system });

  for (const item of messages) {
    if (item?.role && typeof item.content === 'string') {
      finalMessages.push({ role: item.role, content: item.content });
    }
  }

  if (message) finalMessages.push({ role: 'user', content: message });

  if (finalMessages.filter((item) => item.role !== 'system').length === 0) {
    throw new AppError('Message wajib diisi.', 400, 'EMPTY_CHAT');
  }

  return finalMessages;
};

export const createChatCompletion = async ({ userId, workspaceId, body }) => {
  const messages = normalizeMessages(body);
  const provider = createProvider({ provider: body.provider });
  const model = body.model || env.DEFAULT_AI_MODEL;

  const payload = {
    model,
    messages,
    temperature: body.temperature ?? env.DEFAULT_AI_TEMPERATURE,
    top_p: body.topP ?? env.DEFAULT_AI_TOP_P,
    max_tokens: body.maxTokens ?? env.DEFAULT_AI_MAX_TOKENS,
    stream: false,
  };

  const completion = await provider.chat(payload);
  const assistantMessage = extractAssistantMessage(completion);
  const savedMessages = [...messages, { role: 'assistant', content: assistantMessage }];
  const chatId = nanoid();

  database
    .prepare(
      `INSERT INTO chat_history (id, user_id, workspace_id, title, provider, model, messages_json)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      chatId,
      userId,
      workspaceId || null,
      body.title || messages.find((item) => item.role === 'user')?.content?.slice(0, 80) || 'New Chat',
      body.provider || env.DEFAULT_AI_PROVIDER,
      model,
      JSON.stringify(savedMessages),
    );

  return {
    id: chatId,
    provider: body.provider || env.DEFAULT_AI_PROVIDER,
    model,
    message: assistantMessage,
    raw: completion,
  };
};

export const listChatHistory = ({ userId, workspaceId }) => {
  const query = workspaceId
    ? `SELECT id, title, provider, model, created_at, updated_at FROM chat_history WHERE user_id = ? AND workspace_id = ? ORDER BY updated_at DESC LIMIT 100`
    : `SELECT id, title, provider, model, created_at, updated_at FROM chat_history WHERE user_id = ? ORDER BY updated_at DESC LIMIT 100`;

  return workspaceId
    ? database.prepare(query).all(userId, workspaceId)
    : database.prepare(query).all(userId);
};

export const getChatHistory = ({ userId, chatId }) => {
  const row = database.prepare('SELECT * FROM chat_history WHERE id = ? AND user_id = ?').get(chatId, userId);

  if (!row) {
    throw new AppError('Chat history tidak ditemukan.', 404, 'CHAT_NOT_FOUND');
  }

  return {
    ...row,
    messages: JSON.parse(row.messages_json),
    messages_json: undefined,
  };
};

export const listModels = async () => {
  const provider = createProvider();
  const response = await provider.listModels();

  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.models)) return response.models;
  if (Array.isArray(response)) return response;
  return response;
};

export { normalizeMessages };
