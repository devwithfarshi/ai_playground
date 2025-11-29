import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { clearHistoryFromStorage } from "../lib/helper";
import type { HistoryItem } from "../types/history.types";

interface HistoryProps {
  history: HistoryItem[];
  onHistoryChange: (newHistory: HistoryItem[]) => void;
  onHistoryItemClick: (item: HistoryItem) => void;
}

const History = ({
  history,
  onHistoryChange,
  onHistoryItemClick,
}: HistoryProps) => {
  const formatTimestamp = (date: Date) => {
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleClearHistory = () => {
    clearHistoryFromStorage();
    onHistoryChange([]);
    toast.success("History cleared successfully");
  };

  return (
    <Card className="h-fit lg:sticky lg:top-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>History</CardTitle>
            <CardDescription>
              Your previous generations ({history.length})
            </CardDescription>
          </div>
          {history.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleClearHistory}>
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          {history.length === 0 ? (
            <div className="px-6 pb-6">
              <p className="text-sm text-muted-foreground">
                No history yet. Generate a response to see it here.
              </p>
            </div>
          ) : (
            <div className="space-y-3 px-6 pb-6">
              {history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onHistoryItemClick(item)}
                  className="w-full rounded-lg border bg-card p-3 text-left transition-colors hover:bg-accent"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      {item.model} • {item.temperature.toFixed(2)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(item.timestamp)}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-sm font-medium">
                    {item.prompt}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {item.response}
                  </p>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default History;
