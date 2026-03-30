import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import type { CompleteRequest, CompleteResponse } from '@/lib/types';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest): Promise<NextResponse<CompleteResponse>> {
  const body = (await req.json()) as CompleteRequest;

  if (!body.prompt?.trim()) {
    return NextResponse.json({ text: '', error: 'Prompt is required' }, { status: 400 });
  }

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4000,
      temperature: 0,
      ...(body.systemPrompt?.trim() ? { system: body.systemPrompt } : {}),
      messages: [{ role: 'user', content: body.prompt }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    return NextResponse.json({ text });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ text: '', error: message }, { status: 500 });
  }
}
