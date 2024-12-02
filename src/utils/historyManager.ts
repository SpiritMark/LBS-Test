import { RequestHistory } from '../types/history'

const STORAGE_KEY = 'request_history'

export class HistoryManager {
  private history: RequestHistory[] = []

  constructor() {
    this.loadFromStorage()
  }

  private loadFromStorage() {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        this.history = JSON.parse(stored)
      } catch (e) {
        console.error('Failed to load history:', e)
        this.history = []
      }
    }
  }

  private saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.history))
  }

  getAll(): RequestHistory[] {
    return [...this.history].sort((a, b) => b.updatedAt - a.updatedAt)
  }

  add(request: Omit<RequestHistory, 'id' | 'createdAt' | 'updatedAt'>): RequestHistory {
    const now = Date.now()
    const newHistory: RequestHistory = {
      ...request,
      id: `hist_${now}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now,
    }
    this.history.push(newHistory)
    this.saveToStorage()
    return newHistory
  }

  update(id: string, request: Partial<RequestHistory>): RequestHistory {
    const index = this.history.findIndex(h => h.id === id)
    if (index === -1) {
      throw new Error('History not found')
    }

    const updatedHistory: RequestHistory = {
      ...this.history[index],
      ...request,
      updatedAt: Date.now(),
    }

    this.history[index] = updatedHistory
    this.saveToStorage()
    return updatedHistory
  }

  delete(id: string) {
    const index = this.history.findIndex(h => h.id === id)
    if (index !== -1) {
      this.history.splice(index, 1)
      this.saveToStorage()
    }
  }

  get(id: string): RequestHistory | undefined {
    return this.history.find(h => h.id === id)
  }

  search(keyword: string): RequestHistory[] {
    const lowerKeyword = keyword.toLowerCase()
    return this.history.filter(h =>
      h.name.toLowerCase().includes(lowerKeyword) ||
      h.url.toLowerCase().includes(lowerKeyword) ||
      h.method.toLowerCase().includes(lowerKeyword)
    )
  }

  clear() {
    this.history = []
    this.saveToStorage()
  }
} 