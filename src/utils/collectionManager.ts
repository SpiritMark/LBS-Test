import type { CollectionItem } from '../types/collection'
import { ref, watch } from 'vue'

class CollectionManager {
  private readonly STORAGE_KEY = 'lbs-test-collections'
  private collections = ref<CollectionItem[]>([])

  constructor() {
    this.load()
    
    // 监听数据变化自动保存
    watch(() => this.collections.value, () => {
      this.save()
    }, { deep: true })
  }

  // 加载集合数据
  private load(): void {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY)
      if (data) {
        this.collections.value = JSON.parse(data)
      }
    } catch (error) {
      console.error('Failed to load collections:', error)
      this.collections.value = []
    }
  }

  // 保存集合数据
  private save(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.collections.value))
    } catch (error) {
      console.error('Failed to save collections:', error)
    }
  }

  // 获取所有集合
  getCollections(): CollectionItem[] {
    return this.collections.value
  }

  // 添加集合
  addCollection(collection: CollectionItem): void {
    this.collections.value.push(collection)
  }

  // 更新集合
  updateCollection(key: string, updatedCollection: Partial<CollectionItem>): void {
    const index = this.collections.value.findIndex(c => c.key === key)
    if (index !== -1) {
      this.collections.value[index] = { ...this.collections.value[index], ...updatedCollection }
    }
  }

  // 删除集合
  deleteCollection(key: string): void {
    this.collections.value = this.collections.value.filter(c => c.key !== key)
  }

  // 添加文件夹或请求到指定的父节点
  addNode(parentKey: string, node: CollectionItem): void {
    const addToParent = (items: CollectionItem[]): boolean => {
      for (const item of items) {
        if (item.key === parentKey) {
          if (!item.children) {
            item.children = []
          }
          item.children.push(node)
          return true
        }
        if (item.children && addToParent(item.children)) {
          return true
        }
      }
      return false
    }

    addToParent(this.collections.value)
  }

  // 更新节点
  updateNode(key: string, updates: Partial<CollectionItem>): void {
    const updateInItems = (items: CollectionItem[]): boolean => {
      for (let i = 0; i < items.length; i++) {
        if (items[i].key === key) {
          items[i] = { ...items[i], ...updates }
          return true
        }
        if (items[i].children && updateInItems(items[i].children!)) {
          return true
        }
      }
      return false
    }

    updateInItems(this.collections.value)
  }

  // 删除节点
  deleteNode(key: string): void {
    const deleteFromItems = (items: CollectionItem[]): boolean => {
      for (let i = 0; i < items.length; i++) {
        if (items[i].key === key) {
          items.splice(i, 1)
          return true
        }
        if (items[i].children && deleteFromItems(items[i].children!)) {
          return true
        }
      }
      return false
    }

    deleteFromItems(this.collections.value)
  }
}

export const collectionManager = new CollectionManager() 