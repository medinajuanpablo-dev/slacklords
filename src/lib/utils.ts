import { NextResponse } from 'next/server';

export function respondEphemeral(text: string) {
  return NextResponse.json({ response_type: 'ephemeral', text });
}
