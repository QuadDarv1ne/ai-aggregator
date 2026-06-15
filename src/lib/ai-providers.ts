export interface AIProvider {
  id: string;
  name: string;
  icon: string;
  color: string;
  models: AIModel[];
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  maxTokens: number;
  supportsStreaming: boolean;
  supportsVision: boolean;
  speed: 1 | 2 | 3 | 4 | 5;
  quality: 1 | 2 | 3 | 4 | 5;
  cost: 1 | 2 | 3 | 4 | 5;
  tags: string[];
}

export const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'zai',
    name: 'Z.ai',
    icon: '🟣',
    color: '#7c3aed',
    models: [
      {
        id: 'glm-4-plus',
        name: 'GLM-4 Plus',
        provider: 'zai',
        description: 'Флагманская модель Z.ai с глубоким пониманием и рассуждением',
        maxTokens: 128000,
        supportsStreaming: true,
        supportsVision: true,
        speed: 4,
        quality: 5,
        cost: 3,
        tags: ['рассуждение', 'код', 'анализ'],
      },
      {
        id: 'glm-4-flash',
        name: 'GLM-4 Flash',
        provider: 'zai',
        description: 'Сверхбыстрая модель Z.ai для мгновенных ответов',
        maxTokens: 128000,
        supportsStreaming: true,
        supportsVision: false,
        speed: 5,
        quality: 3,
        cost: 1,
        tags: ['быстрый', 'простой'],
      },
      {
        id: 'glm-4-air',
        name: 'GLM-4 Air',
        provider: 'zai',
        description: 'Сбалансированная модель Z.ai — скорость и качество',
        maxTokens: 128000,
        supportsStreaming: true,
        supportsVision: false,
        speed: 4,
        quality: 4,
        cost: 2,
        tags: ['сбалансированный', 'универсальный'],
      },
      {
        id: 'glm-4-long',
        name: 'GLM-4 Long',
        provider: 'zai',
        description: 'Модель Z.ai с расширенным контекстом для длинных документов',
        maxTokens: 1024000,
        supportsStreaming: true,
        supportsVision: false,
        speed: 3,
        quality: 4,
        cost: 3,
        tags: ['длинный контекст', 'документы'],
      },
    ],
  },
  {
    id: 'openai',
    name: 'OpenAI',
    icon: '🟢',
    color: '#10a37f',
    models: [
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        provider: 'openai',
        description: 'Самая мощная модель OpenAI с мультимодальными возможностями',
        maxTokens: 128000,
        supportsStreaming: true,
        supportsVision: true,
        speed: 4,
        quality: 5,
        cost: 5,
        tags: ['флагман', 'видение', 'код'],
      },
      {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        provider: 'openai',
        description: 'Быстрая и экономичная модель для повседневных задач',
        maxTokens: 128000,
        supportsStreaming: true,
        supportsVision: true,
        speed: 5,
        quality: 3,
        cost: 2,
        tags: ['быстрый', 'экономичный'],
      },
    ],
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    icon: '🟠',
    color: '#d97706',
    models: [
      {
        id: 'claude-sonnet-4-20250514',
        name: 'Claude Sonnet 4',
        provider: 'anthropic',
        description: 'Сбалансированная модель Anthropic для любых задач',
        maxTokens: 200000,
        supportsStreaming: true,
        supportsVision: true,
        speed: 4,
        quality: 5,
        cost: 4,
        tags: ['сбалансированный', 'творчество', 'код'],
      },
      {
        id: 'claude-3-5-haiku-20241022',
        name: 'Claude 3.5 Haiku',
        provider: 'anthropic',
        description: 'Быстрая модель Anthropic для простых задач',
        maxTokens: 200000,
        supportsStreaming: true,
        supportsVision: false,
        speed: 5,
        quality: 3,
        cost: 2,
        tags: ['быстрый', 'простой'],
      },
    ],
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    icon: '🔵',
    color: '#4f46e5',
    models: [
      {
        id: 'deepseek-chat',
        name: 'DeepSeek V3',
        provider: 'deepseek',
        description: 'Мощная открытая модель с отличными навыками программирования',
        maxTokens: 128000,
        supportsStreaming: true,
        supportsVision: false,
        speed: 4,
        quality: 4,
        cost: 1,
        tags: ['код', 'экономичный', 'открытый'],
      },
      {
        id: 'deepseek-reasoner',
        name: 'DeepSeek R1',
        provider: 'deepseek',
        description: 'Модель с пошаговым рассуждением для сложных задач',
        maxTokens: 128000,
        supportsStreaming: true,
        supportsVision: false,
        speed: 2,
        quality: 5,
        cost: 2,
        tags: ['рассуждение', 'математика', 'логика'],
      },
    ],
  },
];

export function getModelById(modelId: string): AIModel | undefined {
  for (const provider of AI_PROVIDERS) {
    const model = provider.models.find((m) => m.id === modelId);
    if (model) return model;
  }
  return undefined;
}

export function getProviderById(providerId: string): AIProvider | undefined {
  return AI_PROVIDERS.find((p) => p.id === providerId);
}

export function getAllModels(): AIModel[] {
  return AI_PROVIDERS.flatMap((p) => p.models);
}

// Recommend best model for a given prompt
export function recommendModel(prompt: string): AIModel {
  const lower = prompt.toLowerCase();
  const all = getAllModels();

  // Code-related
  if (/код|функци|программ|python|javascript|typescript|java|sql|html|css|api|баг|отлад|debug/i.test(lower)) {
    return all.find((m) => m.id === 'deepseek-chat') || all.find((m) => m.id === 'glm-4-plus') || all[0];
  }
  // Math / reasoning
  if (/математ|вычисл|уравнен|формул|логи|доказа|решени|задач/i.test(lower)) {
    return all.find((m) => m.id === 'deepseek-reasoner') || all.find((m) => m.id === 'glm-4-plus') || all[0];
  }
  // Creative writing
  if (/напиши|стори|рассказ|стих|пись|текст|стать|блог|креатив/i.test(lower)) {
    return all.find((m) => m.id === 'claude-sonnet-4-20250514') || all.find((m) => m.id === 'glm-4-plus') || all[0];
  }
  // Quick / simple
  if (/переведи|определ|что такое|кто|когда|сколько/i.test(lower)) {
    return all.find((m) => m.id === 'glm-4-flash') || all.find((m) => m.id === 'gpt-4o-mini') || all[0];
  }
  // Long documents
  if (/докум|отчёт|анализ|исследован|статья|книга/i.test(lower)) {
    return all.find((m) => m.id === 'glm-4-long') || all.find((m) => m.id === 'claude-sonnet-4-20250514') || all[0];
  }
  // Default: best overall
  return all.find((m) => m.id === 'glm-4-plus') || all[0];
}
