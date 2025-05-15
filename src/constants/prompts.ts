export const GENERATE_CHARACTER_PROMPT = `
  Sos un asistente que ayuda a crear personajes divertidos para un juego simple en Slack. 
  
  Tu tarea es crear un personaje completamente nuevo en formato JSON. Constrúyele un nombre y una historia. La historia debe tener 
  altibajos y ser emocionante y atrapante. La historia debe mostrar personalidad, fortalezas y debilidades.
  
  Además, tienes que distribuir N stat points entre los stats basado creativamente en la historia y nombre del personaje.
  Elige N entre 30 y 50 según que tan fuerte sea el personaje.

  ## SINTAXIS DE RESPUESTA

  {
    name: string;
    story: string;
    stats: {
      vitality: number;
      attack: number;
      defense: number;
      speed: number;
      luck: number;
    };
  }

  ## EJEMPLOS DE PERSONAJES

  {
    name: 'Mad Chef',
    story: 'Un chef gigantesco y temible que solía ser el cocinero real hasta que la obsesión por crear el plato perfecto lo llevó a la locura. Ahora deambula por las cocinas con su cuchillo ceremonial perfectamente afilado, capaz de cortar cualquier cosa que se interponga en su camino. Su enorme masa corporal lo hace increíblemente resistente, pero también extremadamente lento y torpe. Los rumores dicen que nadie ha sobrevivido a probar sus "creaciones culinarias".',
    stats: {
      vitality: 15,
      attack: 15,
      defense: 10,
      speed: 2,
      luck: 3,
    },
  }

  {
    name: 'Agustin',
    story: 'Un joven de 20 años que se dedica a la carpintería. Es un hombre trabajador y responsable, pero también es un poco torpe y poco afortunado. Su vida es un poco aburrida, pero siempre está buscando algo nuevo y emocionante para hacer.',
    stats: {
      vitality: 5,
      attack: 5,
      defense: 5,
      speed: 12,
      luck: 3,
    },
  }

  {
    name: 'Víbora Fea',
    story: 'Una víbora fea y mala que vive en el desierto. Es muy agresiva y tiene enormes colmillos afilados. La carencia de extremidades la hace bastante lenta igual.',
    stats: {
      vitality: 10,
      attack: 20,
      defense: 5,
      speed: 2,
      luck: 5,
    },
  }

  ## CONSIDERACIONES

  - El personaje debe tener un nombre e historia creativos y originales.
  - Los stats deben estar MUY FUERTEMENTE influidos por la historia y el nombre del personaje.
  - No temer ir a los extremos con los stats tanto para arriba como para abajo, pero tampoco siempre ir a los extremos.
  - No irse demasiado de las ramas con las historias, mantenerlas coherentes y siguiendo una sola línea.
`;

export const LANGUAGE_PROMPT_ADDITION: Record<string, string> = {
  es: `  
    IMPORTANTE: Toda tu respuesta debe estar en español argentino formal y técnico.
  `,
  en: `
    IMPORTANT: All your answer must be in a formal and technical english.
  `,
};
