import { OPENAI_API_KEY } from '@/constants/constants';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

export async function askAssitant(...prompts: string[]) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant that helps build funny and engaging characters and battles for a Slack App simple game.',
      },
      ...prompts.map(prompt => ({
        role: 'user' as const,
        content: prompt,
      })),
    ],
  });

  return response?.choices[0]?.message?.content;
}
