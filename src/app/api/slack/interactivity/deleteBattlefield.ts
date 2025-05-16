import { postSlackMessage, sendSlackResponse } from '@/lib/slack';
import { removeBattlefield } from '@/lib/supabase';

export default async function handleDeleteBattlefield(channelId: string, actionId: string, responseUrl: string) {
  console.log('Handling delete battlefield for channel', { channelId, actionId });

  if (actionId === 'cancel-delete-battlefield')
    return sendSlackResponse(responseUrl, { replace_original: 'true', text: 'Eliminación de campo de batalla cancelada.' });

  if (actionId === 'confirm-delete-battlefield') {
    const { error } = await removeBattlefield(channelId);

    if (error) return sendSlackResponse(responseUrl, { replace_original: 'true', text: 'Error al eliminar el campo de batalla.' });

    postSlackMessage({
      channel: channelId,
      blocks: [
        {
          type: 'section',
          text: { type: 'mrkdwn', text: '*Campo de batalla eliminado de este canal.* No más batallas aquí :(' },
        },
      ],
    });

    return sendSlackResponse(responseUrl, { delete_original: 'true' });
  }
}
