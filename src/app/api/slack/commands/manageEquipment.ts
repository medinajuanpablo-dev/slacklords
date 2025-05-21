import { getAndControlBattlefieldAndCharacter, respondEphemeral } from '@/lib/utils';
import { NextResponse } from 'next/server';

export default async function manageEquipment(userId: string, channelId: string) {
  const { character, problemMessage } = await getAndControlBattlefieldAndCharacter(userId, channelId);
  if (problemMessage) return respondEphemeral(problemMessage);

  return NextResponse.json({
    response_type: 'ephemeral',
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Equipo de ${character.name}*`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `👤 *Casco*: ${character.equipment.helmet?.name || 'Vacío'}`,
        },
        ...(character.equipment.helmet && {
          accessory: {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Quitar',
              emoji: true,
            },
            value: 'change_helmet',
          },
        }),
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `🛡️ *Armadura*: ${character.equipment.armor?.name || 'Vacío'}`,
        },
        ...(character.equipment.armor && {
          accessory: {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Quitar',
              emoji: true,
            },
            value: 'change_armor',
          },
        }),
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `🗡️ *Arma*: ${character.equipment.weapon?.name || 'Vacío'}`,
        },
        ...(character.equipment.weapon && {
          accessory: {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Quitar',
              emoji: true,
            },
            value: 'change_weapon',
          },
        }),
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `💍 *Joya 1*: ${character.equipment.jewel1?.name || 'Vacío'}`,
        },
        ...(character.equipment.jewel1 && {
          accessory: {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Quitar',
              emoji: true,
            },
            value: 'change_jewel',
          },
        }),
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `💍 *Joya 2*: ${character.equipment.jewel2?.name || 'Vacío'}`,
        },
        ...(character.equipment.jewel2 && {
          accessory: {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Quitar',
              emoji: true,
            },
            value: 'change_jewel',
          },
        }),
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `🪛 *Accesorio 1*: ${character.equipment.accessory1?.name || 'Vacío'}`,
        },
        ...(character.equipment.accessory1 && {
          accessory: {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Quitar',
              emoji: true,
            },
            value: 'change_accessory',
          },
        }),
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `🪛 *Accesorio 2*: ${character.equipment.accessory2?.name || 'Vacío'}`,
        },
        ...(character.equipment.accessory2 && {
          accessory: {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Quitar',
              emoji: true,
            },
            value: 'change_accessory',
          },
        }),
      },
    ],
  });
}
