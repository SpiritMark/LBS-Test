<template>
  <div class="collection-panel" :class="{ 'theme-dark': appStore.theme === 'dark', 'collapsed': isCollapsed }">
    <div class="collection-header">
      <div class="header-top">
        <a-input-search
          v-model:value="searchKeyword"
          :placeholder="t('collection.search')"
          class="search-input"
        />
        <a-button
          type="text"
          class="collapse-button"
          @click="toggleCollapse"
        >
          <menu-fold-outlined v-if="!isCollapsed" />
          <menu-unfold-outlined v-else />
        </a-button>
      </div>
      <a-button v-show="!isCollapsed" type="primary" block @click="showCreateCollectionModal">
        {{ t('collection.createNew') }}
      </a-button>
    </div>

    <div v-show="!isCollapsed" class="collection-content">
      <a-tree
        class="collection-tree"
        :tree-data="filteredCollections"
        :selectedKeys="selectedKeys"
        :expandedKeys="expandedKeys"
        :autoExpandParent="true"
        :showLine="{ showLeafIcon: false }"
        @select="onSelect"
        @expand="onExpand"
      >
        <template #title="{ title, type, key }">
          <div class="tree-node">
            <span class="node-icon">
              <folder-outlined v-if="type === 'collection'" />
              <folder-open-outlined v-else-if="type === 'folder'" />
              <api-outlined v-else />
            </span>
            <span class="node-title">{{ title }}</span>
            <div class="node-actions">
              <a-dropdown>
                <template #overlay>
                  <a-menu>
                    <a-menu-item v-if="type === 'collection'" @click="showCreateFolderModal(key)">
                      <folder-add-outlined /> {{ t('collection.newFolder') }}
                    </a-menu-item>
                    <a-menu-item v-if="type === 'folder'" @click="showCreateRequestModal(key)">
                      <api-outlined /> {{ t('collection.newRequest') }}
                    </a-menu-item>
                    <a-menu-item @click="showRenameModal(key)">
                      <edit-outlined /> {{ t('collection.rename') }}
                    </a-menu-item>
                    <a-menu-item danger @click="confirmDelete(key)">
                      <delete-outlined /> {{ t('collection.delete') }}
                    </a-menu-item>
                  </a-menu>
                </template>
                <more-outlined class="action-icon" />
              </a-dropdown>
            </div>
          </div>
        </template>
      </a-tree>
    </div>

    <!-- 创建集合模态框 -->
    <a-modal
      v-model:visible="createCollectionVisible"
      :title="t('collection.createCollection')"
      @ok="createCollection"
    >
      <a-form :model="collectionForm">
        <a-form-item :label="t('collection.name')">
          <a-input v-model:value="collectionForm.name" />
        </a-form-item>
        <a-form-item :label="t('collection.description')">
          <a-textarea v-model:value="collectionForm.description" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 创建文件夹模态框 -->
    <a-modal
      v-model:visible="createFolderVisible"
      :title="t('collection.createFolder')"
      @ok="createFolder"
    >
      <a-form :model="folderForm">
        <a-form-item :label="t('collection.name')">
          <a-input v-model:value="folderForm.name" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 创建请求模态框 -->
    <a-modal
      v-model:visible="createRequestVisible"
      :title="t('collection.createRequest')"
      @ok="createRequest"
    >
      <a-form :model="requestForm">
        <a-form-item :label="t('collection.name')">
          <a-input v-model:value="requestForm.name" />
        </a-form-item>
        <a-form-item :label="t('collection.method')">
          <a-select v-model:value="requestForm.method">
            <a-select-option v-for="method in httpMethods" :key="method" :value="method">
              {{ method }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :label="t('collection.url')">
          <a-input v-model:value="requestForm.url" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 重命名模态框 -->
    <a-modal
      v-model:visible="renameVisible"
      :title="t('collection.rename')"
      @ok="rename"
    >
      <a-form :model="renameForm">
        <a-form-item :label="t('collection.name')">
          <a-input v-model:value="renameForm.name" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAppStore } from '../store/app'
import { useI18n } from 'vue-i18n'
import { message, Modal } from 'ant-design-vue'
import {
  FolderAddOutlined,
  FolderOutlined,
  FolderOpenOutlined,
  ApiOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons-vue'
import type { TreeDataItem } from 'ant-design-vue/es/tree/Tree'
import { collectionManager } from '../utils/collectionManager'
import type { CollectionItem } from '../types/collection'

const { t } = useI18n()
const appStore = useAppStore()
const searchKeyword = ref('')
const selectedKeys = ref<string[]>([])
const expandedKeys = ref<string[]>([])

// 集合数据
const collections = ref<CollectionItem[]>([])

// 在组件挂载时加载数据
onMounted(() => {
  collections.value = collectionManager.getCollections()
})

// 监听集合变化并更新视图
watch(() => collectionManager.getCollections(), (newCollections) => {
  collections.value = newCollections
})

// 过滤后的集合
const filteredCollections = computed(() => {
  if (!searchKeyword.value) return collections.value
  
  const search = searchKeyword.value.toLowerCase()
  return collections.value.map(collection => filterNode(collection, search))
    .filter(Boolean) as CollectionItem[]
})

// 递归过滤节点
const filterNode = (node: CollectionItem, search: string): CollectionItem | null => {
  if (node.title.toLowerCase().includes(search)) return node
  
  if (node.children) {
    const filteredChildren = node.children
      .map(child => filterNode(child, search))
      .filter(Boolean) as CollectionItem[]
    
    if (filteredChildren.length) {
      return { ...node, children: filteredChildren }
    }
  }
  
  return null
}

// 事件处理
const onSelect = (keys: string[], info: { selected: boolean; node: CollectionItem }) => {
  selectedKeys.value = keys
  if (info.selected && info.node.type === 'request') {
    // 发出事件通知父组件加载请求数据
    emit('load-request', {
      method: info.node.method || 'GET',
      url: info.node.url || '',
      headers: info.node.headers || {},
      params: info.node.params || {},
      body: info.node.body || '',
      bodyType: info.node.bodyType || 'none'
    })
  }
}

const onExpand = (keys: string[]) => {
  expandedKeys.value = keys
}

// 表单数据
const collectionForm = ref({ name: '', description: '' })
const folderForm = ref({ name: '' })
const requestForm = ref({ name: '', method: 'GET', url: '' })
const renameForm = ref({ name: '' })

// 模态框可见性
const createCollectionVisible = ref(false)
const createFolderVisible = ref(false)
const createRequestVisible = ref(false)
const renameVisible = ref(false)

// HTTP 方法
const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']

// 当前选中的父节点
const currentParentKey = ref('')

// 添加折叠状态
const isCollapsed = ref(false)

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

const showCreateCollectionModal = () => {
  collectionForm.value = { name: '', description: '' }
  createCollectionVisible.value = true
}

const showCreateFolderModal = (parentKey: string) => {
  currentParentKey.value = parentKey
  folderForm.value = { name: '' }
  createFolderVisible.value = true
}

const showCreateRequestModal = (parentKey: string) => {
  currentParentKey.value = parentKey
  requestForm.value = { name: '', method: 'GET', url: '' }
  createRequestVisible.value = true
}

const showRenameModal = (key: string) => {
  currentParentKey.value = key
  const node = findNode(collections.value, key)
  if (node) {
    renameForm.value = { name: node.title }
    renameVisible.value = true
  }
}

const findNode = (nodes: CollectionItem[], key: string): CollectionItem | null => {
  for (const node of nodes) {
    if (node.key === key) return node
    if (node.children) {
      const found = findNode(node.children, key)
      if (found) return found
    }
  }
  return null
}

const createCollection = () => {
  if (!collectionForm.value.name) return
  
  const newCollection: CollectionItem = {
    key: Date.now().toString(),
    title: collectionForm.value.name,
    type: 'collection',
    children: [],
    description: collectionForm.value.description,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
  
  // 只调用 collectionManager 的方法，本地状态会通过 watch 自动更新
  collectionManager.addCollection(newCollection)
  
  // 自动展开新创建的集合
  expandedKeys.value = [...expandedKeys.value, newCollection.key]
  
  createCollectionVisible.value = false
  collectionForm.value = { name: '', description: '' }
  message.success(t('collection.createSuccess'))
}

const createFolder = () => {
  if (!folderForm.value.name) return
  
  const newFolder: CollectionItem = {
    key: Date.now().toString(),
    title: folderForm.value.name,
    type: 'folder',
    children: [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
  
  // 只调用 collectionManager 的方法
  collectionManager.addNode(currentParentKey.value, newFolder)
  
  // 自动展开新创建的文件夹
  expandedKeys.value = [...expandedKeys.value, currentParentKey.value, newFolder.key]
  
  createFolderVisible.value = false
  folderForm.value = { name: '' }
  message.success(t('collection.createSuccess'))
}

const createRequest = () => {
  if (!requestForm.value.name) return
  
  const newRequest: CollectionItem = {
    key: Date.now().toString(),
    title: requestForm.value.name,
    type: 'request',
    method: requestForm.value.method,
    url: requestForm.value.url,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
  
  // 只调用 collectionManager 的方法
  collectionManager.addNode(currentParentKey.value, newRequest)
  
  // 自动展开父节点
  if (!expandedKeys.value.includes(currentParentKey.value)) {
    expandedKeys.value = [...expandedKeys.value, currentParentKey.value]
  }
  
  createRequestVisible.value = false
  requestForm.value = { name: '', method: 'GET', url: '' }
  message.success(t('collection.createSuccess'))
}

const rename = () => {
  if (!renameForm.value.name) return
  
  // 只调用 collectionManager 的方法
  collectionManager.updateNode(currentParentKey.value, {
    title: renameForm.value.name,
    updatedAt: Date.now()
  })
  
  renameVisible.value = false
  renameForm.value = { name: '' }
  message.success(t('collection.renameSuccess'))
}

const confirmDelete = (key: string) => {
  Modal.confirm({
    title: t('collection.confirmDelete'),
    content: t('collection.deleteMessage'),
    onOk: () => {
      // 只调用 collectionManager 的方法
      collectionManager.deleteNode(key)
      message.success(t('collection.deleteSuccess'))
    }
  })
}

// 定义事件
const emit = defineEmits(['load-request'])
</script>

<style scoped>
.collection-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(47, 84, 235, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  overflow: hidden;
  transition: all 0.3s ease;
}

.collection-panel.collapsed {
  width: 300px;
}

.theme-dark.collection-panel {
  background: rgba(30, 30, 30, 0.8);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.collection-header {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: rgba(255, 255, 255, 0.5);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.theme-dark .collection-header {
  background: rgba(0, 0, 0, 0.2);
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.search-input {
  width: 100%;
}

.collection-tree {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.tree-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 4px 0;
}

.node-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-actions {
  opacity: 0;
  transition: opacity 0.3s;
}

.tree-node:hover .node-actions {
  opacity: 1;
}

.action-icon {
  padding: 4px;
  font-size: 16px;
  color: rgba(0, 0, 0, 0.45);
  cursor: pointer;
  transition: all 0.3s;
}

.action-icon:hover {
  color: #1890ff;
  background: rgba(24, 144, 255, 0.1);
  border-radius: 4px;
}

.theme-dark .action-icon {
  color: rgba(255, 255, 255, 0.45);
}

:deep(.ant-tree) {
  background: transparent;
}

:deep(.ant-tree-node-content-wrapper) {
  width: 100%;
}

:deep(.ant-tree-title) {
  width: 100%;
}

:deep(.ant-tree-node-selected) {
  background-color: rgba(24, 144, 255, 0.1) !important;
}

:deep(.ant-tree-switcher) {
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.ant-tree-switcher-icon) {
  font-size: 14px;
}

:deep(.ant-tree-indent-unit) {
  width: 16px;
}

:deep(.ant-modal-content) {
  border-radius: 12px;
  overflow: hidden;
}

:deep(.ant-form-item:last-child) {
  margin-bottom: 0;
}

.node-icon {
  margin-right: 8px;
  font-size: 16px;
  color: rgba(0, 0, 0, 0.45);
}

.theme-dark .node-icon {
  color: rgba(255, 255, 255, 0.45);
}

.header-top {
  display: flex;
  gap: 8px;
  align-items: center;
}

.collapse-button {
  padding: 0 8px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.collapse-button:hover {
  background: rgba(0, 0, 0, 0.04);
}

.theme-dark .collapse-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.collection-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style> 