const { generateText, tool } = require('ai');
const { createGoogleGenerativeAI } = require('@ai-sdk/google');
const { z } = require('zod');
require('dotenv').config();

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function main() {
  console.log('Testing gemini-3.1-flash-lite...');
  const { text, steps } = await generateText({
    model: google('gemini-3.1-flash-lite'),
    system: 'Eres un asistente. Debes buscar info y luego responder SIEMPRE con texto.',
    messages: [{ role: 'user', content: 'Busca informacion sobre computadoras y dime algo.' }],
    maxSteps: 5,
    tools: {
      searchProducts: tool({
        description: 'Busca productos',
        parameters: z.object({ query: z.string() }),
        execute: async (args) => {
          console.log('Tool called:', args);
          return [{ id: 1, name: 'Ryzen 5', price: 200 }];
        }
      })
    }
  });

  console.log('FINAL TEXT:', text);
  console.log('STEPS:', JSON.stringify(steps, null, 2));
}

main().catch(console.error);
