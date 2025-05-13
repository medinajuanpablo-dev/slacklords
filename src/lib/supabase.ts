/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/constants/constants';
import { SupabaseDailyConfig, SupabaseUserReport } from '@/types/types';
import i18n from './i18n';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function getChannelConfig(channelId: string) {
  console.log('Fetch config for', { channelId });
  const { data, error } = await supabase.from('daily_configs').select('*').eq('channel_id', channelId).maybeSingle();

  if (error) {
    console.error(error);
    throw Error('❌ Error when fetching from Supabase:', error);
  }

  const channelConfig = data as SupabaseDailyConfig;
  if (channelConfig?.language) i18n.changeLanguage(channelConfig.language);

  console.log('Fetched config', { channelConfig });

  return { channelConfig, error: null };
}

export async function saveChannelConfig({ channelId, creatorUserId, projectName, participants, language, utcTime }: any) {
  const data = {
    channel_id: channelId,
    created_by: creatorUserId,
    project_name: projectName,
    participants,
    language,
    utc_time: utcTime,
  };

  console.log('Saving config', { data });

  const { channelConfig } = await getChannelConfig(channelId);

  if (channelConfig) {
    const { error } = await supabase.from('daily_configs').update(data).eq('id', channelConfig.id);
    if (error) {
      console.error(error);
      throw Error('❌ Error when updating config to Supabase:', error);
    }
    return { error, isNew: false };
  } else {
    const { error } = await supabase.from('daily_configs').insert([data]);
    if (error) {
      console.error(error);
      throw Error('❌ Error when inserting config to Supabase:', error);
    }
    return { error, isNew: true };
  }
}

export async function deleteChannelConfig(channelId: string) {
  const { id: configId } = (await getChannelConfig(channelId)).channelConfig;

  const { error: removeReportsError } = await supabase.from('daily_reports').delete().eq('config_id', configId);

  const { error: removeConfigError } = await supabase.from('daily_configs').delete().eq('channel_id', channelId);

  if (removeReportsError || removeConfigError) {
    console.error(removeReportsError);
    console.error(removeConfigError);
    throw Error('❌ Error when deleting config from Supabase:');
  }

  return { removeReportsError, removeConfigError };
}

export async function changeConfigStatus(channelId: string, isOpen: boolean) {
  const { error } = await supabase.from('daily_configs').update({ is_open: isOpen }).eq('channel_id', channelId);

  if (error) {
    console.error(error);
    throw Error('❌ Error when updating is_open in Supabase:', error);
  }

  return { error };
}

export async function getConfigsOfTime(date: Date) {
  const now = new Date(date);
  const hhmm = now.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  });

  const { data, error } = await supabase.from('daily_configs').select('*').eq('utc_time', hhmm);

  if (error) {
    console.error(error);
    throw Error('❌ Error when fetching specific config from Supabase:', error);
  }

  const configs = data as SupabaseDailyConfig[];

  return configs;
}

export async function getTodayUserReportForConfig(userId: string, configId: number) {
  const now = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('daily_reports')
    .select('*')
    .eq('user_id', userId)
    .eq('config_id', configId)
    .gte('created_at', `${now}T00:00:00`)
    .lt('created_at', `${now}T23:59:59.999`)
    .maybeSingle();

  if (error) {
    console.error(error);
    throw Error('❌ Error when fetching specific report from Supabase:');
  }

  return data as unknown as SupabaseUserReport;
}

export async function saveReport({ userId, channelId, content }: { userId: string; channelId: string; content: any }) {
  const { channelConfig } = await getChannelConfig(channelId);
  const data = { user_id: userId, config_id: channelConfig.id, content };

  const userReport = await getTodayUserReportForConfig(userId, channelConfig.id);

  if (userReport) {
    const { error } = await supabase.from('daily_reports').update(data).eq('id', userReport.id);
    if (error) console.error(error);
    return { error, isNew: false };
  } else {
    const { error } = await supabase.from('daily_reports').insert([data]);
    if (error) console.error(error);
    return { error, isNew: true };
  }
}
