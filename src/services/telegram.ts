import { DatabaseService } from './db';

export class TelegramService {
  constructor(private token: string) {}

  async sendMessage(chatId: string, text: string) {
    if (!this.token || !chatId) return;
    await fetch(`https://api.telegram.org/bot${this.token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' })
    });
  }

  async handleWebhook(update: any, db: DatabaseService) {
    if (!update.message || !update.message.text) return;
    const chatId = update.message.chat.id.toString();
    const text = update.message.text.trim();

    const user = db.getUserByTelegramId(chatId);
    if (!user) return this.sendMessage(chatId, "❌ Telegram ID Anda belum terdaftar di PapanMaya.");

    const username = user.username;

    if (text === '/info') {
      const stats = db.getTaskStats(username);
      let msg = `📊 **Statistik PapanMaya @${username}**\n\n`;
      stats.forEach((s: any) => msg += `▫️ ${s.status.toUpperCase()}: ${s.count} tugas\n`);
      return this.sendMessage(chatId, msg);
    }

    if (text.startsWith('/list')) {
      const status = text.split(' ')[1];
      if (!status) return this.sendMessage(chatId, "⚠️ Gunakan: `/list todo`, `/list in-progress`, atau `/list done`");

      const tasks = db.getTasksByStatus(username, status);
      let msg = `📋 **Daftar Tugas [${status.toUpperCase()}]**\n\n`;
      if (tasks.length === 0) msg += "Tidak ada tugas.";
      tasks.forEach((t: any, i) => msg += `${i+1}. ${t.title}\n`);
      return this.sendMessage(chatId, msg);
    }

    return this.sendMessage(chatId, "🤖 **Command Tersedia:**\n/info - Statistik\n/list [status] - Daftar tugas");
  }
}