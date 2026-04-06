<template>
  <div class="ai-tool-container h-[calc(100vh-80px)] w-full flex flex-col p-6 overflow-hidden bg-slate-50 dark:bg-slate-900 !text-slate-800 dark:!text-slate-200">
    <!-- Header Area -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 shadow-md flex items-center justify-center text-white">
          <el-icon :size="20"><Cpu /></el-icon>
        </div>
        <div>
          <h1 class="text-xl font-bold tracking-tight">AI 工具服务测试</h1>
          <p class="text-xs text-slate-500 font-medium mt-0.5">提供常用的文本翻译、内容总结及联网搜索功能集成测试</p>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50 p-6 overflow-y-auto">
      <el-tabs v-model="activeTab" class="custom-tabs">
        <!-- 翻译工具 -->
        <el-tab-pane label="文本翻译" name="translate">
          <div class="max-w-2xl mt-4">
            <el-form label-position="top">
              <el-form-item label="选择模型" required>
                <el-select v-model="translateForm.modelId" placeholder="请选择AI模型" class="w-full">
                  <el-option
                    v-for="model in models"
                    :key="model.id"
                    :label="model.name"
                    :value="model.id"
                  />
                </el-select>
              </el-form-item>
              
              <el-form-item label="目标语言" required>
                <el-input v-model="translateForm.targetLang" placeholder="例如: 英文, 日语, 繁体中文" />
              </el-form-item>
              
              <el-form-item label="待翻译文本" required>
                <el-input
                  v-model="translateForm.text"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入需要翻译的文本内容..."
                />
              </el-form-item>
              
              <el-button type="primary" :loading="loading.translate" @click="handleTranslate">
                开始翻译
              </el-button>

              <div v-if="results.translate" class="mt-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-700 whitespace-pre-wrap">
                {{ results.translate }}
              </div>
            </el-form>
          </div>
        </el-tab-pane>

        <!-- 总结工具 -->
        <el-tab-pane label="内容总结" name="summarize">
          <div class="max-w-2xl mt-4">
            <el-form label-position="top">
              <el-form-item label="选择模型" required>
                <el-select v-model="summarizeForm.modelId" placeholder="请选择AI模型" class="w-full">
                  <el-option
                    v-for="model in models"
                    :key="model.id"
                    :label="model.name"
                    :value="model.id"
                  />
                </el-select>
              </el-form-item>
              
              <el-form-item label="待总结内容" required>
                <el-input
                  v-model="summarizeForm.content"
                  type="textarea"
                  :rows="6"
                  placeholder="请输入长篇文章或资料内容，AI将为您提炼核心摘要..."
                />
              </el-form-item>
              
              <el-button type="primary" :loading="loading.summarize" @click="handleSummarize">
                生成摘要
              </el-button>

              <div v-if="results.summarize" class="mt-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-700 whitespace-pre-wrap">
                {{ results.summarize }}
              </div>
            </el-form>
          </div>
        </el-tab-pane>

        <!-- 联网搜索 -->
        <el-tab-pane label="联网问答(Search)" name="search">
          <div class="max-w-2xl mt-4">
            <el-form label-position="top">
              <el-form-item label="选择模型" required>
                <el-select v-model="searchForm.modelId" placeholder="请选择AI模型" class="w-full">
                  <el-option
                    v-for="model in models"
                    :key="model.id"
                    :label="model.name"
                    :value="model.id"
                  />
                </el-select>
              </el-form-item>
              
              <el-form-item label="搜索关键词" required>
                <el-input
                  v-model="searchForm.query"
                  placeholder="请输入搜索或提问内容..."
                  @keyup.enter="handleSearch"
                >
                  <template #append>
                    <el-button :icon="Search" @click="handleSearch" />
                  </template>
                </el-input>
              </el-form-item>

              <div class="mt-2" v-if="loading.search">
                <el-text type="info"><el-icon class="is-loading mr-1"><Loading /></el-icon> 正在为您检索...</el-text>
              </div>

              <div v-if="results.search" class="mt-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-700 whitespace-pre-wrap">
                {{ results.search }}
              </div>
            </el-form>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Cpu, Search, Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { aiTool, aiModel } from '@/api/ai'

const activeTab = ref('translate')

const models = ref<Api.AiModel.AiModelDto[]>([])

const loading = reactive({
  translate: false,
  summarize: false,
  search: false
})

const results = reactive({
  translate: '',
  summarize: '',
  search: ''
})

// Forms
const translateForm = reactive({ modelId: '', targetLang: '', text: '' })
const summarizeForm = reactive({ modelId: '', content: '' })
const searchForm = reactive({ modelId: '', query: '' })

const fetchModels = async () => {
  try {
    const res = await aiModel.getList({ SkipCount: 0, MaxResultCount: 100 })
    models.value = res.items || []
    if (models.value.length > 0) {
      translateForm.modelId = models.value[0].id
      summarizeForm.modelId = models.value[0].id
      searchForm.modelId = models.value[0].id
    }
  } catch (error) {
    console.error('Failed to load models for AiTool', error)
  }
}

const handleTranslate = async () => {
  if (!translateForm.modelId || !translateForm.targetLang || !translateForm.text) {
    return ElMessage.warning('请填写完整的翻译参数')
  }
  
  loading.translate = true
  results.translate = ''
  try {
    const res = await aiTool.translate(translateForm.modelId, {
      text: translateForm.text,
      targetLang: translateForm.targetLang
    })
    results.translate = res
  } catch (error: any) {
    ElMessage.error(error.message || '翻译请求失败')
  } finally {
    loading.translate = false
  }
}

const handleSummarize = async () => {
  if (!summarizeForm.modelId || !summarizeForm.content) {
    return ElMessage.warning('请填写完整的总结参数')
  }
  
  loading.summarize = true
  results.summarize = ''
  try {
    const res = await aiTool.summarize(summarizeForm.modelId, {
      content: summarizeForm.content
    })
    results.summarize = res
  } catch (error: any) {
    ElMessage.error(error.message || '总结请求失败')
  } finally {
    loading.summarize = false
  }
}

const handleSearch = async () => {
  if (!searchForm.modelId || !searchForm.query) {
    return ElMessage.warning('请填写搜索关键词')
  }
  
  loading.search = true
  results.search = ''
  try {
    const res = await aiTool.search(searchForm.modelId, {
      query: searchForm.query
    })
    results.search = res
  } catch (error: any) {
    ElMessage.error(error.message || '搜索请求失败')
  } finally {
    loading.search = false
  }
}

onMounted(() => {
  fetchModels()
})
</script>

<style scoped>
.custom-tabs :deep(.el-tabs__item) {
  font-size: 16px;
  font-weight: 500;
  padding: 0 20px;
}
.custom-tabs :deep(.el-tabs__nav-wrap::after) {
  height: 1px;
}
</style>
