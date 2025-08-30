// Configuration for locally hosted DeepSeek R1:7B model
export const DEEPSEEK_CONFIG = {
  baseURL: process.env.DEEPSEEK_BASE_URL || 'http://localhost:11434', // Default Ollama URL
  model: 'deepseek-r1:7b',
  temperature: 0.1,
  maxTokens: 2048,
  topP: 0.9,
  frequencyPenalty: 0.1,
  presencePenalty: 0.1,
};

export interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface DeepSeekRequest {
  model: string;
  messages: DeepSeekMessage[];
  stream: boolean;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      content?: string;
      role?: string;
    };
    finish_reason: string | null;
  }>;
}

export class DeepSeekClient {
  private baseURL: string;
  private model: string;

  constructor(baseURL: string = DEEPSEEK_CONFIG.baseURL, model: string = DEEPSEEK_CONFIG.model) {
    this.baseURL = baseURL;
    this.model = model;
  }

  async createChatCompletion(request: Omit<DeepSeekRequest, 'model'>): Promise<ReadableStream> {
    const fullRequest: DeepSeekRequest = {
      model: this.model,
      ...request,
      temperature: request.temperature ?? DEEPSEEK_CONFIG.temperature,
      max_tokens: request.max_tokens ?? DEEPSEEK_CONFIG.maxTokens,
      top_p: request.top_p ?? DEEPSEEK_CONFIG.topP,
      frequency_penalty: request.frequency_penalty ?? DEEPSEEK_CONFIG.frequencyPenalty,
      presence_penalty: request.presence_penalty ?? DEEPSEEK_CONFIG.presencePenalty,
    };

    const response = await fetch(`${this.baseURL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fullRequest),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
    }

    return response.body!;
  }

  async createEmbeddings(texts: string[]): Promise<number[][]> {
    const response = await fetch(`${this.baseURL}/v1/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-r1:7b',
        input: texts,
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek embeddings error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.data.map((item: any) => item.embedding);
  }
}

export const deepseekClient = new DeepSeekClient();
