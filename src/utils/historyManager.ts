import type { RequestHistory } from '../types/history'

export class HistoryManager {
  private readonly STORAGE_KEY = 'lbs-test-history'
  private history: RequestHistory[] = []

  constructor() {
    this.load()
  }

  private load(): void {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY)
      if (data) {
        this.history = JSON.parse(data)
      }
    } catch (error) {
      console.error('Failed to load history:', error)
      this.history = []
    }
  }

  private save(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.history))
    } catch (error) {
      console.error('Failed to save history:', error)
    }
  }

  getAll(): RequestHistory[] {
    return this.history
  }

  add(request: Omit<RequestHistory, 'id' | 'createdAt' | 'updatedAt'>): void {
    const now = Date.now()
    const newRequest: RequestHistory = {
      ...request,
      id: `history_${now}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now
    }
    this.history.unshift(newRequest)
    this.save()
  }

  update(id: string, updates: Partial<RequestHistory>): void {
    const index = this.history.findIndex(item => item.id === id)
    if (index !== -1) {
      this.history[index] = {
        ...this.history[index],
        ...updates,
        updatedAt: Date.now()
      }
      this.save()
    }
  }

  delete(id: string): void {
    this.history = this.history.filter(item => item.id !== id)
    this.save()
  }

  clear(): void {
    this.history = []
    this.save()
  }
} 