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

  private static statusEmoji(status: string): string {
    switch (status) {
      case 'todo': return '📝';
      case 'in-progress': return '⏳';
      case 'done': return '✅';
      default: return '🔹';
    }
  }

  private static escapeMd(text: string): string {
    return (text || '').replace(/([_*\[\]()~`>#+\-=|{}.!])/g, '\\$1');
  }

  async notifyStatusChange(chatId: string, title: string, from: string, to: string) {
    if (!chatId || from === to) return;
    const msg =
      `🔄 *Task Status Changed*\n\n` +
      `📌 ${TelegramService.escapeMd(title)}\n` +
      `${TelegramService.statusEmoji(from)} ${from} → ${TelegramService.statusEmoji(to)} ${to}`;
    await this.sendMessage(chatId, msg);
  }

  async handleWebhook(update: any, db: DatabaseService) {
    if (!update.message || !update.message.text) return;
    const chatId = update.message.chat.id.toString();
    const text = update.message.text.trim();

    const user = db.getUserByTelegramId(chatId);
    if (!user) return this.sendMessage(chatId, "❌ Your Telegram ID is not linked to PapanMaya.");

    const username = user.username;

    if (text === '/info') {
      const stats = db.getTaskStats(username);
      let msg = `📊 **PapanMaya Stats @${username}**\n\n`;
      stats.forEach((s: any) => msg += `▫️ ${s.status.toUpperCase()}: ${s.count} tasks\n`);
      return this.sendMessage(chatId, msg);
    }

    if (text.startsWith('/list')) {
      const status = text.split(' ')[1];
      if (!status) return this.sendMessage(chatId, "⚠️ Usage: \`/list todo\`, \`/list in-progress\`, or \`/list done\`");

      const tasks = db.getTasksByStatus(username, status);
      let msg = `📋 **Tasks [${status.toUpperCase()}]**\n\n`;
      if (tasks.length === 0) msg += "No tasks.";
      tasks.forEach((t: any, i) => msg += `${i+1}. ${t.title}\n`);
      return this.sendMessage(chatId, msg);
    }

    return this.sendMessage(chatId, "🤖 **Available Commands:**\n/info - Stats\n/list [status] - List tasks");
  }
}