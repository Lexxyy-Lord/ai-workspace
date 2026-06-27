import { ProviderError } from '../../utils/appError.js';

const joinUrl = (baseUrl, path) => `${baseUrl.replace(/\/+$/, '')}${path.startsWith('/') ? path : `/${path}`}`;

const parseBody = async (response) => {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
};

const unique = (items) => [...new Set(items.filter(Boolean))];

export class OpenAiCompatibleProvider {
  constructor(config) {
    this.config = config;
  }

  headers() {
    const prefix = this.config.authPrefix ? `${this.config.authPrefix} ` : '';
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      [this.config.authHeader]: `${prefix}${this.config.apiKey}`,
      ...(this.config.extraHeaders || {}),
    };
  }

  baseUrls() {
    return unique([this.config.baseUrl, ...(this.config.fallbackBaseUrls || [])]);
  }

  async request(path, options = {}) {
    if (!this.config.apiKey) {
      throw new ProviderError('API key provider belum dikonfigurasi.', 400);
    }

    const attempted = [];
    let lastError;

    for (const baseUrl of this.baseUrls()) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs);
      const url = joinUrl(baseUrl, path);
      attempted.push(url);

      try {
        const response = await fetch(url, {
          method: options.method || 'GET',
          headers: this.headers(),
          body: options.body ? JSON.stringify(options.body) : undefined,
          signal: controller.signal,
        });
        const body = await parseBody(response);

        if (response.ok) {
          return body;
        }

        lastError = new ProviderError(
          body?.error?.message || body?.message || `Provider HTTP ${response.status}`,
          response.status >= 500 ? 502 : response.status,
          { providerBody: body, attempted },
        );

        if (response.status === 404) {
          continue;
        }

        throw lastError;
      } catch (error) {
        if (error.name === 'AbortError') {
          lastError = new ProviderError('Request AI provider timeout.', 504, { attempted });
          continue;
        }

        if (error instanceof ProviderError) {
          lastError = error;
          if (error.statusCode === 404) continue;
          throw error;
        }

        lastError = new ProviderError('Gagal menghubungi AI provider.', 502, {
          message: error.message,
          attempted,
        });
      } finally {
        clearTimeout(timeout);
      }
    }

    throw lastError || new ProviderError('Gagal menghubungi AI provider.', 502, { attempted });
  }

  listModels() {
    return this.request(this.config.modelsPath);
  }

  chat(payload) {
    return this.request(this.config.chatPath, {
      method: 'POST',
      body: payload,
    });
  }
}
