import { Hono } from 'hono';
import { Env } from '../types';

export const webhookRouter = new Hono<{ Bindings: Env }>();

webhookRouter.post('/telegram', async (c) => {
  const update = await c.req.json();
  const DO = c.env.KANBAN_BOARD.get(c.env.KANBAN_BOARD.idFromName('default-board'));
  await DO.handleWebhook(update);
  return c.text('OK');
});