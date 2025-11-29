interface HistoryItem {
  id: string;
  prompt: string;
  response: string;
  model: string;
  temperature: number;
  timestamp: Date;
}

interface StoredHistoryItem extends Omit<HistoryItem, "timestamp"> {
  timestamp: string;
}

export type { HistoryItem, StoredHistoryItem };
