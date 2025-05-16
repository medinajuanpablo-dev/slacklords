import { postSlackMessage } from '@/lib/slack';
import { createBattlefield, getBattlefield } from '@/lib/supabase';
import { respondEphemeral } from '@/lib/utils';
import { NextResponse } from 'next/server';

export default async function setBattlefield(channelId: string) {
  const { data: battlefield, error: getError } = await getBattlefield(channelId);
  if (getError) return respondEphemeral('Error para obtener el campo de batalla.');
  if (battlefield) return respondEphemeral('Ya hay un campo de batalla configurado en este canal.');

  const { error: createError } = await createBattlefield(channelId);

  if (createError) return respondEphemeral('Error para configurar el campo de batalla.');

  postSlackMessage({
    channel: channelId,
    blocks: [
      {
        type: 'section',
        text: { type: 'mrkdwn', text: '*Un campo de batalla ha sido configurado en este canal*. ¡Comienza el juego!' },
      },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: 'Para crear un personaje, usa el comando `/slacklords character`.' },
      },
    ],
  });

  return NextResponse.json({ response_type: 'ephemeral', text: 'Campo de batalla configurado' });
}
