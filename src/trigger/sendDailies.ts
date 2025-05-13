import { schedules } from '@trigger.dev/sdk/v3';
import { changeConfigStatus, getConfigsOfTime } from '@/lib/supabase';
import { postSlackMessage } from '@/lib/slack';
import { t } from '@/lib/i18n';
import { isHoliday } from '@/lib/utils';

export const sendDailies = schedules.task({
  id: 'send-daily-standups',
  cron: '*/15 9-11 * * 1-5',
  maxDuration: 300,
  run: async payload => {
    if (isHoliday(payload.timestamp)) {
      console.log('Today is a holiday, skipping dailies');
      return;
    }

    console.log('Checking dailies for time ', payload.timestamp);

    const configsOfTime = await getConfigsOfTime(payload.timestamp);

    if (configsOfTime.length > 0) {
      console.log('✅ Configs found, sending dailies and setting them as open', configsOfTime);

      for (const config of configsOfTime) {
        console.log('Processing config...', config);
        const { participants, project_name, channel_id } = config;

        await changeConfigStatus(channel_id, true);

        for (const userId of participants) {
          await postSlackMessage({
            channel: userId,
            blocks: [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: t('form.daily.title', { projectName: project_name }),
                },
              },
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: t('form.daily.subTitle'),
                },
              },
              {
                type: 'input',
                block_id: 'yesterday',
                element: {
                  type: 'plain_text_input',
                  multiline: true,
                  action_id: 'answer-yesterday',
                },
                label: {
                  type: 'plain_text',
                  text: t('form.daily.yesterdayField.label'),
                },
              },
              {
                type: 'input',
                block_id: 'today',
                element: {
                  type: 'plain_text_input',
                  multiline: true,
                  action_id: 'answer-today',
                },
                label: {
                  type: 'plain_text',
                  text: t('form.daily.todayField.label'),
                },
              },
              {
                type: 'input',
                block_id: 'blockers',
                element: {
                  type: 'plain_text_input',
                  multiline: true,
                  action_id: 'answer-blockers',
                },
                label: {
                  type: 'plain_text',
                  text: t('form.daily.blockersField.label'),
                },
              },
              {
                type: 'actions',
                elements: [
                  {
                    type: 'button',
                    text: {
                      type: 'plain_text',
                      text: t('form.daily.submitButton.text'),
                    },
                    action_id: 'submit-report',
                    style: 'primary',
                    value: `${config.channel_id}|${userId}`,
                  },
                ],
              },
            ],
          });

          console.log('Message sent to', { userId, channel: config.channel_id });
        }
      }
    }
  },
});
