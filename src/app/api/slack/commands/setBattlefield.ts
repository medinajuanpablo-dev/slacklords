import { postSlackMessage } from '@/lib/slack';
import { createBattlefield, getBattlefield } from '@/lib/supabase';
import { respondEphemeral } from '@/lib/utils';
import { NextResponse } from 'next/server';

export default async function setBattlefield(channelId: string) {
  const { data: battlefield, error: getError } = await getBattlefield(channelId);

  if (getError) return respondEphemeral('Error getting battlefield.');
  if (battlefield) return respondEphemeral('A Battlefield is already set up in this channel.');

  const { error: createError } = await createBattlefield(channelId);

  if (createError) return respondEphemeral('Error setting battlefield.');

  postSlackMessage({
    channel: channelId,
    blocks: [
      {
        type: 'section',
        text: { type: 'mrkdwn', text: '*A Battlefield has been set up in this channel*. Let the games begin!' },
      },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: 'To create a character, use the `/slacklords character` command.' },
      },
    ],
  });

  return NextResponse.json({ response_type: 'ephemeral', text: 'Battlefield set' });
}
