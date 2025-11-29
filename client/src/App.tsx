import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import History from "./components/History";
import { loadHistoryFromStorage, saveHistoryToStorage } from "./lib/helper";
import type { HistoryItem } from "./types/history.types";
export interface IGenerateRequest {
  prompt: string;
  model: "gpt-4" | "gpt-3.5-turbo";
  temperature?: number;
  stream?: boolean;
}

const App = () => {
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState<IGenerateRequest["model"]>("gpt-4");
  const [temperature, setTemperature] = useState(0.7);
  const [stream, setStream] = useState(true);
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreamStart, setIsStreamStart] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>(() =>
    loadHistoryFromStorage()
  );

  useEffect(() => {
    saveHistoryToStorage(history);
  }, [history]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    if (temperature && (temperature < 0 || temperature > 1)) {
      toast.error("Temperature must be between 0 and 1");
      return;
    }
    setIsLoading(true);
    setResponse("");

    try {
      const requestBody: IGenerateRequest = {
        prompt,
        model,
        temperature,
        stream,
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      if (stream) {
        const reader = res.body?.getReader();
        if (!reader) {
          throw new Error("No reader available");
        }

        const decoder = new TextDecoder();
        let fullResponse = "";
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");

          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith("data: ")) {
              try {
                const jsonStr = trimmedLine.slice(6);
                if (jsonStr) {
                  const data = JSON.parse(jsonStr);
                  console.log("Received data:", data);
                  if (data.start) {
                    setIsStreamStart(true);
                  }
                  if (data.content) {
                    fullResponse += data.content;
                    setResponse(fullResponse);
                  }
                  if (data.done) {
                    const newHistoryItem: HistoryItem = {
                      id: Date.now().toString(),
                      prompt,
                      response: fullResponse,
                      model,
                      temperature,
                      timestamp: new Date(),
                    };
                    setIsStreamStart(false);
                    setHistory((prev) => [newHistoryItem, ...prev]);
                  }
                  if (data.error) {
                    throw new Error(data.message || "Stream error");
                  }
                }
              } catch {
                console.error("Failed to parse stream data:", trimmedLine);
              }
            }
          }
        }

        if (buffer.trim().startsWith("data: ")) {
          try {
            const jsonStr = buffer.trim().slice(6);
            if (jsonStr) {
              const data = JSON.parse(jsonStr);
              if (data.content) {
                fullResponse += data.content;
                setResponse(fullResponse);
              }
              if (data.done) {
                const newHistoryItem: HistoryItem = {
                  id: Date.now().toString(),
                  prompt,
                  response: fullResponse,
                  model,
                  temperature,
                  timestamp: new Date(),
                };
                setHistory((prev) => [newHistoryItem, ...prev]);
              }
            }
          } catch {
            console.error("Failed to parse remaining stream data:", buffer);
          }
        }
      } else {
        const data = await res.json();
        const generatedResponse =
          data.reply || data.response || data.content || JSON.stringify(data);

        setResponse(generatedResponse);

        const newHistoryItem: HistoryItem = {
          id: Date.now().toString(),
          prompt,
          response: generatedResponse,
          model,
          temperature,
          timestamp: new Date(),
        };
        setHistory((prev) => [newHistoryItem, ...prev]);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setResponse(
        `Error generating response: ${errorMessage}. Please try again.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleHistoryItemClick = (item: HistoryItem) => {
    setPrompt(item.prompt);
    setModel(item.model as IGenerateRequest["model"]);
    setTemperature(item.temperature);
    setResponse(item.response);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-center text-4xl font-bold">AI Playground</h1>

        <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Prompt Input Card */}
            <Card>
              <CardHeader>
                <CardTitle>Prompt</CardTitle>
                <CardDescription>
                  Enter your prompt and configure the model settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Prompt Input */}
                <div className="space-y-2">
                  <Label htmlFor="prompt">Your Prompt</Label>
                  <Textarea
                    id="prompt"
                    placeholder="Enter your prompt here..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-32 resize-none"
                  />
                </div>

                {/* Model, Stream, and Temperature Settings */}
                <div className="grid gap-6 sm:grid-cols-3">
                  {/* Model Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="model">Model</Label>
                    <Select
                      value={model}
                      onValueChange={(m) =>
                        setModel(m as IGenerateRequest["model"])
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4">GPT-4</SelectItem>
                        <SelectItem value="gpt-3.5-turbo">
                          GPT-3.5 Turbo
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Stream Toggle */}
                  <div className="space-y-2">
                    <Label htmlFor="stream">Response Mode</Label>
                    <Select
                      value={stream ? "stream" : "normal"}
                      onValueChange={(v) => setStream(v === "stream")}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stream">Stream</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Temperature Slider */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="temperature">Temperature</Label>
                      <span className="text-sm text-muted-foreground">
                        {temperature.toFixed(2)}
                      </span>
                    </div>
                    <Slider
                      id="temperature"
                      min={0}
                      max={1}
                      step={0.01}
                      value={[temperature]}
                      onValueChange={(value) => setTemperature(value[0])}
                      className="py-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Precise</span>
                      <span>Creative</span>
                    </div>
                  </div>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={isLoading || !prompt.trim()}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? "Generating..." : "Generate"}
                </Button>
              </CardContent>
            </Card>

            {/* Response Card */}
            <Card>
              <CardHeader>
                <CardTitle>Response</CardTitle>
                <CardDescription>
                  AI-generated response will appear here
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="min-h-48 rounded-md border bg-muted/50 p-4">
                  {isLoading && !isStreamStart ? (
                    <div className="flex h-full items-center justify-center">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="animate-spin" />
                        <span>Generating response...</span>
                      </div>
                    </div>
                  ) : response ? (
                    <p className="whitespace-pre-wrap text-sm">{response}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No response yet. Enter a prompt and click Generate.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* History Panel */}
          <History
            history={history}
            onHistoryChange={setHistory}
            onHistoryItemClick={handleHistoryItemClick}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
