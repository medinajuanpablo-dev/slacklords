import { getStoreListBlocks } from '@/lib/blocks';
import { postSlackEphemeral, postSlackMessage } from '@/lib/slack';
import { getItems, updateBattlefieldStore } from '@/lib/supabase';
import { getAndControlBattlefieldAndCharacter, respondEphemeral } from '@/lib/utils';
import { ItemType, StoreItems, SupabaseBattlefield, SupabaseCharacter, SupabaseItem } from '@/types/types';
import { NextResponse } from 'next/server';

function calculateItemPrice(item: SupabaseItem) {
  const { type, modifying_stats_values } = item.effect_data;

  const modifyingStatsSum = modifying_stats_values ? Object.values(modifying_stats_values).reduce((acc, curr) => acc + curr, 0) : 0;

  switch (type) {
    case ItemType.WEAPON:
    case ItemType.ARMOR:
    case ItemType.HELMET:
      return Math.max(modifyingStatsSum * 10, 50);
    case ItemType.JEWEL:
      return Math.max(modifyingStatsSum * 15, 50);
    case ItemType.ACCESSORY:
      return Math.max(modifyingStatsSum * 18, 50);
    case ItemType.CONSUMABLE:
      return Math.max(modifyingStatsSum * 5 + (item.effect_data.hearts_addition ?? 0) * 30, 30);
  }
}

function calculateItemQuantity(item: SupabaseItem) {
  const { type } = item.effect_data;

  switch (type) {
    case ItemType.WEAPON:
    case ItemType.ARMOR:
    case ItemType.HELMET:
    case ItemType.JEWEL:
    case ItemType.ACCESSORY:
      return 1;
    case ItemType.CONSUMABLE:
      return Math.floor(Math.random() * 3) + 1;
  }
}

function pickSaleItems(items: SupabaseItem[]) {
  const shuffledItems = items.sort(() => 0.5 - Math.random());
  return shuffledItems.slice(0, 7);
}

async function updateStore(userId: string, channelId: string, battlefield: SupabaseBattlefield) {
  const { data: items, error: getItemsError } = await getItems();
  if (getItemsError) return postSlackEphemeral({ channel: channelId, user: userId, text: 'Error al obtener los items' });

  console.log('Items', items);

  const pickedItems = pickSaleItems(items);
  const storeItems: StoreItems[] = pickedItems.map(item => ({
    item,
    quantity: calculateItemQuantity(item),
    price: calculateItemPrice(item),
  }));

  const { error: updateError } = await updateBattlefieldStore(battlefield.id, storeItems);
  if (updateError) return postSlackEphemeral({ channel: channelId, user: userId, text: 'Error al actualizar el store' });

  postSlackMessage({
    channel: battlefield.channel_id,
    blocks: [
      {
        type: 'section',
        text: { type: 'mrkdwn', text: '⚠️ *Store Actualizado!* ⚠️' },
      },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: 'Nuevos items disponibles. Mandá `/slacklords store` para ver y comprar.' },
      },
    ],
  });
}

function showStoreList(battlefield: SupabaseBattlefield, userId: string, character: SupabaseCharacter) {
  return NextResponse.json({
    response_type: 'ephemeral',
    text: 'Store items',
    blocks: getStoreListBlocks(battlefield, userId, character),
  });
}

export default async function manageStore(userId: string, channelId: string, secondArgument: string) {
  const { battlefield, character, problemMessage } = await getAndControlBattlefieldAndCharacter(userId, channelId);
  if (problemMessage) return respondEphemeral(problemMessage);

  const now = new Date();
  const lastUpdated = new Date(battlefield.store.last_updated);
  const diffTime = Math.abs(now.getTime() - lastUpdated.getTime());
  const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));

  if (secondArgument === 'update') {
    if (diffHours > 24) {
      updateStore(userId, channelId, battlefield);
      return respondEphemeral('Actualizando store...');
    }

    return respondEphemeral(`Store ya actualizado hoy. Faltan ${24 - diffHours} horas para poder actualizarlo de nuevo.`);
  }

  if (!secondArgument) return showStoreList(battlefield, userId, character);

  return respondEphemeral('Argumento inválido');
}
