import { DurableObject } from 'cloudflare:workers';
import { Env, Task } from '../types';
import { DatabaseService } from '../services/db';
import { TelegramService } from '../services/telegram';
import { AlarmService } from '../services/alarm';

export class KanbanBoard extends DurableObject {
  private db: DatabaseService;
  private tg: TelegramService;
  private alarmSvc: AlarmService;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.db = new DatabaseService(ctx.storage);
    this.tg = new TelegramService(env.TELEGRAM_BOT_TOKEN);
    this.alarmSvc = new AlarmService(ctx.storage, this.db, this.tg);

    this.db.initSchema();
  }

  // --- API RPC Methods (Dipanggil oleh Routers) ---

  async getUser(username: string) { return this.db.getUser(username); }
  async createUser(username: string, totpSecret: string) { return this.db.createUser(username, totpSecret); }
  async updateTelegramId(username: string, tgId: string) { return this.db.updateTelegramId(username, tgId); }
  async updateAutoDelete(username: string, days: number | null) {
    this.db.updateAutoDelete(username, days);
    await this.alarmSvc.updateAlarm();
    return { success: true };
  }

  async getTasks(username: string) { return this.db.getTasks(username); }

  async addTask(username: string, task: Partial<Task>) {
    const id = this.db.addTask(username, task);
    await this.alarmSvc.updateAlarm();
    return { id, status: 'todo' };
  }

  async updateTask(id: string, username: string, updates: Partial<Task>) {
    this.db.updateTask(id, username, updates);
    await this.alarmSvc.updateAlarm();
    return { success: true };
  }

  async deleteTask(id: string, username: string) {
    this.db.deleteTask(id, username);
    await this.alarmSvc.updateAlarm();
    return { success: true };
  }

  async handleWebhook(update: any) {
    return this.tg.handleWebhook(update, this.db);
  }

  // --- DO Alarm Hook ---
  async alarm() {
    await this.alarmSvc.processAlarm();
  }
}