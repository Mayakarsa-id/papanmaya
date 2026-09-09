import { Hono } from 'hono';
import { Env } from '../types';

const userRouter = new Hono<{ Bindings: Env, Variables: { username: string } }>();
const getDO = (c: any) => c.env.KANBAN_BOARD.get(c.env.KANBAN_BOARD.idFromName('default-board'));

userRouter.post('/settings/telegram', async (c) => {
  const { telegram_id } = await c.req.parseBody();
  await getDO(c).updateTelegramId(c.get('username'), telegram_id as string);
  return c.redirect('/');
});

export default userRouter;