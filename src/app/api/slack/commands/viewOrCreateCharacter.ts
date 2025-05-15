import { GENERATE_CHARACTER_PROMPT } from '@/constants/prompts';
import { askAssitant } from '@/lib/openai';
import { postSlackEphemeral, postSlackMessage } from '@/lib/slack';
import { getBattlefield, getCharacter, createCharacter } from '@/lib/supabase';
import { respondEphemeral } from '@/lib/utils';
import { GeneratedCharacterData } from '@/types/types';

async function generateAndCreateCharacter(userId: string, channelId: string, battlefieldId: string) {
  const response = await askAssitant(GENERATE_CHARACTER_PROMPT);
  if (!response)
    postSlackEphemeral({
      channel: channelId,
      user: userId,
      text: 'Error generating character',
    });

  const character = JSON.parse(response!.replaceAll('```json', '').replaceAll('```', '')) as GeneratedCharacterData;

  console.log('Generated character', character);

  const { error } = await createCharacter(userId, battlefieldId, character);
  if (error)
    postSlackEphemeral({
      channel: channelId,
      user: userId,
      text: 'Error creating character',
    });

  postSlackEphemeral({
    channel: channelId,
    user: userId,
    text: 'Character created successfully.',
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
          text: `*Stats*\n• Vitalidad: ${character.stats.vitality}\n• Ataque: ${character.stats.attack}\n• Defensa: ${character.stats.defense}\n• Velocidad: ${character.stats.speed}\n• Suerte: ${character.stats.luck}`,
        },
      },
    ],
  });
}

async function respondCharacterView(userId: string, battlefieldId: string, character: SupabaseCharacter) {}

export default async function viewOrCreateCharacter(userId: string, channelId: string) {
  const { data: battlefield, error } = await getBattlefield(channelId);
  if (error) return respondEphemeral('Error getting battlefield');
  if (!battlefield) return respondEphemeral('No battlefield found. Please set a battlefield first.');

  const { data: character, error: getError } = await getCharacter(userId, battlefield.id);
  if (getError) return respondEphemeral('Error getting character.');

  if (!character) {
    generateAndCreateCharacter(userId, channelId, battlefield.id);
    return respondEphemeral('No character found. Creating character...');
  }

  return await respondCharacterView(userId, battlefield.id, character);
}
