<template>
  <a-modal
    v-model:visible="visible"
    :title="t('request.saveToCollection')"
    :confirm-loading="loading"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <a-form
      ref="formRef"
      :model="formState"
      :rules="rules"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 18 }"
    >
      <a-form-item
        :label="t('request.name')"
        name="name"
      >
        <a-input
          v-model:value="formState.name"
          :placeholder="t('request.namePlaceholder')"
          @pressEnter="handleOk"
        />
      </a-form-item>
      
      <a-form-item
        :label="t('request.collection')"
        name="collectionId"
      >
        <a-select
          v-model:value="formState.collectionId"
          :placeholder="t('request.selectCollection')"
          :loading="collectionsLoading"
        >
          <a-select-option
            v-for="collection in collections"
            :key="collection.id"
            :value="collection.id"
          >
            {{ collection.name }}
          </a-select-option>
        </a-select>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { message } from 'ant-design-vue'
import { nanoid } from 'nanoid'
import type { FormInstance } from 'ant-design-vue'
import type { Collection, CollectionRequest } from '../types/collection'
import { storageManager } from '../utils/storage'

const { t } = useI18n()
const emit = defineEmits<{
  (e: 'saved', request: CollectionRequest): void
}>()

const visible = ref(false)
const loading = ref(false)
const collectionsLoading = ref(false)
const formRef = ref<FormInstance>()
const collections = ref<Collection[]>([])

const formState = reactive({
  name: '',
  collectionId: undefined as string | undefined
})

const rules = {
  name: [
    { required: true, message: t('request.nameRequired'), trigger: 'blur' },
    { min: 2, max: 50, message: t('request.nameLength'), trigger: 'blur' }
  ],
  collectionId: [
    { required: true, message: t('request.collectionRequired'), trigger: 'change' }
  ]
}

// 当前要保存的请求数据
let currentRequest: Partial<CollectionRequest>

const loadCollections = async () => {
  try {
    collectionsLoading.value = true
    collections.value = storageManager.getCollections()
  } finally {
    collectionsLoading.value = false
  }
}

const handleOk = async () => {
  try {
    loading.value = true
    await formRef.value?.validate()
    
    const request: CollectionRequest = {
      id: nanoid(),
      name: formState.name,
      ...currentRequest,
      createdAt: Date.now(),
      updatedAt: Date.now()
    } as CollectionRequest

    // 保存到集合
    const collections = storageManager.getCollections()
    const collectionIndex = collections.findIndex(c => c.id === formState.collectionId)
    if (collectionIndex !== -1) {
      collections[collectionIndex].requests.push(request)
      collections[collectionIndex].updatedAt = Date.now()
      storageManager.saveCollections(collections)
      
      emit('saved', request)
      message.success(t('request.saveSuccess'))
      handleCancel()
    }
  } catch (error) {
    // 表单验证失败
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  formRef.value?.resetFields()
  visible.value = false
}

// 暴露方法给父组件
defineExpose({
  show: (request: Partial<CollectionRequest>) => {
    currentRequest = request
    formState.name = request.name || ''
    visible.value = true
    loadCollections()
  }
})

onMounted(() => {
  loadCollections()
})
</script>

<style scoped>
.ant-form-item {
  margin-bottom: 24px;
}

:deep(.ant-modal-body) {
  padding: 24px 24px 0;
}
</style>
