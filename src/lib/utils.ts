import { NextResponse } from 'next/server';
import { getBattlefield, getCharacter } from './supabase';

export function respondEphemeral(text: string) {
  return NextResponse.json({ response_type: 'ephemeral', text });
}

export async function getAndControlCharacter(userId: string, battlefieldId: string, existanceIsProblem = false) {
  const { data: character, error: getCharacterError } = await getCharacter(userId, battlefieldId);

  let problemMessage = null;

  if (getCharacterError) problemMessage = 'Error al obtener el personaje';
  if (!character) problemMessage = 'No se encontró personaje, crea uno primero con `/slacklords character`';
  if (existanceIsProblem && character) problemMessage = 'Ya hay un personaje creado en este campo de batalla.';

  return { character: character!, problemMessage };
}

export async function getAndControlBattlefield(channelId: string, existanceIsProblem = false) {
  const { data: battlefield, error: getBattlefieldError } = await getBattlefield(channelId);

  let problemMessage = null;

  if (getBattlefieldError) problemMessage = 'Error al obtener el campo de batalla';
  if (!battlefield) problemMessage = 'No se encontró campo de batalla, crea uno primero con `/slacklords battlefield`';
  if (existanceIsProblem && battlefield) problemMessage = 'Ya hay un campo de batalla configurado en este canal.';

  return { battlefield: battlefield!, problemMessage };
}

export async function getAndControlBattlefieldAndCharacter(userId: string, channelId: string) {
  let problemMessage = null;

  const { battlefield, problemMessage: getBattlefieldProblemMessage } = await getAndControlBattlefield(channelId);
  if (getBattlefieldProblemMessage) problemMessage = getBattlefieldProblemMessage;

  const { character, problemMessage: getCharacterProblemMessage } = await getAndControlCharacter(userId, battlefield.id);
  if (getCharacterProblemMessage) problemMessage = getCharacterProblemMessage;

  return { battlefield, character, problemMessage };
}
