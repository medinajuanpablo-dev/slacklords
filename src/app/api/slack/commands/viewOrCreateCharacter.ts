import { GENERATE_CHARACTER_PROMPT } from '@/constants/prompts';
import { askAssitant } from '@/lib/openai';
import { postSlackEphemeral, postSlackMessage } from '@/lib/slack';
import { getBattlefield, getCharacter, createCharacter } from '@/lib/supabase';
import { respondEphemeral } from '@/lib/utils';
import { GeneratedCharacterData, SupabaseCharacter } from '@/types/types';
import { NextResponse } from 'next/server';

async function generateAndCreateCharacter(userId: string, channelId: string, battlefieldId: string) {
  const response = await askAssitant(GENERATE_CHARACTER_PROMPT);
  if (!response)
    postSlackEphemeral({
      channel: channelId,
      user: userId,
      text: 'Error al generar el personaje',
    });

  const character = JSON.parse(response!.replaceAll('```json', '').replaceAll('```', '')) as GeneratedCharacterData;

  console.log('Generated character', character);

  const { error } = await createCharacter(userId, battlefieldId, character);
  if (error)
    postSlackEphemeral({
      channel: channelId,
      user: userId,
      text: 'Error al crear el personaje',
    });

  postSlackEphemeral({
    channel: channelId,
    user: userId,
    text: 'Personaje creado! Para ver tu personaje, usa `/slacklords character`.',
  });

  postSlackMessage({
    channel: channelId,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `_Un nuevo personaje se ha unido a la fiesta de la mano de <@${userId}>_: *${character.name}*`,
        },
      },
      {
        type: 'divider',
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `${character.story}\n`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Stats*
          • Vitalidad: ${character.stats.vitality}
          • Ataque: ${character.stats.attack}
          • Defensa: ${character.stats.defense}
          • Velocidad: ${character.stats.speed}
          • Suerte: ${character.stats.luck}`,
        },
      },
    ],
  });
}

async function respondCharacterView(character: SupabaseCharacter) {
  return NextResponse.json({
    response_type: 'ephemeral',
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `Perfil de *${character.name}*`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Stats*
          • Vitalidad: ${character.stats.vitality}
          • Ataque: ${character.stats.attack}
          • Defensa: ${character.stats.defense}
          • Velocidad: ${character.stats.speed}
          • Suerte: ${character.stats.luck}`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'Para ver el equipo o la historia, usa `/slacklords character story`.',
        },
      },
    ],
  });
}

async function respondCharacterStory(character: SupabaseCharacter) {
  return NextResponse.json({
    response_type: 'ephemeral',
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Historia de ${character.name}*
          
          ${character.story}`,
        },
      },
    ],
  });
}

export default async function viewOrCreateCharacter(userId: string, channelId: string, argument: string) {
  const { data: battlefield, error } = await getBattlefield(channelId);
  if (error) return respondEphemeral('Error para obtener el campo de batalla');
  if (!battlefield) return respondEphemeral('No se encontró un campo de batalla. Por favor, configura un campo de batalla primero.');

  const { data: character, error: getError } = await getCharacter(userId, battlefield.id);
  if (getError) return respondEphemeral('Error para obtener el personaje.');

  if (!character) {
    generateAndCreateCharacter(userId, channelId, battlefield.id);
    return respondEphemeral('No se encontró un personaje. Creando personaje...');
  }

  if (argument === 'story') return await respondCharacterStory(character);
  if (!argument) return await respondCharacterView(character);

  return respondEphemeral('Argumento no reconocido. Por favor, usa `/slacklords character` para ver tu personaje.');
}
