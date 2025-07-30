import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

function validateApiKeys() {
  const openaiKey = process.env.OPENAI_API_KEY;
  const heliconeKey = process.env.HELICONE_API_KEY;

  if (!openaiKey) {
    throw new Error('OPENAI_API_KEY environment variable is required');
  }

  if (!heliconeKey) {
    throw new Error('HELICONE_API_KEY environment variable is required');
  }

  return { openaiKey, heliconeKey };
}

let openai: OpenAI;

try {
  const { openaiKey, heliconeKey } = validateApiKeys();
  openai = new OpenAI({
    apiKey: openaiKey,
    baseURL: "https://oai.helicone.ai/v1",
    defaultHeaders: {
      "Helicone-Auth": `Bearer ${heliconeKey}`
    }
  });
} catch (error) {
  console.error('API key validation failed:', error);
}

export async function POST(request: NextRequest) {
  try {
    if (!openai) {
      return NextResponse.json(
        { error: 'API configuration error: Missing required API keys (OPENAI_API_KEY or HELICONE_API_KEY)' },
        { status: 500 }
      );
    }

    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const responseMessage = completion.choices[0]?.message?.content || 'No response';

    return NextResponse.json({ response: responseMessage });
  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json(
      { error: 'Failed to get response from OpenAI' },
      { status: 500 }
    );
  }
}