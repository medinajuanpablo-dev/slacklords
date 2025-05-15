/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'querystring';

export async function POST(req: NextRequest) {
  const bodyText = await req.text();
  const parsed = parse(bodyText);
  const payload = JSON.parse(parsed.payload as string);

  console.log('Interactivity payload', payload);

  if (payload.type === 'block_actions') {
  }

  return NextResponse.json({ status: 'ignored' });
}
