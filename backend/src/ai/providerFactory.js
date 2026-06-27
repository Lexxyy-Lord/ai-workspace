import { env } from '../config/env.js';
import { OpenAiCompatibleProvider } from './providers/openAiCompatibleProvider.js';
import { AppError } from '../utils/appError.js';

export const createProvider = (settings = {}) => {
  const provider = settings.provider || env.DEFAULT_AI_PROVIDER;

  if (provider === 'freemodel' || provider === 'openai-compatible' || provider === 'openrouter') {
    return new OpenAiCompatibleProvider({
      apiKey: settings.apiKey || env.FREEMODEL_API_KEY,
      baseUrl: settings.baseUrl || env.FREEMODEL_BASE_URL,
      fallbackBaseUrls: settings.fallbackBaseUrls || env.FREEMODEL_FALLBACK_BASE_URLS,
      chatPath: settings.chatPath || env.FREEMODEL_CHAT_PATH,
      modelsPath: settings.modelsPath || env.FREEMODEL_MODELS_PATH,
      authHeader: settings.authHeader || env.FREEMODEL_AUTH_HEADER,
      authPrefix: settings.authPrefix ?? env.FREEMODEL_AUTH_PREFIX,
      extraHeaders: settings.extraHeaders || env.FREEMODEL_EXTRA_HEADERS,
      timeoutMs: settings.timeoutMs || env.PROVIDER_TIMEOUT_MS,
    });
  }

  throw new AppError('Unknown or unavailable provider.', 400, 'UNKNOWN_PROVIDER');
};
