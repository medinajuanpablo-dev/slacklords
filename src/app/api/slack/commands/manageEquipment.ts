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
          text: `*Equipo de ${character.name}*          
          • Casco: ${character.equipment.helmet?.name || 'Ninguno'}
          • Armadura: ${character.equipment.armor?.name || 'Ninguna'}
          • Arma: ${character.equipment.weapon?.name || 'Ninguna'}
          • Accesorio: ${character.equipment.jewel?.name || 'Ninguno'}`,
        },
      },
    ],
  });
}
