import { Request, Response } from "express";
import { getChatResponse, getStreamingChatResponse } from "./openai";
import { IGenerateRequest } from "./types";

const generateController = async (req: Request, res: Response) => {
  try {
    const { prompt, model, temperature, stream } = req.body as IGenerateRequest;
    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: "Missing required field: prompt",
      });
    }
    if (!model) {
      return res.status(400).json({
        success: false,
        message: "Missing required field: model",
      });
    }
    if (temperature && (temperature < 0 || temperature > 1)) {
      return res.status(400).json({
        success: false,
        message: "Temperature must be between 0 and 1",
      });
    }

    if (stream) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders();
      res.write(`data: ${JSON.stringify({ start: true })}\n\n`);
      const streamSource = getStreamingChatResponse({
        prompt,
        model,
        temperature,
      });

      for await (const chunk of streamSource) {
        res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
      }

      res.write(
        `data: ${JSON.stringify({
          done: true,
          usedModel: model,
          temperature,
          createdAt: new Date(),
        })}\n\n`
      );
      res.end();
    } else {
      const reply = await getChatResponse({ prompt, model, temperature });

      res.json({
        reply,
        usedModel: model,
        temperature,
        createdAt: new Date(),
      });
    }
  } catch (error) {
    console.error("Error in generateController:", error);

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Failed to generate response",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } else {
      res.write(
        `data: ${JSON.stringify({
          error: true,
          message: error instanceof Error ? error.message : "Unknown error",
        })}\n\n`
      );
      res.end();
    }
  }
};

export { generateController };
