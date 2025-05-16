import { STATS_EMOJIES, TYPES_EMOJIES } from '@/constants/constants';
import { postSlackEphemeral, postSlackMessage } from '@/lib/slack';
import { getBattlefield, getCharacter, getItems, updateBattlefieldStore } from '@/lib/supabase';
import { respondEphemeral } from '@/lib/utils';
import { ItemType, StoreItems, SupabaseBattlefield, SupabaseItem } from '@/types/types';
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

function showStoreList(battlefield: SupabaseBattlefield, userId: string) {
  return NextResponse.json({
    response_type: 'ephemeral',
    text: 'Store items',
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*============= Store =============*\n\n_No te colgués que los items vuelan. Puede que ya no estén disponibles cuando hagas click._',
        },
      },

      {
        type: 'divider',
      },
      ...(battlefield.store.items.length === 0
        ? [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: 'No hay items disponibles en el store. Actualizalo con `/slacklords store update`',
              },
            },
          ]
        : battlefield.store.items
            .map(storeItem => [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `${TYPES_EMOJIES[storeItem.item.effect_data.type]} *${storeItem.item.name}* [queda ${storeItem.quantity}]`,
                },
              },
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `${
                    storeItem.item.effect_data.hearts_addition
                      ? `${storeItem.item.effect_data.hearts_addition > 0 ? '💊 Restaura' : '💀 Quita'} ${Math.abs(
                          storeItem.item.effect_data.hearts_addition
                        )} ♡\n\n`
                      : ''
                  }${
                    storeItem.item.effect_data.modifying_stats_values
                      ? `${Object.entries(storeItem.item.effect_data.modifying_stats_values)
                          .map(
                            ([stat, value]) => `*${value > 0 ? '+' : ''}${value}* ${STATS_EMOJIES[stat as keyof typeof STATS_EMOJIES]}`
                          )
                          .join(' | ')} ${storeItem.item.effect_data.type === ItemType.CONSUMABLE ? '_TEMPORAL_' : ''}\n\n`
                      : ''
                  }_${storeItem.item.description}_`,
                },
                accessory: {
                  type: 'button',
                  text: {
                    type: 'plain_text',
                    text: `${storeItem.price} 💰`,
                    emoji: true,
                  },
                  value: `buy_item|${storeItem.item.id}|${userId}`,
                },
              },
              {
                type: 'divider',
              },
            ])
            .flat()),
    ],
  });
}

export default async function manageStore(userId: string, channelId: string, secondArgument: string) {
  const { data: battlefield, error: getError } = await getBattlefield(channelId);
  if (getError) return respondEphemeral('Error al obtener el battlefield');
  if (!battlefield) return respondEphemeral('No se encontró battlefield, crea uno primero con `/slacklords battlefield set`');

  const { data: character, error: getCharacterError } = await getCharacter(userId, battlefield.id);
  if (getCharacterError) return respondEphemeral('Error al obtener el personaje');
  if (!character) return respondEphemeral('No se encontró personaje, crea uno primero con `/slacklords character`');

  console.log('Battlefield', battlefield);

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

  if (!secondArgument) return showStoreList(battlefield, userId);

  return respondEphemeral('Argumento inválido');
}
