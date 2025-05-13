/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'querystring';

import { deleteChannelConfig, getChannelConfig, saveChannelConfig, saveReport } from '@/lib/supabase';
import { getSlackUserInfo, postSlackMessage } from '@/lib/slack';
import i18n, { t } from '@/lib/i18n';
import { convertLocalTimeToUTC } from '@/lib/utils';

function getBlockValue(stateValues: any, blockName: string) {
  const blockValue = Object.values(stateValues).find((block: any) => block[blockName]) as any;
  return blockValue[blockName];
}

async function confirmSetup(payload: any) {
  const userId = payload.user.id;
  const channelId = payload.channel.id;
  const stateValues = payload.state?.values || {};

  const userInfo = await getSlackUserInfo(userId);
  const userTimezone = userInfo.tz || 'UTC';

  const projectName = getBlockValue(stateValues, 'project-name')?.value;
  const participants = getBlockValue(stateValues, 'set-participants')?.selected_users || [];
  const language = getBlockValue(stateValues, 'set-language')?.selected_option?.value;
  const time = getBlockValue(stateValues, 'set-time')?.selected_option?.value;

  console.log('utcTime ', { userTimezone, time }, convertLocalTimeToUTC(time, userTimezone));

  const { error: saveError, isNew } = await saveChannelConfig({
    channelId,
    creatorUserId: userId,
    projectName,
    participants,
    language,
    utcTime: convertLocalTimeToUTC(time, userTimezone),
  });
  if (saveError) return;

  i18n.changeLanguage(language);

  await postSlackMessage({
    channel: channelId,
    text: t(`notification.${isNew ? 'confirmSetup' : 'updatedSetup'}`, {
      time,
      projectName,
    }),
  });

  await deleteSlackMessage(channelId, payload.message.ts);

  return NextResponse.json({ response_action: 'clear' });
}

async function deleteConfig(payload: any) {
  const channelId = payload.channel.id;

  await deleteChannelConfig(channelId);

  await postSlackMessage({
    channel: channelId,
    text: t('notification.deletedConfig'),
  });
}

async function submitReport(payload: any) {
  const userId = payload.user.id;
  const state = payload.state?.values;

  const rawValue = payload.actions?.[0]?.value;
  const channelId = (rawValue?.split('|') || [])[0];

  const { channelConfig } = await getChannelConfig(channelId);
  if (!channelConfig.is_open) {
    await postSlackMessage({
      channel: userId,
      text: t('notification.reportRejected', {
        projectName: channelConfig.project_name,
      }),
    });
    return NextResponse.json({ response_action: 'clear' });
  }

  const yesterday = state?.yesterday?.['answer-yesterday']?.value;
  const today = state?.today?.['answer-today']?.value;
  const blockers = state?.blockers?.['answer-blockers']?.value;
  const content = { yesterday, today, blockers };

  const { isNew } = await saveReport({ channelId, userId, content });

  await postSlackMessage({
    channel: userId,
    text: isNew ? t('notification.reportSubmitted') : t('notification.reportUpdated'),
  });

  return NextResponse.json({ response_action: 'clear' });
}

export async function POST(req: NextRequest) {
  const bodyText = await req.text();
  const parsed = parse(bodyText);
  const payload = JSON.parse(parsed.payload as string);

  if (payload.type === 'block_actions') {
    const action = payload.actions[0];

    switch (action.action_id) {
      case 'confirm-setup':
        return await confirmSetup(payload);
      case 'delete-config':
        return await deleteConfig(payload);
      case 'submit-report':
        return await submitReport(payload);
    }
  }

  return NextResponse.json({ status: 'ignored' });
}
