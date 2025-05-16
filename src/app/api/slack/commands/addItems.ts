import allITems from '@/constants/all-items.json';
import { addItemsToDatabase } from '@/lib/supabase';
import { respondEphemeral } from '@/lib/utils';
import { SupabaseItem } from '@/types/types';

export default async function addItemsFromJSON() {
  const { error } = await addItemsToDatabase(allITems as SupabaseItem[]);
  if (error) return respondEphemeral('[ADMIN] Error adding items to database');

  return respondEphemeral('[ADMIN] Items from JSON added to database');
}
