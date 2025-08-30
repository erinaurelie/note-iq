import { deepseekClient } from './deepseek';

export class DeepSeekEmbeddings {
  async embedDocuments(texts: string[]): Promise<number[][]> {
    try {
      return await deepseekClient.createEmbeddings(texts);
    } catch (error) {
      console.error('Error creating embeddings:', error);
      throw new Error('Failed to create embeddings');
    }
  }

  async embedQuery(text: string): Promise<number[]> {
    try {
      const embeddings = await deepseekClient.createEmbeddings([text]);
      return embeddings[0];
    } catch (error) {
      console.error('Error creating query embedding:', error);
      throw new Error('Failed to create query embedding');
    }
  }
}

export const deepseekEmbeddings = new DeepSeekEmbeddings();
