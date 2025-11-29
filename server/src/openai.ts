import OpenAI from "openai";
import { IGenerateRequest } from "./types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getChatResponse({
  prompt,
  model,
  temperature,
}: IGenerateRequest): Promise<string> {
  const completion = await openai.chat.completions.create({
    model,
    temperature: temperature ?? 0.7,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return completion.choices[0].message.content || "";
}

export async function* getStreamingChatResponse({
  prompt,
  model,
  temperature,
}: IGenerateRequest): AsyncGenerator<string, void, unknown> {
  const stream = await openai.chat.completions.create({
    model,
    temperature: temperature ?? 0.7,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || "";
    if (content) {
      yield content;
    }
  }
}
