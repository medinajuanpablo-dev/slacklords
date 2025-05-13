export type SupabaseDailyConfig = {
  id: number;
  created_at: string;
  channel_id: string;
  created_by: string;
  project_name: string;
  language: string;
  utc_time: string;
  participants: string[];
  is_open: boolean;
};

export type SupabaseUserReport = {
  id: number;
  created_at: string;
  user_id: string;
  content: { yesterday: string; today: string; blockers: string };
  config_id: number;
};
