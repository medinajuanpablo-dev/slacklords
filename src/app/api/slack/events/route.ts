import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { SLACK_SIGNING_SECRET } from '@/constants/constants';

async function verifySlackRequest(req: NextRequest) {
  const timestamp = req.headers.get('x-slack-request-timestamp');
  const signature = req.headers.get('x-slack-signature');

  if (!timestamp || !signature) return { rawBody: null, isVerified: false };

  const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 60 * 5;
  if (parseInt(timestamp) < fiveMinutesAgo) return { rawBody: null, isVerified: false };

  const rawBody = await req.text();
  const sigBaseString = `v0:${timestamp}:${rawBody}`;
  const hmac = crypto.createHmac('sha256', SLACK_SIGNING_SECRET);
  hmac.update(sigBaseString);
  const mySignature = `v0=${hmac.digest('hex')}`;

  return {
    rawBody,
    isVerified: crypto.timingSafeEqual(Buffer.from(mySignature, 'utf8'), Buffer.from(signature, 'utf8')),
  };
}

export async function POST(req: NextRequest) {
  const { rawBody, isVerified } = await verifySlackRequest(req);
  if (!isVerified || !rawBody) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const body = JSON.parse(rawBody);

  if (body.type === 'url_verification') {
    return NextResponse.json({ challenge: body.challenge });
  }

  if (body.type === 'event_callback') {
    const event = body.event;

    if (event.type === 'message' && !event.bot_id) {
      console.log('Nuevo mensaje recibido:', event.text);
      console.log('De usuario:', event.user);
      console.log('En canal:', event.channel);
    }
  }

  if (body.type === 'block_actions') return NextResponse.json({ response_action: 'clear' });

  return NextResponse.json({ response_action: 'clear' });
}
