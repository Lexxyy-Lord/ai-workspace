import { Router } from 'express';
import { env } from '../config/env.js';

export const configRoutes = Router();

configRoutes.get('/', (_req, res) => {
  res.json({
    appTitle: env.PUBLIC_APP_TITLE,
    appDescription: env.PUBLIC_APP_DESCRIPTION,
    defaultModel: env.FREEEMODEL_MODEL,
    defaultTemperature: env.AI_DEFAULT_TEMPERATURE,
    defaultMaxTokens: env.AI_DEFAULT_MAX_TOKENS,
    providerConfigured: Boolean(env.FREEEMODEL_API_KEY),
  });
});
