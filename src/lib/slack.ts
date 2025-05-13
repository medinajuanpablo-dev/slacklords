/* eslint-disable @typescript-eslint/no-explicit-any */
import { SLACK_BOT_TOKEN } from '@/constants/constants';

export async function postSlackMessage(body: any): Promise<any> {
  const res = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!data.ok) {
    console.error('❌ Error posting message to Slack:', data.error);
    throw new Error(data.error);
  }

  return data;
}

export async function getSlackUserInfo(userId: string) {
  console.log('getSlackUserInfo', { userId });

  const res = await fetch(`https://slack.com/api/users.info?user=${userId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await res.json();

  if (!data.ok) {
    console.error('❌ Error fetching Slack user info:', data.error);
    throw new Error(data.error);
  }

  return data.user;
}

export async function getChannelMembers(channelId: string): Promise<string[]> {
  const res = await fetch('https://slack.com/api/conversations.members', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      channel: channelId,
    }),
  });

  const data = await res.json();

  if (!data.ok) {
    console.error('Error al obtener miembros del canal:', data.error);
    return [];
  }

  return data.members;
}

export async function deleteSlackMessage(channel: string, ts: string): Promise<any> {
  const res = await fetch('https://slack.com/api/chat.delete', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ channel, ts }),
  });

  const data = await res.json();

  if (!data.ok) {
    console.error('❌ Error deleting message from Slack:', data.error);
    throw new Error(data.error);
  }

  return data;
}
