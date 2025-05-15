import { postSlackMessage, sendResponse } from '@/lib/slack';
import { removeBattlefield } from '@/lib/supabase';

export default async function handleDeleteBattlefield(channelId: string, actionId: string, responseUrl: string) {
  console.log('Handling delete battlefield for channel', { channelId, actionId });

  if (actionId === 'cancel-delete-battlefield')
    return sendResponse(responseUrl, { replace_original: 'true', text: 'Battlefield deletion cancelled.' });

  if (actionId === 'confirm-delete-battlefield') {
    const { error } = await removeBattlefield(channelId);

    if (error) return sendResponse(responseUrl, { replace_original: 'true', text: 'Error deleting battlefield.' });

    postSlackMessage({
      channel: channelId,
      blocks: [
        {
          type: 'section',
          text: { type: 'mrkdwn', text: '*Battlefield deleted from this channel.* No more battles here :(' },
        },
      ],
    });

    return sendResponse(responseUrl, { delete_original: 'true' });
  }
}
