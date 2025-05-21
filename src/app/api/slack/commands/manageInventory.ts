import { getAndControlBattlefieldAndCharacter, respondEphemeral } from '@/lib/utils';
import { ItemType } from '@/types/types';
import { NextResponse } from 'next/server';

export async function manageInventory(userId: string, channelId: string) {
  const { character, problemMessage } = await getAndControlBattlefieldAndCharacter(userId, channelId);
  if (problemMessage) return respondEphemeral(problemMessage);

  const { inventory } = character;

  return NextResponse.json({
    response_type: 'ephemeral',
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*Inventario*',
        },
      },
      {
        type: 'divider',
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `💰 *${character.gold}*`,
        },
      },
      ...(inventory.length === 0
        ? [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: '_Sin items_',
              },
            },
          ]
        : inventory.map(item => {
            const isConsumable = item.effect_data.type === ItemType.CONSUMABLE;

            return {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*${item.name}*\n\n${item.description}`,
              },
              ...(isConsumable
                ? {
                    accessory: {
                      type: 'button',
                      text: {
                        type: 'plain_text',
                        text: 'Usar',
                        emoji: true,
                      },
                      value: `use_item|${item.id}`,
                    },
                  }
                : {
                    accessory: {
                      type: 'button',
                      text: {
                        type: 'plain_text',
                        text: 'Equipar',
                        emoji: true,
                      },
                      value: `equip_item|${item.id}`,
                    },
                  }),
            };
          })),
    ],
  });
}
