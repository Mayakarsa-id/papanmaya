import { Task, User } from '../types';

export class DatabaseService {
  constructor(private storage: DurableObjectStorage) {}

  initSchema() {
    this.storage.sql.exec(`
      CREATE TABLE IF NOT EXISTS users (username TEXT PRIMARY KEY, totp_secret TEXT, telegram_id TEXT);
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY, username TEXT, title TEXT, detail TEXT, status TEXT,
        start_date INTEGER, deadline INTEGER, created_at INTEGER, notified INTEGER DEFAULT 0
      );
    `);
  }

  // User Queries
  getUser(username: string): User | null {
    try {
      return this.storage.sql.exec(`SELECT * FROM users WHERE username = ?`, username).one() as User;
    } catch {
      return null;
    }
  }
  createUser(username: string, totpSecret: string) {
    this.storage.sql.exec(`INSERT INTO users (username, totp_secret) VALUES (?, ?)`, username, totpSecret);
  }
  updateTelegramId(username: string, telegramId: string) {
    this.storage.sql.exec(`UPDATE users SET telegram_id = ? WHERE username = ?`, telegramId, username);
  }
  getUserByTelegramId(chatId: string): { username: string } | null {
    try {
      return this.storage.sql.exec(`SELECT username FROM users WHERE telegram_id = ?`, chatId).one() as any;
    } catch {
      return null;
    }
  }

  // Task Queries
  addTask(username: string, task: Partial<Task>) {
    const id = crypto.randomUUID();
    this.storage.sql.exec(
      `INSERT INTO tasks (id, username, title, detail, status, start_date, deadline, created_at) VALUES (?, ?, ?, ?, 'todo', ?, ?, ?)`,
      id, username, task.title, task.detail || '', task.start_date || null, task.deadline || null, Date.now()
    );
    return id;
  }
  updateTask(id: string, username: string, updates: Partial<Task>) {
    if (updates.status) {
      this.storage.sql.exec(`UPDATE tasks SET status = ? WHERE id = ? AND username = ?`, updates.status, id, username);
    } else {
      this.storage.sql.exec(`UPDATE tasks SET title = ?, detail = ?, start_date = ?, deadline = ? WHERE id = ? AND username = ?`,
        updates.title, updates.detail, updates.start_date, updates.deadline, id, username);
    }
  }
  getTasks(username: string): Task[] {
    return this.storage.sql.exec(`SELECT * FROM tasks WHERE username = ? ORDER BY deadline ASC, created_at DESC`, username).toArray() as Task[];
  }
  getTaskStats(username: string) {
    return this.storage.sql.exec(`SELECT status, COUNT(*) as count FROM tasks WHERE username = ? GROUP BY status`, username).toArray();
  }
  getTasksByStatus(username: string, status: string) {
    return this.storage.sql.exec(`SELECT title FROM tasks WHERE username = ? AND status = ?`, username, status).toArray();
  }

  // Alarm Queries
  getNextAlarmTask(): { deadline: number } | null {
    try {
      return this.storage.sql.exec(`
        SELECT tasks.deadline FROM tasks JOIN users ON tasks.username = users.username
        WHERE tasks.status != 'done' AND tasks.notified = 0 AND tasks.deadline IS NOT NULL
        AND users.telegram_id IS NOT NULL AND users.telegram_id != ''
        ORDER BY tasks.deadline ASC LIMIT 1
      `).one() as { deadline: number };
    } catch {
      return null;
    }
  }
  getOverdueTasks(limitTime: number) {
    return this.storage.sql.exec(`
      SELECT tasks.*, users.telegram_id FROM tasks JOIN users ON tasks.username = users.username
      WHERE tasks.status != 'done' AND tasks.notified = 0 AND tasks.deadline IS NOT NULL
      AND tasks.deadline <= ? AND users.telegram_id IS NOT NULL AND users.telegram_id != ''
    `, limitTime).toArray();
  }
  markTaskNotified(id: string) {
    this.storage.sql.exec(`UPDATE tasks SET notified = 1 WHERE id = ?`, id);
  }
}