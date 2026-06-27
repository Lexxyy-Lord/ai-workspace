import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeMessages } from '../src/services/chatService.js';

test('normalizeMessages creates a system and user conversation', () => {
  const messages = normalizeMessages({
    system: 'Jawab dalam Bahasa Indonesia.',
    message: 'Halo AI',
  });

  assert.deepEqual(messages, [
    { role: 'system', content: 'Jawab dalam Bahasa Indonesia.' },
    { role: 'user', content: 'Halo AI' },
  ]);
});

test('normalizeMessages keeps previous messages before latest user input', () => {
  const messages = normalizeMessages({
    system: '',
    messages: [{ role: 'assistant', content: 'Siap.' }],
    message: 'Buat ringkasan.',
  });

  assert.deepEqual(messages, [
    { role: 'assistant', content: 'Siap.' },
    { role: 'user', content: 'Buat ringkasan.' },
  ]);
});

test('normalizeMessages rejects empty conversations', () => {
  assert.throws(() => normalizeMessages({ system: '', messages: [] }), /wajib dikirim/);
});
