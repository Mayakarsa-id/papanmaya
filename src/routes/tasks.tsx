import { Hono } from 'hono';
import { Env } from '../types';

const taskRouter = new Hono<{ Bindings: Env, Variables: { username: string } }>();
const getDO = (c: any) => c.env.KANBAN_BOARD.get(c.env.KANBAN_BOARD.idFromName('default-board'));

taskRouter.get('/', async (c) => {
  const tasks = await getDO(c).getTasks(c.get('username'));
  return c.json(tasks);
});

taskRouter.post('/', async (c) => {
  const body = await c.req.json();
  if (body.status !== undefined && !['todo', 'in-progress', 'done'].includes(body.status)) {
    return c.json({ error: 'Invalid status' }, 400);
  }
  const task = await getDO(c).addTask(c.get('username'), body);
  return c.json(task, 201);
});

taskRouter.patch('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  if (body.status !== undefined && !['todo', 'in-progress', 'done'].includes(body.status)) {
    return c.json({ error: 'Invalid status' }, 400);
  }
  await getDO(c).updateTask(id, c.get('username'), body);
  return c.json({ success: true });
});

taskRouter.delete('/:id', async (c) => {
  const id = c.req.param('id');
  await getDO(c).deleteTask(id, c.get('username'));
  return c.json({ success: true });
});

export default taskRouter;