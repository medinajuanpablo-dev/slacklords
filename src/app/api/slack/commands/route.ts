import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'querystring';
import { IS_DEVELOPMENT } from '@/constants/constants';
import handleSetupCommand from './setup';
import { handleVersionCommand } from './version';

export async function POST(req: NextRequest) {
  const bodyText = await req.text();
  const body = parse(bodyText);

  const command = body.command as string;
  const userId = body.user_id as string;
  const channelId = body.channel_id as string;

  console.log('Received command', { command, userId, channelId });

  if (command === '/setup-dailybot' || (IS_DEVELOPMENT && command === '/dev-boxy-standup-add-config'))
    return handleSetupCommand(command, userId, channelId);

  if (command == '/dailybot-version' || (IS_DEVELOPMENT && command == '/dev-boxy-standup-version')) return handleVersionCommand();

  return NextResponse.json({
    response_type: 'ephemeral',
    text: 'Comando no reconocido.',
  });
}
