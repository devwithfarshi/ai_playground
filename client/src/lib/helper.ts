import { HISTORY_STORAGE_KEY } from "@/config/constant";
import type { HistoryItem, StoredHistoryItem } from "@/types/history.types";
import { toast } from "sonner";

const loadHistoryFromStorage = (): HistoryItem[] => {
  try {
    const storedData = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!storedData) return [];
    const parsed: StoredHistoryItem[] = JSON.parse(storedData);
    return parsed.map((item) => ({
      ...item,
      timestamp: new Date(item.timestamp),
    }));
  } catch {
    return [];
  }
};

const saveHistoryToStorage = (history: HistoryItem[]) => {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch {
    console.error("Failed to save history to localStorage");
    toast.error("Failed to save history to localStorage");
  }
};

const clearHistoryFromStorage = () => {
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch {
    console.error("Failed to clear history from localStorage");
    toast.error("Failed to clear history from localStorage");
  }
};

export {
  loadHistoryFromStorage,
  saveHistoryToStorage,
  clearHistoryFromStorage,
};
