export const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN!;
export const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET!;
export const SUPABASE_URL = process.env.SUPABASE_URL!;
export const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
export const IS_DEVELOPMENT = process.env.IS_DEVELOPMENT!;

export const HOURS_UNTIL_DAILY_CLOSED = 2;

export const HOLIDAYS: Record<number, Set<string>> = {
  2025: new Set([
    '2025-01-01',
    '2025-03-03',
    '2025-03-04',
    '2025-03-24',
    '2025-04-02',
    '2025-04-18',
    '2025-05-01',
    '2025-05-25',
    '2025-06-17',
    '2025-06-20',
    '2025-07-09',
    '2025-08-18',
    '2025-10-13',
    '2025-11-17',
    '2025-12-08',
    '2025-12-25',
  ]),
  2026: new Set([
    '2026-01-01',
    '2026-02-16',
    '2026-02-17',
    '2026-03-24',
    '2026-04-02',
    '2026-04-03',
    '2026-05-01',
    '2026-05-25',
    '2026-06-17',
    '2026-06-20',
    '2026-07-09',
    '2026-08-17',
    '2026-10-12',
    '2026-11-23',
    '2026-12-08',
    '2026-12-25',
  ]),
};
