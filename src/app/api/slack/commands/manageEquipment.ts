import { getBattlefield, getCharacter } from '@/lib/supabase';
import { respondEphemeral } from '@/lib/utils';
import { NextResponse } from 'next/server';

export default async function manageEquipment(userId: string, channelId: string) {
  const { data: battlefield, error: getBattlefieldError } = await getBattlefield(channelId);
  if (getBattlefieldError) return respondEphemeral('Error para obtener el campo de batalla.');
  if (!battlefield) return respondEphemeral('No se encontró un campo de batalla. Por favor, configura un campo de batalla primero.');

  const { data: character, error: getCharacterError } = await getCharacter(userId, battlefield.id);
  if (getCharacterError) return respondEphemeral('Error para obtener el personaje.');

  if (!character)
    return respondEphemeral('No se encontró un personaje. Por favor, crea un personaje primero con `/slacklords character`.');

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
    ],
  });
}
