import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'querystring';
import setBattlefield from './setBattlefield';
import viewOrCreateCharacter from './viewOrCreateCharacter';
import deleteBattlefield from './deleteBattlefield';

const UNRECOGNIZED_RESPONSE = NextResponse.json({
  response_type: 'ephemeral',
  text: 'Unrecognized command.',
});

export async function POST(req: NextRequest) {
  const bodyText = await req.text();
  const body = parse(bodyText);

  const command = body.command as string;
  const argument = body.text as string;
  const userId = body.user_id as string;
  const channelId = body.channel_id as string;

  console.log('Received command', { command, userId, channelId, body });

  if (command !== '/slacklords') return UNRECOGNIZED_RESPONSE;

  switch (argument) {
    case 'battlefield set':
      return setBattlefield(channelId);
    case 'battlefield delete':
      return deleteBattlefield(channelId);
    case 'character':
      return viewOrCreateCharacter(userId, channelId);

    default:
      return UNRECOGNIZED_RESPONSE;
  }
}
