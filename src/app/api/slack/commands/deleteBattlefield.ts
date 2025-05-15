import { postSlackMessage } from '@/lib/slack';
import { getBattlefield, removeBattlefield } from '@/lib/supabase';
import { respondEphemeral } from '@/lib/utils';

export default async function deleteBattlefield(channelId: string) {
  const { data: battlefield, error: getError } = await getBattlefield(channelId);

  if (getError) return respondEphemeral('Error getting battlefield.');
  if (!battlefield) return respondEphemeral('No battlefield found in this channel.');

  const { error: deleteError } = await removeBattlefield(channelId);

  if (deleteError) return respondEphemeral('Error deleting battlefield.');

  postSlackMessage({
    channel: channelId,
    blocks: [{ type: 'section', text: { type: 'mrkdwn', text: 'Battlefield deleted from this channel. No more battles here :(' } }],
  });

  return respondEphemeral('Battlefield deleted.');
}
