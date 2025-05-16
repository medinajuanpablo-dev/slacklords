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
          • ❤️ *Vitalidad*: ${character.stats.vitality}
          • 💥 *Ataque*: ${character.stats.attack}
          • 🛡️ *Defensa*: ${character.stats.defense}
          • 🏃 *Velocidad*: ${character.stats.speed}
          • 🍀 *Suerte*: ${character.stats.luck}`,
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
          text: `*Stats*`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `❤️ *Vitalidad*: ${character.stats.vitality}`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `💥 *Ataque*: ${character.stats.attack}`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `🛡️ *Defensa*: ${character.stats.defense}`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `🏃 *Velocidad*: ${character.stats.speed}`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `🍀 *Suerte*: ${character.stats.luck}`,
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

async function respondCharacterKillAsk(character: SupabaseCharacter) {
  return NextResponse.json({
    response_type: 'ephemeral',
    text: `¿Estás seguro de querer eliminar a ${character.name}?`,
    blocks: [
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `*¿Estás seguro de querer matar a ${character.name}?*` },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'Esto no se puede deshacer y se publicará un aviso del suicidio. Después de eliminarlo podrás crear un nuevo personaje.',
        },
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: 'Sí, eliminarlo' },
            action_id: `confirm-delete-character|${character.id}`,
            style: 'danger',
          },
          {
            type: 'button',
            text: { type: 'plain_text', text: 'No, cancelar' },
            action_id: 'cancel-delete-character',
          },
        ],
      },
    ],
  });
}
export default async function manageCharacter(userId: string, channelId: string, argument: string) {
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
  if (argument === 'kill') return await respondCharacterKillAsk(character);
  if (!argument) return await respondCharacterView(character);

  return respondEphemeral('Argumento no reconocido. Por favor, usa `/slacklords character` para ver tu personaje.');
}
