export class AppError extends Error {
  constructor(message, statusCode = 500, details = undefined) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
  }
}

export class ProviderError extends AppError {
  constructor(message, statusCode = 502, details = undefined) {
    super(message, statusCode, details);
    this.name = 'ProviderError';
  }
}

export const isTrustedError = (error) => Boolean(error?.isOperational);
