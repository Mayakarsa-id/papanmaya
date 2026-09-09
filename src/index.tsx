import { Hono } from 'hono';
import { getCookie } from 'hono/cookie';
import { verify } from 'hono/jwt';
import { Env } from './types';
import authRouter from './routes/auth';
import taskRouter from './routes/tasks';
import userRouter from './routes/user';
import { webhookRouter } from './routes/webhook';
import { KanbanUI } from './views/KanbanUI';

// Expose Durable Object for Wrangler
export { KanbanBoard } from './durable-objects/KanbanBoard';

const app = new Hono<{ Bindings: Env, Variables: { username: string } }>();

// --- UNPROTECTED ROUTES ---
app.route('/webhook', webhookRouter); // Telegram webhook must be public
app.route('/auth', authRouter);

// --- JWT AUTH MIDDLEWARE ---
const authMiddleware = async (c: any, next: any) => {
  const token = getCookie(c, 'auth');
  if (!token) return c.redirect('/auth/login');
  try {
    const payload = await verify(token, c.env.JWT_SECRET, 'HS256');
    c.set('username', payload.username);
    await next();
  } catch (e) {
    return c.redirect('/auth/login');
  }
};

// --- PROTECTED ROUTES ---
app.get('/', authMiddleware, async (c) => {
  const username = c.get('username');
  const DO = c.env.KANBAN_BOARD.get(c.env.KANBAN_BOARD.idFromName('default-board'));

  const user = await DO.getUser(username);
  return c.html(<KanbanUI username={username} telegramId={user?.telegram_id || null} autoDeleteDays={user?.auto_delete_days ?? null} />);
});

app.use('/api/tasks/*', authMiddleware);
app.route('/api/tasks', taskRouter);

app.use('/user/*', authMiddleware);
app.route('/user', userRouter);

export default app;
