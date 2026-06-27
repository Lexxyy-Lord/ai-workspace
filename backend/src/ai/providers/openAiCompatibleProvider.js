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

  async request(path, options = {}) {
    if (!this.config.apiKey) {
      throw new ProviderError('API key provider belum dikonfigurasi.', 400);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs);

    try {
      const response = await fetch(joinUrl(this.config.baseUrl, path), {
        method: options.method || 'GET',
        headers: this.headers(),
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });
      const body = await parseBody(response);

      if (!response.ok) {
        throw new ProviderError(
          body?.error?.message || body?.message || `Provider HTTP ${response.status}`,
          response.status >= 500 ? 502 : response.status,
          body,
        );
      }

      return body;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new ProviderError('Request AI provider timeout.', 504);
      }

      if (error instanceof ProviderError) {
        throw error;
      }

      throw new ProviderError('Gagal menghubungi AI provider.', 502, { message: error.message });
    } finally {
      clearTimeout(timeout);
    }
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
