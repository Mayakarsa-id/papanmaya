import { DatabaseService } from './db';
import { TelegramService } from './telegram';

export class AlarmService {
  constructor(
    private storage: DurableObjectStorage,
    private db: DatabaseService,
    private tg: TelegramService
  ) {}

  async updateAlarm() {
    const nextTask = this.db.getNextAlarmTask();
    if (nextTask) {
      // Trigger alarm 6 jam SEBELUM deadline
      const targetTime = (nextTask.deadline as number) - (6 * 60 * 60 * 1000);
      await this.storage.setAlarm(Math.max(Date.now(), targetTime));
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
    await this.updateAlarm();
  }
}