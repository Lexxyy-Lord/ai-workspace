import { env } from '../config/env.js';
import { freeemodelClient } from '../providers/freeemodelClient.js';
import { AppError } from '../utils/errors.js';

const normalizeMessages = ({ message, messages = [], system }) => {
  const normalized = [];
  const systemPrompt = system ?? env.AI_SYSTEM_PROMPT;

  if (systemPrompt) {
    normalized.push({ role: 'system', content: systemPrompt });
  }

  for (const item of messages) {
    if (!item?.role || typeof item.content !== 'string') {
      continue;
    }

    normalized.push({
      role: item.role,
      content: item.content,
    });
  }

  if (message) {
    normalized.push({ role: 'user', content: message });
  }

  if (normalized.filter((item) => item.role !== 'system').length === 0) {
    throw new AppError('Isi message atau messages wajib dikirim.', 400);
  }

  return normalized;
};

const extractAssistantMessage = (completion) => {
  if (completion?.choices?.[0]?.message?.content) {
    return completion.choices[0].message.content;
  }

  if (completion?.choices?.[0]?.text) {
    return completion.choices[0].text;
  }

  if (completion?.message) {
    return completion.message;
  }

  if (completion?.content) {
    return completion.content;
  }

  return '';
};

export const createChatCompletion = async (input) => {
  const messages = normalizeMessages(input);

  const payload = {
    model: input.model ?? env.FREEEMODEL_MODEL,
    messages,
    temperature: input.temperature ?? env.AI_DEFAULT_TEMPERATURE,
    max_tokens: input.maxTokens ?? env.AI_DEFAULT_MAX_TOKENS,
    stream: false,
  };

  const completion = await freeemodelClient.createChatCompletion(payload);

  return {
    provider: 'freeemodel.dev',
    model: payload.model,
    message: extractAssistantMessage(completion),
    raw: completion,
  };
};

export const listModels = async () => {
  const response = await freeemodelClient.listModels();

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.models)) {
    return response.models;
  }

  if (Array.isArray(response)) {
    return response;
  }

  return response;
};

export { normalizeMessages };
