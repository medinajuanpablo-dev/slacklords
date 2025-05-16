import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'querystring';
import setBattlefield from './setBattlefield';
import manageCharacter from './manageCharacter';
import deleteBattlefield from './deleteBattlefield';
import manageEquipment from './manageEquipment';
import manageHelp from './manageHelp';
import addItemsFromJSON from './addItems';
import manageStore from './manageStore';

const UNRECOGNIZED_RESPONSE = NextResponse.json({
  response_type: 'ephemeral',
  text: 'Comando no reconocido. Por favor, usa `/slacklords help` para ver los comandos disponibles.',
});

export async function POST(req: NextRequest) {
  const bodyText = await req.text();
  const body = parse(bodyText);

  const command = body.command as string;
  const [firstArgument, secondArgument] = (body.text as string).split(' ');
  const userId = body.user_id as string;
  const channelId = body.channel_id as string;

  console.log('Received command', { command, userId, channelId, body });

  if (command !== '/slacklords') return UNRECOGNIZED_RESPONSE;

  switch (firstArgument) {
    case 'battlefield set':
      return setBattlefield(channelId);
    case 'battlefield delete':
      return deleteBattlefield(channelId);
    case 'character':
      return manageCharacter(userId, channelId, secondArgument);
    case 'equipment':
      return manageEquipment(userId, channelId);
    case 'store':
      return manageStore(userId, channelId, secondArgument);

    case 'add-items-secret-AJWJ2912H##F':
      return addItemsFromJSON();
    case 'help':
      return manageHelp();

    default:
      return UNRECOGNIZED_RESPONSE;
  }
}
