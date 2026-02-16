// BBRC Target figures and synonyms
export const TARGET_FIGURES = [
  { name: 'sapato', synonyms: ['sapato', 'calcado', 'tenis', 'sapatilha'] },
  { name: 'casa', synonyms: ['casa', 'casinha', 'moradia', 'lar', 'residencia'] },
  { name: 'pente', synonyms: ['pente', 'escova', 'pentear'] },
  { name: 'aviao', synonyms: ['aviao', 'aeronave', 'aeroplano', 'jato'] },
  { name: 'balde', synonyms: ['balde', 'balde de agua', 'baldinho'] },
  { name: 'tartaruga', synonyms: ['tartaruga', 'jabuti', 'jaboti', 'cagado', 'quelonio'] },
  { name: 'livro', synonyms: ['livro', 'caderno', 'revista'] },
  { name: 'chave', synonyms: ['chave', 'chaveiro'] },
  { name: 'flor', synonyms: ['flor', 'rosa', 'margarida', 'florzinha'] },
  { name: 'ferro', synonyms: ['ferro', 'ferro de passar', 'ferro eletrico', 'ferro de engomar'] },
];

export const RECOGNITION_ORIGINALS = TARGET_FIGURES.map(f => f.name);

// Normalize text: remove accents, lowercase, strip punctuation
export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

// Match transcript against the 10 target figures
// Returns a Set of matched figure names (unique only)
export function matchTargetFigures(transcript: string): Set<string> {
  const normalizedTranscript = normalize(transcript);
  const words = normalizedTranscript.split(/\s+/);
  const matched = new Set<string>();

  for (const figure of TARGET_FIGURES) {
    for (const synonym of figure.synonyms) {
      const normalizedSynonym = normalize(synonym);
      // Check if any word matches or if multi-word synonym is contained
      if (normalizedSynonym.includes(' ')) {
        if (normalizedTranscript.includes(normalizedSynonym)) {
          matched.add(figure.name);
          break;
        }
      } else {
        if (words.includes(normalizedSynonym)) {
          matched.add(figure.name);
          break;
        }
      }
    }
  }

  return matched;
}

// Valid animals list (~200)
export const VALID_ANIMALS = [
  'gato', 'cachorro', 'cao', 'cavalo', 'vaca', 'boi', 'porco', 'galinha', 'galo',
  'pato', 'ganso', 'peru', 'coelho', 'rato', 'ratazana', 'camundongo', 'hamster',
  'esquilo', 'morcego', 'macaco', 'gorila', 'chimpanze', 'orangotango', 'leao',
  'tigre', 'onca', 'leopardo', 'guepardo', 'pantera', 'jaguar', 'lobo', 'raposa',
  'urso', 'panda', 'elefante', 'rinoceronte', 'hipopotamo', 'girafa', 'zebra',
  'camelo', 'dromedario', 'cervo', 'veado', 'alce', 'rena', 'bufalo', 'bisao',
  'antilope', 'gazela', 'cabra', 'bode', 'ovelha', 'carneiro', 'cordeiro', 'burro',
  'mula', 'jumento', 'lhama', 'alpaca', 'tatu', 'tamandua', 'preguica', 'capivara',
  'anta', 'quati', 'gambá', 'jaguatirica', 'lontra', 'ariranha', 'furão', 'doninha',
  'texugo', 'castor', 'toupeira', 'porco espinho', 'ourico', 'foca', 'leao marinho',
  'morsa', 'baleia', 'golfinho', 'tubarao', 'arraia', 'peixe', 'sardinha', 'atum',
  'salmao', 'bacalhau', 'tilapia', 'carpa', 'truta', 'piranha', 'bagre', 'dourado',
  'tucunare', 'corvina', 'robalo', 'cavalo marinho', 'polvo', 'lula', 'camarao',
  'lagosta', 'caranguejo', 'siri', 'ostra', 'mexilhao', 'caracol', 'lesma',
  'minhoca', 'cobra', 'serpente', 'jiboia', 'sucuri', 'cascavel', 'naja', 'vibora',
  'lagarto', 'lagartixa', 'iguana', 'camaleao', 'jacare', 'crocodilo', 'tartaruga',
  'jabuti', 'cagado', 'sapo', 'ra', 'perereca', 'salamandra', 'aguia', 'falcao',
  'gaviao', 'coruja', 'mocho', 'papagaio', 'arara', 'periquito', 'canario',
  'beija flor', 'tucano', 'pombo', 'pomba', 'andorinha', 'pardal', 'sabia',
  'bem te vi', 'urubu', 'condor', 'pelicano', 'flamingo', 'cegonha', 'garça',
  'cisne', 'avestruz', 'ema', 'pinguim', 'quero quero', 'maritaca', 'calopsita',
  'abelha', 'vespa', 'marimbondo', 'formiga', 'cupim', 'mosca', 'mosquito',
  'borboleta', 'mariposa', 'libélula', 'grilo', 'cigarra', 'gafanhoto', 'barata',
  'besouro', 'joaninha', 'louva deus', 'escorpiao', 'aranha', 'carrapato',
  'pulga', 'piolho', 'centopeia', 'lacraia', 'bicho pau', 'bicho preguica',
  'tamanduá bandeira', 'mico', 'sagui', 'bugio', 'corvo', 'gralha', 'pica pau',
  'codorna', 'faisao', 'pavao', 'colibri', 'cuco', 'pardal', 'rouxinol', 'pintassilgo',
  'jaburu', 'seriema', 'jacu', 'mutum', 'iara', 'pirarucu', 'surubi', 'pintado',
  'pacu', 'matrinxa', 'lambari', 'traira', 'jundia', 'mandi',
];

// Match transcript against valid animals list
// Returns a Set of unique matched animal names
export function matchAnimals(transcript: string): Set<string> {
  const normalizedTranscript = normalize(transcript);
  const words = normalizedTranscript.split(/\s+/);
  const matched = new Set<string>();

  for (const animal of VALID_ANIMALS) {
    const normalizedAnimal = normalize(animal);
    if (normalizedAnimal.includes(' ')) {
      // Multi-word animal name
      if (normalizedTranscript.includes(normalizedAnimal)) {
        matched.add(animal);
      }
    } else {
      if (words.includes(normalizedAnimal)) {
        matched.add(animal);
      }
    }
  }

  return matched;
}

// ABN 2022 cutoff points by education level
export const ABN_CUTOFFS: Record<string, Record<string, number>> = {
  'analfabeto': {
    naming: 7,
    incidental: 4,
    immediate: 5,
    learning: 6,
    fluency: 8,
    delayed: 4,
    recognition: 7,
  },
  '1-3': {
    naming: 7,
    incidental: 5,
    immediate: 6,
    learning: 7,
    fluency: 10,
    delayed: 5,
    recognition: 8,
  },
  '4-7': {
    naming: 8,
    incidental: 5,
    immediate: 7,
    learning: 7,
    fluency: 12,
    delayed: 6,
    recognition: 8,
  },
  '8+': {
    naming: 9,
    incidental: 6,
    immediate: 7,
    learning: 8,
    fluency: 13,
    delayed: 7,
    recognition: 9,
  },
};

// Phase definitions
export type TestPhase =
  | 'welcome'
  | 'naming'
  | 'incidental'
  | 'exposure1'
  | 'immediate'
  | 'exposure2'
  | 'learning'
  | 'fluency'
  | 'clock'
  | 'delayed'
  | 'recognition'
  | 'report';

export const PHASE_LABELS: Record<TestPhase, string> = {
  welcome: 'Boas-vindas',
  naming: '1. Nomeação',
  incidental: '2. Memória Incidental',
  exposure1: 'Exposição',
  immediate: '3. Memória Imediata',
  exposure2: 'Exposição',
  learning: '4. Aprendizado',
  fluency: '5. Fluência Verbal',
  clock: '6. Teste do Relógio',
  delayed: '7. Memória Tardia',
  recognition: '8. Reconhecimento',
  report: 'Relatório Final',
};

export const PHASE_INSTRUCTIONS: Record<string, string> = {
  naming: 'Olhe para estas figuras e diga o nome de cada uma delas.',
  incidental: 'Agora, sem olhar para as figuras, diga quais figuras você consegue lembrar.',
  exposure1: 'Observe bem estas figuras por trinta segundos.',
  immediate: 'Agora, sem olhar para as figuras, diga quais figuras você consegue lembrar.',
  exposure2: 'Observe novamente estas figuras por trinta segundos.',
  learning: 'Mais uma vez, sem olhar para as figuras, diga quais figuras você consegue lembrar.',
  fluency: 'Agora, diga o maior número de nomes de animais que conseguir, em um minuto.',
  clock: 'Desenhe um relógio com todos os números e marque onze horas e dez minutos.',
  delayed: 'Você se lembra daquelas figuras que viu antes? Diga quais figuras você consegue lembrar.',
  recognition: 'Olhe para estas figuras. Diga quais figuras estavam na prancha que você viu antes.',
};

export interface TestScores {
  naming: number;
  incidental: number;
  immediate: number;
  learning: number;
  fluency: number;
  clock: number;
  delayed: number;
  recognition: number;
}

export interface PatientData {
  name: string;
  age: number;
  education: string;
}
