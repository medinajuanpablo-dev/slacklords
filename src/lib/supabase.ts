import { createClient } from '@supabase/supabase-js';
import { BASE_EQUIPMENT, BASE_HEARTS, SUPABASE_ANON_KEY, SUPABASE_URL } from '@/constants/constants';
import { GeneratedCharacterData, StoreItems, SupabaseBattlefield, SupabaseCharacter, SupabaseItem } from '@/types/types';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function createBattlefield(channelId: string) {
  console.log('Creating battlefield for channel', { channelId });

  const data = { channel_id: channelId, store: { items: [], last_updated: new Date().toUTCString() } };

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

export async function getCharacter(userId: string, battlefieldId: string) {
  const { data, error } = await supabase
    .from('characters')
    .select('*')
    .eq('user_id', userId)
    .eq('battlefield_id', battlefieldId)
    .maybeSingle();

  if (error) {
    console.error('Error getting character', { error });
    return { error };
  }

  return { data: data as SupabaseCharacter };
}

export async function getCharacterById(characterId: string) {
  const { data, error } = await supabase.from('characters').select('*').eq('id', characterId).maybeSingle();

  if (error) {
    console.error('Error getting character', { error });
    return { error };
  }

  return { data: data as SupabaseCharacter };
}

export async function createCharacter(userId: string, battlefieldId: string, characterGeneratedData: GeneratedCharacterData) {
  const { name, story, stats } = characterGeneratedData;

  const data = {
    user_id: userId,
    battlefield_id: battlefieldId,
    name,
    story,
    hearts: BASE_HEARTS,
    stats,
    equipment: BASE_EQUIPMENT,
    inventory: [],
  };

  const { error } = await supabase.from('characters').insert([data]);

  if (error) console.error('Error creating character', { error });

  return { error };
}

export async function deleteCharacter(characterId: string) {
  const { error } = await supabase.from('characters').delete().eq('id', characterId);

  if (error) console.error('Error deleting character', { error });

  return { error };
}

export async function addItemsToDatabase(items: Partial<SupabaseItem>[]) {
  const { error } = await supabase.from('items').insert(items);

  if (error) console.error('Error adding items to database', { error });

  return { error };
}

export async function getItems() {
  const { data, error } = await supabase.from('items').select('*');

  if (error) console.error('Error getting items', { error });

  return { data: data as SupabaseItem[], error };
}

export async function updateBattlefieldStore(battlefieldId: string, newItems: StoreItems[]) {
  const { error } = await supabase
    .from('battlefields')
    .update({ store: { items: newItems, last_updated: new Date().toUTCString() } })
    .eq('id', battlefieldId);

  if (error) console.error('Error updating battlefield store', { error });

  return { error };
}
