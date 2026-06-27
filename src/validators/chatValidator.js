import { z } from 'zod';
import { AppError } from '../utils/errors.js';

const messageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant', 'tool']).default('user'),
  content: z.string().min(1),
});

export const chatRequestSchema = z
  .object({
    message: z.string().trim().min(1).optional(),
    messages: z.array(messageSchema).optional().default([]),
    system: z.string().optional(),
    model: z.string().trim().min(1).optional(),
    temperature: z.number().min(0).max(2).optional(),
    maxTokens: z.number().int().positive().max(32000).optional(),
  })
  .refine((value) => value.message || value.messages.length > 0, {
    message: 'message atau messages wajib diisi.',
    path: ['message'],
  });

export const validateChatRequest = (payload) => {
  const parsed = chatRequestSchema.safeParse(payload);

  if (!parsed.success) {
    throw new AppError('Payload chat tidak valid.', 400, parsed.error.flatten().fieldErrors);
  }

  return parsed.data;
};
