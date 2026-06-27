import { Router } from 'express';
import { authenticate } from '../../middleware/authMiddleware.js';
import { validateBody } from '../../middleware/validate.js';
import { chatSchema } from '../validators.js';
import { createChatCompletion, getChatHistory, listChatHistory, listModels } from '../../services/chatService.js';

export const chatRoutes = Router();

chatRoutes.use(authenticate);

chatRoutes.post('/', validateBody(chatSchema), async (req, res, next) => {
  try {
    const result = await createChatCompletion({
      userId: req.user.sub,
      workspaceId: req.body.workspaceId,
      body: req.body,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

chatRoutes.get('/history', (req, res, next) => {
  try {
    res.json({ items: listChatHistory({ userId: req.user.sub, workspaceId: req.query.workspaceId }) });
  } catch (error) {
    next(error);
  }
});

chatRoutes.get('/history/:chatId', (req, res, next) => {
  try {
    res.json(getChatHistory({ userId: req.user.sub, chatId: req.params.chatId }));
  } catch (error) {
    next(error);
  }
});

chatRoutes.get('/models', async (_req, res, next) => {
  try {
    res.json({ models: await listModels() });
  } catch (error) {
    next(error);
  }
});
