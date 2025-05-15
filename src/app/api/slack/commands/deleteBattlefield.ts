import { getBattlefield } from '@/lib/supabase';
import { respondEphemeral } from '@/lib/utils';
import { NextResponse } from 'next/server';

export default async function deleteBattlefield(channelId: string) {
  const { data: battlefield, error: getError } = await getBattlefield(channelId);

  if (getError) return respondEphemeral('Error getting battlefield.');
  if (!battlefield) return respondEphemeral('No battlefield found in this channel.');

  return NextResponse.json({
    response_type: 'ephemeral',
    text: 'Are you sure you want to delete the battlefield?',
    blocks: [
      {
        type: 'section',
        text: { type: 'mrkdwn', text: '*Are you sure you want to delete the battlefield?*' },
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: 'Yes, delete it' },
            action_id: 'confirm-delete-battlefield',
            style: 'danger',
          },
          {
            type: 'button',
            text: { type: 'plain_text', text: 'No, cancel' },
            action_id: 'cancel-delete-battlefield',
          },
        ],
      },
    ],
  });
}
