import { postSlackMessage, sendSlackResponse } from '@/lib/slack';
import { deleteCharacter, getCharacterById } from '@/lib/supabase';

export default async function handleDeleteCharacter(channelId: string, actionId: string, responseUrl: string) {
  console.log('Handle delete char', { channelId, actionId, responseUrl });

  if (actionId === 'cancel-delete-character')
    return sendSlackResponse(responseUrl, { replace_original: 'true', text: 'Eliminación de personaje cancelada.' });

  if (actionId.includes('confirm-delete-character')) {
    const characterId = actionId.split('|')[1];
    const { data: character, error: getCharacterError } = await getCharacterById(characterId);
    if (getCharacterError) return sendSlackResponse(responseUrl, { replace_original: 'true', text: 'Error al obtener el personaje.' });

    const { error: deleteError } = await deleteCharacter(characterId);
    if (deleteError) return sendSlackResponse(responseUrl, { replace_original: 'true', text: 'Error al eliminar el personaje.' });

    postSlackMessage({
      channel: channelId,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*⚠️ TRAGEDIA! ⚠️*\n\n *${character.name}* de <@${character.user_id}> no soportó y eligió el camino de su propia destrucción ☠ No l@ veremos más por aquí.`,
          },
        },
      ],
    });

    return sendSlackResponse(responseUrl, { delete_original: 'true' });
  }

  return sendSlackResponse(responseUrl, { replace_original: 'true', text: 'Acción no válida.' });
}
