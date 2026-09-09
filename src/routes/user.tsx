import { Hono } from 'hono';
import { Env } from '../types';

const userRouter = new Hono<{ Bindings: Env, Variables: { username: string } }>();
const getDO = (c: any) => c.env.KANBAN_BOARD.get(c.env.KANBAN_BOARD.idFromName('default-board'));

userRouter.post('/settings/telegram', async (c) => {
  const { telegram_id } = await c.req.parseBody();
  await getDO(c).updateTelegramId(c.get('username'), telegram_id as string);
  return c.redirect('/');
});

userRouter.post('/settings/auto-delete', async (c) => {
  const { auto_delete_days } = await c.req.parseBody();
  let days: number | null = null;
  const raw = (auto_delete_days as string)?.trim();
  if (raw && raw !== '' && raw !== '0' && raw.toLowerCase() !== 'null') {
    const parsed = parseInt(raw, 10);
    if (!isNaN(parsed) && parsed > 0) days = parsed;
  }
  await getDO(c).updateAutoDelete(c.get('username'), days);
  return c.redirect('/');
});

export default userRouter;