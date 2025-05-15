import { createClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/constants/constants';
import { SupabaseBattlefield } from '@/types/types';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function createBattlefield(channelId: string) {
  console.log('Creating battlefield for channel', { channelId });

  const data = { channel_id: channelId };

  const { error } = await supabase.from('battlefields').insert([data]);

  if (error) console.error('Error creating battlefield', { error });

  return { error };
}

export async function getBattlefield(channelId: string) {
  const { data, error } = await supabase.from('battlefields').select('*').eq('channel_id', channelId).maybeSingle();

  if (error) {
    console.error('Error getting battlefield', { error });
    return { error };
  }

  return { data: data as SupabaseBattlefield };
}

export async function removeBattlefield(channelId: string) {
  const { error } = await supabase.from('battlefields').delete().eq('channel_id', channelId);

  if (error) console.error('Error removing battlefield', { error });

  return { error };
}
