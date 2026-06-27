export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'APP_ERROR', details = undefined) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
  }
}

export class AuthError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'AUTH_ERROR');
    this.name = 'AuthError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

export class ProviderError extends AppError {
  constructor(message, statusCode = 502, details = undefined) {
    super(message, statusCode, 'PROVIDER_ERROR', details);
    this.name = 'ProviderError';
  }
}
