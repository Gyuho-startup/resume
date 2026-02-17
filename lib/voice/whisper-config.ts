export const WHISPER_CONFIG = {
  model: process.env.VOICE_STT_MODEL ?? 'whisper-1',
  language: process.env.VOICE_STT_LANGUAGE ?? 'en',
  temperature: 0,
  prompt: [
    'CV, curriculum vitae, ATS, LinkedIn, GitHub, portfolio,',
    'UCAS, A-levels, GCSEs, degree, dissertation, placement year,',
    '2:1, First Class Honours, Upper Second, BSc, MSc, BA, MA, PhD,',
    'internship, work experience, gap year, extracurricular,',
    'UCL, Imperial, Manchester, Bristol, Edinburgh, Warwick,',
    "King's College London, Nottingham, Birmingham, Leeds, Sheffield,",
    'JavaScript, TypeScript, Python, React, Node.js, SQL, Java,',
    'teamwork, leadership, communication, problem-solving,',
    'Stripe, Supabase, Vercel, AWS, Azure, Google Cloud,',
  ].join(' '),
} as const;

export const TTS_CONFIG = {
  model: process.env.VOICE_TTS_MODEL ?? 'tts-1',
  voice: (process.env.VOICE_TTS_VOICE ?? 'nova') as 'onyx' | 'alloy' | 'echo' | 'fable' | 'nova' | 'shimmer',
} as const;

export const MAX_RECORDING_MS = 60_000;
export const MAX_TTS_CHARS = 4096;
