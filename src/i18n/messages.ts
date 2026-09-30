export type Locale = 'pt' | 'en' | 'es';

export const messages = {
  pt: {
    today: 'Hoje', explore: 'Explorar', notebook: 'Meu caderno', continue: 'Continuar leitura',
    begin: 'Começar um estudo', paste: 'Colar um texto', read: 'Ler', study: 'Estudar', source: 'Ver fonte',
    theme: 'Tema', language: 'Idioma da interface', light: 'Claro', dark: 'Escuro', system: 'Sistema',
    discover: 'Descoberta central', context: 'Contexto', interpretation: 'Interpretação', application: 'Aplicação',
    original: 'Original', thread: 'Fio da Bíblia', close: 'Fechar', save: 'Guardar', saved: 'Guardado',
    noAi: 'IA ao vivo ainda não está habilitada', noAiBody: 'A biblioteca e a leitura continuam disponíveis. O NestLume não finge uma resposta gerada quando o provedor não foi aprovado.',
  },
  en: {
    today: 'Today', explore: 'Explore', notebook: 'My notebook', continue: 'Continue reading',
    begin: 'Start a study', paste: 'Paste text', read: 'Read', study: 'Study', source: 'View source',
    theme: 'Theme', language: 'Interface language', light: 'Light', dark: 'Dark', system: 'System',
    discover: 'Central discovery', context: 'Context', interpretation: 'Interpretation', application: 'Application',
    original: 'Original', thread: 'Bible thread', close: 'Close', save: 'Save', saved: 'Saved',
    noAi: 'Live AI is not enabled yet', noAiBody: 'The library and reading remain available. NestLume does not pretend a generated answer exists when the provider has not been approved.',
  },
  es: {
    today: 'Hoy', explore: 'Explorar', notebook: 'Mi cuaderno', continue: 'Continuar lectura',
    begin: 'Comenzar un estudio', paste: 'Pegar un texto', read: 'Leer', study: 'Estudiar', source: 'Ver fuente',
    theme: 'Tema', language: 'Idioma de la interfaz', light: 'Claro', dark: 'Oscuro', system: 'Sistema',
    discover: 'Descubrimiento central', context: 'Contexto', interpretation: 'Interpretación', application: 'Aplicación',
    original: 'Original', thread: 'Hilo bíblico', close: 'Cerrar', save: 'Guardar', saved: 'Guardado',
    noAi: 'La IA en vivo aún no está habilitada', noAiBody: 'La biblioteca y la lectura siguen disponibles. NestLume no finge una respuesta generada cuando el proveedor no ha sido aprobado.',
  },
} as const;
