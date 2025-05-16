import { NextResponse } from 'next/server';

export default async function manageHelp() {
  return NextResponse.json({
    response_type: 'ephemeral',
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text:
            '*Comandos disponibles*\n\n' +
            '• `/slacklords battlefield set` - Crea un campo de batalla en el canal actual\n' +
            '• `/slacklords battlefield delete` - Elimina el campo de batalla del canal actual\n' +
            '• `/slacklords character` - Crea un personaje o muestra tu personaje actual\n' +
            '• `/slacklords character story` - Muestra la historia de tu personaje\n' +
            '• `/slacklords character kill` - Mata a tu personaje :(\n' +
            '• `/slacklords equipment` - Muestra el equipo de tu personaje\n' +
            '• `/slacklords help` - Muestra este mensaje de ayuda',
        },
      },
    ],
  });
}
