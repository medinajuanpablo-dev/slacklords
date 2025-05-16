import { getBattlefield } from '@/lib/supabase';
import { respondEphemeral } from '@/lib/utils';
import { NextResponse } from 'next/server';

export default async function deleteBattlefield(channelId: string) {
  const { data: battlefield, error: getError } = await getBattlefield(channelId);

  if (getError) return respondEphemeral('Error para obtener el campo de batalla.');
  if (!battlefield) return respondEphemeral('No se encontró un campo de batalla en este canal.');

  return NextResponse.json({
    response_type: 'ephemeral',
    text: '¿Estás seguro de querer eliminar el campo de batalla?',
    blocks: [
      {
        type: 'section',
        text: { type: 'mrkdwn', text: '*¿Estás seguro de querer eliminar el campo de batalla?*' },
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: 'Sí, eliminarlo' },
            action_id: 'confirm-delete-battlefield',
            style: 'danger',
          },
          {
            type: 'button',
            text: { type: 'plain_text', text: 'No, cancelar' },
            action_id: 'cancel-delete-battlefield',
          },
        ],
      },
    ],
  });
}
