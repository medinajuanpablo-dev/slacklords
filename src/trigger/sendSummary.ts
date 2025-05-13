import OpenAI from 'openai';
import { schedules } from '@trigger.dev/sdk/v3';
import { changeConfigStatus, getConfigsOfTime, getTodayUserReportForConfig } from '@/lib/supabase';
import { postSlackMessage } from '@/lib/slack';
import { GENERATE_REPORTS_SUMMARY_PROMPT, LANGUAGE_PROMPT_ADDITION } from '@/constants/prompts';
import { HOURS_UNTIL_DAILY_CLOSED, OPENAI_API_KEY } from '@/constants/constants';
import i18n, { t } from '@/lib/i18n';
import { isHoliday } from '@/lib/utils';

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

async function getAndPostAISummary({ channelId, allReportsJSON }: { channelId: string; allReportsJSON: string[] }) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant that summarizes daily standup reports from team members into one concise update.',
      },
      {
        role: 'user',
        content: GENERATE_REPORTS_SUMMARY_PROMPT + `\n\n>>${LANGUAGE_PROMPT_ADDITION[i18n.language]}<<`,
      },
      {
        role: 'user',
        content: allReportsJSON.join('\n\n'),
      },
    ],
  });

  const summary = response.choices[0].message.content;
  console.log('🤖 GPT Summary:', summary);

  await postSlackMessage({
    channel: channelId,
    text: `\n\n${t('aiSummary.title')}\n\n${summary}`,
  });
}

async function getAndPostUserReport({
  channelId,
  configId,
  userId,
  threadTs,
}: {
  channelId: string;
  configId: number;
  userId: string;
  threadTs: string;
}) {
  const data = await getTodayUserReportForConfig(userId, configId);
  if (!data) return;

  const { yesterday, today, blockers } = data.content;

  await postSlackMessage({
    channel: channelId,
    thread_ts: threadTs,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: t('userReport.title', { userId }),
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: t('userReport.yesterday', { yesterday: yesterday || t('userReport.noAnswer') }),
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: t('userReport.today', { today: today || t('userReport.noAnswer') }),
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: t('userReport.blockers', { blockers: blockers || t('userReport.noAnswer') }),
        },
      },
    ],
  });

  return data.content;
}

export const sendSummary = schedules.task({
  id: 'send-dailies-summary',
  cron: '*/15 9-11 * * 1-5',
  maxDuration: 300,
  run: async payload => {
    if (isHoliday(payload.timestamp)) {
      console.log('Today is a holiday, skipping summary');
      return;
    }

    const before = new Date(payload.timestamp);
    before.setHours(before.getHours() - HOURS_UNTIL_DAILY_CLOSED);

    console.log('Checking dailies for time ', before);

    const justClosedConfigsOfTime = await getConfigsOfTime(before);

    if (justClosedConfigsOfTime.length > 0) {
      console.log('✅ Just closed configs found, sending summary, notifications and setting them as closed', justClosedConfigsOfTime);

      for (const justClosedConfig of justClosedConfigsOfTime) {
        console.log('Processing just closed config...', justClosedConfig);
        const { id: configId, participants, project_name, channel_id } = justClosedConfig;

        await changeConfigStatus(channel_id, false);

        const { ts: threadTs } = await postSlackMessage({
          channel: channel_id,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: t('reportsList.title', { projectName: project_name }),
              },
            },
          ],
        });

        const allReportsJSON = [];

        for (const userId of participants) {
          await postSlackMessage({
            channel: userId,
            blocks: [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: t('notification.dailyClosed', { projectName: project_name }),
                },
              },
            ],
          });

          const userReport = await getAndPostUserReport({ channelId: channel_id, configId, userId, threadTs });
          allReportsJSON.push(JSON.stringify(userReport ? { userId, ...userReport } : { userId }));
        }

        await getAndPostAISummary({ channelId: channel_id, allReportsJSON });
      }
    }
  },
});
