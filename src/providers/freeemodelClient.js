import { env } from '../config/env.js';
import { ProviderError } from '../utils/errors.js';

const joinUrl = (baseUrl, path) => {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
};

const parseResponseBody = async (response) => {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
};

export class FreeemodelClient {
  constructor(config = env) {
    this.config = config;
  }

  buildHeaders() {
    if (!this.config.FREEEMODEL_API_KEY) {
      throw new ProviderError(
        'FREEEMODEL_API_KEY belum diatur. Salin .env.example menjadi .env lalu isi API key Anda.',
        500,
      );
    }

    const authValue = this.config.FREEEMODEL_AUTH_PREFIX
      ? `${this.config.FREEEMODEL_AUTH_PREFIX} ${this.config.FREEEMODEL_API_KEY}`.trim()
      : this.config.FREEEMODEL_API_KEY;

    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      [this.config.FREEEMODEL_AUTH_HEADER]: authValue,
      ...this.config.FREEEMODEL_EXTRA_HEADERS,
    };
  }

  async request(path, options = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.FREEEMODEL_TIMEOUT_MS);
    const url = joinUrl(this.config.FREEEMODEL_BASE_URL, path);

    try {
      const response = await fetch(url, {
        method: options.method ?? 'GET',
        headers: this.buildHeaders(),
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });

      const body = await parseResponseBody(response);

      if (!response.ok) {
        throw new ProviderError(
          body?.error?.message || body?.message || `Provider returned HTTP ${response.status}`,
          response.status >= 500 ? 502 : response.status,
          body,
        );
      }

      return body;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new ProviderError('Request ke freeemodel.dev timeout.', 504);
      }

      if (error instanceof ProviderError) {
        throw error;
      }

      throw new ProviderError('Gagal menghubungi freeemodel.dev.', 502, {
        message: error.message,
      });
    } finally {
      clearTimeout(timeout);
    }
  }

  listModels() {
    return this.request(this.config.FREEEMODEL_MODELS_PATH);
  }

  createChatCompletion(payload) {
    return this.request(this.config.FREEEMODEL_CHAT_PATH, {
      method: 'POST',
      body: payload,
    });
  }
}

export const freeemodelClient = new FreeemodelClient();
