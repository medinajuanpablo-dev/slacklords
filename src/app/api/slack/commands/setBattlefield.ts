import { postSlackMessage } from '@/lib/slack';
import { createBattlefield } from '@/lib/supabase';
import { getAndControlBattlefield, respondEphemeral } from '@/lib/utils';
import { NextResponse } from 'next/server';

export default async function setBattlefield(channelId: string) {
  const { problemMessage: getBattlefieldProblemMessage } = await getAndControlBattlefield(channelId, true);
  if (getBattlefieldProblemMessage) return respondEphemeral(getBattlefieldProblemMessage);

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
