import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/api/app.js';

test('GET /health returns ok status', async () => {
  const response = await request(createApp()).get('/health').expect(200);
  assert.equal(response.body.status, 'ok');
  assert.equal(response.body.service, 'backend');
});
