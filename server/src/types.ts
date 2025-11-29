export interface IGenerateRequest {
  prompt: string;
  model: "gpt-4" | "gpt-3.5-turbo";
  temperature?: number;
  stream?: boolean;
}
