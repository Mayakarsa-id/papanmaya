import { DatabaseService } from './db';
import { TelegramService } from './telegram';

export class AlarmService {
  constructor(
    private storage: DurableObjectStorage,
    private db: DatabaseService,
    private tg: TelegramService
  ) {}

  async updateAlarm() {
    const now = Date.now();
    let nextTimes: number[] = [];

    // Deadline alarm (6h before)
    const nextTask = this.db.getNextAlarmTask();
    if (nextTask) {
      const targetTime = (nextTask.deadline as number) - (6 * 60 * 60 * 1000);
      nextTimes.push(Math.max(now, targetTime));
    }

    // Auto-delete alarm
    const nextAuto = this.db.getNextAutoDeleteTime(now);
    if (nextAuto) {
      nextTimes.push(Math.max(now, nextAuto));
      // Also ensure at least daily check if done tasks exist but next time far
      // If auto-delete is enabled but no done tasks yet, still check in 24h
    } else {
      // If any user has auto_delete enabled, schedule daily check
      const users = this.db.getUsersWithAutoDelete();
      if (users.length > 0) {
        // Check again in 24h (or 1h for faster tests)
        nextTimes.push(now + 24 * 60 * 60 * 1000);
      }
    }

    if (nextTimes.length > 0) {
      const earliest = Math.min(...nextTimes);
      await this.storage.setAlarm(earliest);
    } else {
      await this.storage.deleteAlarm();
    }
  }

  async processAlarm() {
    const now = Date.now();
    const limit = now + (6 * 60 * 60 * 1000); // Filter: Deadline < 6 jam dari sekarang

    const overdue = this.db.getOverdueTasks(limit);

    for (const t of overdue as any[]) {
      const msg = `🚨 **DEADLINE PENGINGAT ( < 6 JAM )** 🚨\n\n` +
                  `📌 *${t.title}*\nStatus: ${t.status}\nDeadline: ${new Date(t.deadline).toLocaleString('id-ID')}`;
      await this.tg.sendMessage(t.telegram_id, msg);
      this.db.markTaskNotified(t.id);
    }

    // Auto-delete expired done tasks
    try {
      const deleted = this.db.deleteExpiredDoneTasks(now);
      if (deleted > 0) {
        console.log(`[Alarm] auto-deleted ${deleted} done tasks`);
      }
    } catch (e) {
      console.error('[Alarm] auto-delete error', e);
    }

    await this.updateAlarm();
  }
}