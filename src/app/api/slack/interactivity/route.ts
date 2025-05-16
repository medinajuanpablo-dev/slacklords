import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'querystring';
import handleDeleteBattlefield from './deleteBattlefield';
import handleDeleteCharacter from './handleDeleteCharacter';

export async function POST(req: NextRequest) {
  const bodyText = await req.text();
  const parsed = parse(bodyText);
  const payload = JSON.parse(parsed.payload as string);

  const action = payload.actions[0];
  const actionId = action.action_id;

  console.log('Interactivity payload', payload);

  if (payload.type === 'block_actions') {
    if (actionId.includes('delete-battlefield')) {
      return await handleDeleteBattlefield(payload.channel.id, actionId, payload.response_url);
    }
    if (actionId.includes('delete-character')) {
      return await handleDeleteCharacter(payload.channel.id, actionId, payload.response_url);
    }
  }

  return NextResponse.json({ status: 'ignored' });
}
