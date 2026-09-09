export interface Env {
  KANBAN_BOARD: DurableObjectNamespace;
  TELEGRAM_BOT_TOKEN: string;
  JWT_SECRET: string;
}

export type User = { username: string; totp_secret: string; telegram_id: string | null; auto_delete_days: number | null; };
export type Task = {
  id: string;
  username: string;
  title: string;
  detail: string;
  status: string;
  start_date: number | null;
  deadline: number | null;
  created_at: number;
  updated_at: number;
  notified: number;
};