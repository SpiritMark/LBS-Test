import type { RequestHistory } from '../types/history'

export interface HistoryRecord {
  method: string;
  url: string;
  headers: Array<{ key: string; value: string }>;
  params: Array<{ key: string; value: string }>;
  bodyType: 'none' | 'json' | 'form-data';
  jsonBody?: string;
  formData?: Array<{ key: string; value: string }>;
  response?: {
    status: number;
    headers?: Record<string, string>;
    data: any;
    time: number;
  };
  timestamp: string;
}

export class HistoryManager {
  private readonly storageKey = 'api_request_history';
  private maxHistory = 50;

  getHistory(): HistoryRecord[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load history:', error);
      return [];
    }
  }

  add(record: HistoryRecord) {
    try {
      let history = this.getHistory();
      const newRecord = {
        ...record,
        timestamp: new Date().toISOString()
      };
      history.unshift(newRecord);
      history = history.slice(0, this.maxHistory);
      localStorage.setItem(this.storageKey, JSON.stringify(history));
      console.log('History saved:', history);
    } catch (error) {
      console.error('Failed to save history:', error);
    }
  }

  clear() {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  }
} 