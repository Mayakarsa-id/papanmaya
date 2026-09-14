import { Task, User } from '../types';

export class DatabaseService {
  constructor(private storage: DurableObjectStorage) {}

  initSchema() {
    this.storage.sql.exec(`
      CREATE TABLE IF NOT EXISTS users (username TEXT PRIMARY KEY, totp_secret TEXT, telegram_id TEXT, auto_delete_days INTEGER);
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY, username TEXT, title TEXT, detail TEXT, status TEXT,
        start_date INTEGER, deadline INTEGER, created_at INTEGER, updated_at INTEGER, notified INTEGER DEFAULT 0
      );
    `);
    // Migration for existing DBs (ignore if already exists)
    try { this.storage.sql.exec(`ALTER TABLE users ADD COLUMN auto_delete_days INTEGER`); } catch {}
    try { this.storage.sql.exec(`ALTER TABLE tasks ADD COLUMN updated_at INTEGER`); } catch {}
    // Backfill updated_at where null
    try { this.storage.sql.exec(`UPDATE tasks SET updated_at = created_at WHERE updated_at IS NULL`); } catch {}
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
    this.storage.sql.exec(`INSERT INTO users (username, totp_secret, auto_delete_days) VALUES (?, ?, NULL)`, username, totpSecret);
  }
  updateTelegramId(username: string, telegramId: string) {
    this.storage.sql.exec(`UPDATE users SET telegram_id = ? WHERE username = ?`, telegramId, username);
  }
  updateAutoDelete(username: string, days: number | null) {
    this.storage.sql.exec(`UPDATE users SET auto_delete_days = ? WHERE username = ?`, days, username);
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
    const now = Date.now();
    this.storage.sql.exec(
      `INSERT INTO tasks (id, username, title, detail, status, start_date, deadline, created_at, updated_at) VALUES (?, ?, ?, ?, 'todo', ?, ?, ?, ?)`,
      id, username, task.title, task.detail || '', task.start_date || null, task.deadline || null, now, now
    );
    return id;
  }
  updateTask(id: string, username: string, updates: Partial<Task>) {
    const now = Date.now();
    if (updates.status) {
      this.storage.sql.exec(`UPDATE tasks SET status = ?, updated_at = ? WHERE id = ? AND username = ?`, updates.status, now, id, username);
    } else {
      this.storage.sql.exec(`UPDATE tasks SET title = ?, detail = ?, start_date = ?, deadline = ?, updated_at = ? WHERE id = ? AND username = ?`,
        updates.title, updates.detail, updates.start_date, updates.deadline, now, id, username);
    }
  }
  deleteTask(id: string, username: string) {
    this.storage.sql.exec(`DELETE FROM tasks WHERE id = ? AND username = ?`, id, username);
  }
  getTaskById(id: string, username: string): Task | null {
    try {
      return this.storage.sql.exec(`SELECT * FROM tasks WHERE id = ? AND username = ?`, id, username).one() as Task;
    } catch {
      return null;
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

  // Auto-delete helpers
  getUsersWithAutoDelete(): { username: string; auto_delete_days: number }[] {
    return this.storage.sql.exec(`SELECT username, auto_delete_days FROM users WHERE auto_delete_days IS NOT NULL AND auto_delete_days > 0`).toArray() as any;
  }
  deleteExpiredDoneTasks(now: number): number {
    let total = 0;
    const users = this.getUsersWithAutoDelete();
    for (const u of users) {
      const cutoff = now - u.auto_delete_days * 24 * 60 * 60 * 1000;
      const res = this.storage.sql.exec(`DELETE FROM tasks WHERE username = ? AND status = 'done' AND updated_at <= ?`, u.username, cutoff);
      // @ts-ignore - rowCount maybe
      total += (res as any).rowsWritten ?? 0;
    }
    // Fallback: single query for count if rowsWritten not available — just report per user
    return total;
  }
  getNextAutoDeleteTime(now: number): number | null {
    try {
      const row = this.storage.sql.exec(`
        SELECT MIN(tasks.updated_at + users.auto_delete_days * 86400000) as next_time
        FROM tasks JOIN users ON tasks.username = users.username
        WHERE tasks.status = 'done' AND users.auto_delete_days IS NOT NULL AND users.auto_delete_days > 0
      `).one() as any;
      if (!row || row.next_time === null) return null;
      return row.next_time as number;
    } catch {
      return null;
    }
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