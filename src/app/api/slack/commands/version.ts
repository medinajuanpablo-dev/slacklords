import { NextResponse } from 'next/server';
import packageJson from '../../../../../package.json';

export async function handleVersionCommand() {
  const message = {
    text: `Daily Bot AI version ${packageJson.version}`,
  };

  return NextResponse.json({ response_type: 'ephemeral', ...message });
}
