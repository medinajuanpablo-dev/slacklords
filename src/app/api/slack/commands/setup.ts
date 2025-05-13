import { getChannelMembers } from '@/lib/slack';
import { getChannelConfig } from '@/lib/supabase';
import { NextResponse } from 'next/server';

async function handleSetupCommand(command: string, userId: string, channelId: string) {
  console.log('Received command', { command, userId, channelId });

  const channelUsers = await getChannelMembers(channelId);
  const { channelConfig } = await getChannelConfig(channelId);

  const message = {
    text: '👋 Hi, do you wish to configure Daily Boxy?',
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: channelConfig
            ? '*Updating!* This will overwrite the current config for this channel'
            : "*👋 Hi!* Let's set up Daily Boxy for this channel",
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '_⚠ All fields are required_',
        },
      },
      {
        type: 'input',
        block_id: 'project-name',
        element: {
          type: 'plain_text_input',
          action_id: 'project-name',
        },
        label: {
          type: 'plain_text',
          text: 'Project Name',
        },
      },
      {
        type: 'input',
        block_id: 'participants',
        label: {
          type: 'plain_text',
          text: 'Selected participants (channel members selected by default)',
        },
        element: {
          type: 'multi_users_select',
          action_id: 'set-participants',
          initial_users: channelUsers,
          placeholder: {
            type: 'plain_text',
            text: 'Select users',
          },
        },
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'static_select',
            action_id: 'set-language',
            placeholder: { type: 'plain_text', text: 'Select Language' },
            options: [
              { text: { type: 'plain_text', text: 'Español' }, value: 'es' },
              { text: { type: 'plain_text', text: 'English' }, value: 'en' },
            ],
          },
          {
            type: 'static_select',
            action_id: 'set-time',
            placeholder: { type: 'plain_text', text: 'Time for the daily' },
            options: [
              { text: { type: 'plain_text', text: '09:00 AM' }, value: '09:00' },
              { text: { type: 'plain_text', text: '09:15 AM' }, value: '09:15' },
              { text: { type: 'plain_text', text: '09:30 AM' }, value: '09:30' },
              { text: { type: 'plain_text', text: '09:45 AM' }, value: '09:45' },
              { text: { type: 'plain_text', text: '10:00 AM' }, value: '10:00' },
              { text: { type: 'plain_text', text: '10:15 AM' }, value: '10:15' },
              { text: { type: 'plain_text', text: '10:30 AM' }, value: '10:30' },
              { text: { type: 'plain_text', text: '10:45 AM' }, value: '10:45' },
              { text: { type: 'plain_text', text: '11:00 AM' }, value: '11:00' },
              { text: { type: 'plain_text', text: '11:15 AM' }, value: '11:15' },
              { text: { type: 'plain_text', text: '11:30 AM' }, value: '11:30' },
              { text: { type: 'plain_text', text: '11:45 AM' }, value: '11:45' },
            ],
          },
          {
            type: 'button',
            text: { type: 'plain_text', text: 'Confirm' },
            action_id: 'confirm-setup',
            style: 'primary',
            value: `${channelId}|${userId}`,
          },
          ...(channelConfig
            ? [
                {
                  type: 'button',
                  text: { type: 'plain_text', text: "Delete this channel's config" },
                  action_id: 'delete-config',
                  style: 'danger',
                  value: `${channelId}`,
                  confirm: {
                    title: { type: 'plain_text', text: 'Are you sure?' },
                    text: { type: 'mrkdwn', text: `This will delete the current daily config for this channel.` },
                    confirm: { type: 'plain_text', text: 'Yes, delete it' },
                    deny: { type: 'plain_text', text: 'Cancel' },
                  },
                },
              ]
            : []),
        ],
      },
    ],
  };

  return NextResponse.json({ response_type: 'ephemeral', ...message });
}

export default handleSetupCommand;
