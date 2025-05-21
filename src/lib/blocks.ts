import { STATS_EMOJIES, TYPES_EMOJIES } from '@/constants/constants';
import { SupabaseBattlefield, ItemType, SupabaseCharacter } from '@/types/types';

export function getStoreListBlocks(battlefield: SupabaseBattlefield, userId: string, character: SupabaseCharacter) {
  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: ` *============= Store =============*\n\nTu oro 💰 *${character.gold}* \n\n_No te colgués que los items vuelan. Puede que ya no estén disponibles cuando hagas click._`,
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
  ];
}
