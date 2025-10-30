import { GoogleGenerativeAI } from '@google/generative-ai';

async function listModels() {
  const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

  try {
    const models = await client.listModels();

    console.log('Available models:');
    for await (const model of models) {
      console.log(`- ${model.name}`);
      const methods = model.supportedGenerationMethods || [];
      console.log(`  Supported methods: ${methods.join(', ')}`);
    }
  } catch (error) {
    console.error('Error listing models:', error);
  }
}

listModels();
