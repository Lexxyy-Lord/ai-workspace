import { Router } from 'express';
import { createChatCompletion, listModels } from '../services/chatService.js';
import { validateChatRequest } from '../validators/chatValidator.js';

export const chatRoutes = Router();

chatRoutes.post('/chat', async (req, res, next) => {
  try {
    const input = validateChatRequest(req.body);
    const result = await createChatCompletion(input);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

chatRoutes.get('/models', async (_req, res, next) => {
  try {
    const models = await listModels();
    res.json({ models });
  } catch (error) {
    next(error);
  }
});
