import { NextResponse } from 'next/server';

export default function viewOrCreateCharacter(userId: string, channelId: string) {
  return NextResponse.json({
    response_type: 'ephemeral',
    text: 'Viewing or creating character...',
  });
}
