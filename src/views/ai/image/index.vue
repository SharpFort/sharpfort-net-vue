<template>
  <div class="ai-image-container h-[calc(100vh-80px)] w-full flex overflow-hidden rounded-2xl bg-slate-50 dark:bg-slate-900 !text-slate-800 dark:!text-slate-200">
    
    <!-- Left Sidebar: Generator Control Panel -->
    <aside class="w-[360px] h-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-2xl border-r border-slate-200 dark:border-slate-700/50 flex flex-col z-10 shadow-lg relative">
      <div class="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-purple-500/5 pointer-events-none"></div>
      
      <div class="p-6 border-b border-slate-200/60 dark:border-slate-700/60 flex items-center gap-3 relative z-10">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md flex items-center justify-center text-white">
          <el-icon :size="20"><Picture /></el-icon>
        </div>
        <div>
          <h1 class="text-xl font-bold tracking-tight">AI 绘画工坊</h1>
          <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">释放无限视觉想象力</p>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar relative z-10">
        
        <!-- Prompt Input -->
        <div class="space-y-2">
          <label class="flex items-center justify-between text-sm font-bold text-slate-700 dark:text-slate-300">
            <span>画面描述 (Prompt)</span>
            <el-tooltip content="使用生动的形容词可以获得更好的效果"><el-icon class="text-slate-400"><QuestionFilled /></el-icon></el-tooltip>
          </label>
          <div class="relative bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 focus-within:border-indigo-500 dark:focus-within:border-indigo-500 transition-colors">
            <el-input v-model.trim="form.prompt"
              type="textarea"
              :autosize="{ minRows: 4, maxRows: 6 }"
              placeholder="描述你想看到的画面，例如：一只赛博朋克风格的猫咪在霓虹灯下，4k分辨率，极致细节..."
              class="custom-textarea !border-none"
            />
          </div>
        </div>

        <!-- Negative Prompt Input -->
        <div class="space-y-2">
          <label class="text-sm font-bold text-slate-700 dark:text-slate-300">反向词 (Negative Prompt)</label>
          <el-input v-model.trim="form.negativePrompt"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4 }"
            placeholder="不希望出现的元素，例如：模糊、变形、水印..."
            class="custom-textarea-sub"
          />
        </div>

        <!-- Advance Options -->
        <div class="grid grid-cols-2 gap-4">
          <!-- Size -->
          <div class="space-y-2">
            <label class="text-xs font-bold text-slate-500 uppercase tracking-widest">图片比例</label>
            <el-select v-model="form.size" placeholder="尺寸" class="w-full custom-select">
              <el-option label="1024x1024 (1:1)" value="1024x1024" />
              <el-option label="768x1024 (3:4)" value="768x1024" />
              <el-option label="1024x768 (4:3)" value="1024x768" />
              <el-option label="512x1024 (1:2)" value="512x1024" />
            </el-select>
          </div>

          <!-- Quantity -->
          <div class="space-y-2">
            <label class="text-xs font-bold text-slate-500 uppercase tracking-widest">生成数量</label>
            <el-input-number v-model="form.n" :min="1" :max="4" :step="1" class="!w-full" controls-position="right" />
          </div>
        </div>

        <!-- Quality / Style -->
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="text-xs font-bold text-slate-500 uppercase tracking-widest">画质</label>
            <el-select v-model="form.quality" placeholder="默认" class="w-full custom-select">
              <el-option label="标准" value="standard" />
              <el-option label="高清 (HD)" value="hd" />
            </el-select>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-slate-500 uppercase tracking-widest">风格</label>
            <el-select v-model="form.style" placeholder="默认" class="w-full custom-select">
              <el-option label="自然 (Natural)" value="natural" />
              <el-option label="生动 (Vivid)" value="vivid" />
            </el-select>
          </div>
        </div>

        <!-- Model Selection -->
        <div class="space-y-2">
          <label class="text-xs font-bold text-slate-500 uppercase tracking-widest">推理模型</label>
          <div v-loading="loadingModels" class="min-h-[40px]">
            <el-select v-model="form.modelId" placeholder="选择生图大模型" class="w-full custom-select">
              <el-option v-for="m in models" :key="m.id" :label="m.name" :value="m.id">
                <div class="flex items-center justify-between">
                  <span>{{ m.name }}</span>
                  <span class="text-xs text-slate-400">{{ m.providerName }}</span>
                </div>
              </el-option>
            </el-select>
          </div>
        </div>
      </div>

      <!-- Generate Button -->
      <div class="p-6 border-t border-slate-200/60 dark:border-slate-700/60 relative z-10 bg-white/50 dark:bg-slate-900/50">
        <el-button 
          type="primary" 
          class="w-full !rounded-xl !h-12 !text-base shadow-[0_8px_20px_rgb(99,102,241,0.3)] hover:shadow-[0_10px_25px_rgb(99,102,241,0.4)] transition-all duration-300 font-bold overflow-hidden group"
          :loading="isGenerating"
          :disabled="!form.prompt || !form.modelId"
          @click="startGeneration"
        >
          <span class="relative z-10 flex items-center justify-center gap-2">
            <el-icon v-if="!isGenerating"><MagicStick /></el-icon>
            {{ isGenerating ? '生成中...' : '开始生成' }}
          </span>
          <div class="absolute inset-0 h-full w-0 bg-white/20 group-hover:w-full transition-all duration-500 ease-out z-0"></div>
        </el-button>
        <p class="text-[11px] text-center mt-3 text-slate-400 font-medium">生成过程可能需要 10~30 秒，请耐心等待</p>
      </div>
    </aside>

    <!-- Right Main Area: Gallery -->
    <main class="flex-1 flex flex-col relative bg-slate-100/50 dark:bg-slate-900">
      
      <!-- Top Nav -->
      <header class="h-16 px-6 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-20">
        <div class="flex gap-6 h-full">
          <button 
            @click="activeTab = 'mine'" 
            :class="['h-full border-b-2 font-bold px-2 transition-colors', activeTab === 'mine' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200']"
          >
            我的创作
          </button>
          <button 
            @click="activeTab = 'plaza'" 
            :class="['h-full border-b-2 font-bold px-2 transition-colors', activeTab === 'plaza' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200']"
          >
            灵感广场
          </button>
        </div>
        <div class="flex items-center gap-2">
          <el-button @click="fetchData" circle plain size="small" class="!border-none !bg-white hover:!bg-slate-100 dark:!bg-slate-800 dark:hover:!bg-slate-700 shadow-sm">
            <el-icon><RefreshRight /></el-icon>
          </el-button>
        </div>
      </header>

      <!-- Gallery Display Area -->
      <div class="flex-1 overflow-y-auto p-6 scroll-smooth custom-scrollbar" v-loading="loadingData">
        
        <!-- Empty State -->
        <div v-if="!loadingData && displayItems.length === 0" class="h-full flex flex-col items-center justify-center text-center opacity-60">
          <el-icon :size="60" class="text-indigo-200 dark:text-indigo-900 mb-4"><PictureRounded /></el-icon>
          <p class="text-lg font-bold">空空如也</p>
          <p class="text-sm">暂无生成的图片，尝试在左侧输入你的创意描述吧</p>
        </div>

        <!-- Images Grid -->
        <div v-else class="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6 w-full max-w-[1600px] mx-auto">
          
          <div 
            v-for="(item, index) in displayItems" 
            :key="item.id || index" 
            class="break-inside-avoid relative group rounded-2xl overflow-hidden bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <!-- Pending / Processing State -->
            <div v-if="item.status === 0 || item.status === 1" class="aspect-square w-full bg-slate-100 dark:bg-slate-700 flex flex-col items-center justify-center p-6 relative overflow-hidden">
              <!-- Animated gradient sweeping across -->
              <div class="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 dark:via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
              
              <el-progress type="dashboard" :percentage="activeTaskProgress" :color="progressColors" class="mb-4" />
              <p class="text-sm font-bold text-indigo-500 animate-pulse">{{ item.status === 0 ? '排队中...' : '渲染中...' }}</p>
              <p class="text-xs text-slate-400 mt-2 text-center line-clamp-2 w-full px-4">{{ item.prompt || '暂无描述' }}</p>
            </div>

            <!-- Failed State -->
            <div v-else-if="item.status === 3" class="aspect-[4/3] w-full bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-800 flex flex-col items-center justify-center p-6">
              <el-icon :size="40" class="text-red-400 mb-3"><CircleCloseFilled /></el-icon>
              <p class="text-sm font-bold text-red-500">生成失败</p>
              <p class="text-xs text-red-400/80 mt-1">{{ item.errorMessage || '未知系统错误' }}</p>
            </div>

            <!-- Success State -->
            <div v-else class="relative w-full overflow-hidden bg-slate-100 dark:bg-slate-900 min-h-[200px]">
              <el-image 
                :src="getFirstImageUrl(item.resultUrl)" 
                :preview-src-list="getAllImageUrls(item.resultUrl)"
                initial-index="0"
                fit="cover" 
                class="w-full h-auto block transform group-hover:scale-105 transition-transform duration-700"
                lazy
              >
                <template #placeholder>
                  <div class="w-full h-48 flex items-center justify-center text-slate-300 dark:text-slate-600">
                    <el-icon class="is-loading" :size="30"><Loading /></el-icon>
                  </div>
                </template>
              </el-image>
              
              <!-- Hover Overlay Data -->
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 text-white z-10 pointer-events-none">
                <p class="text-xs font-medium line-clamp-3 leading-relaxed mb-2 shadow-sm">{{ item.prompt }}</p>
                <div class="flex items-center justify-between pointer-events-auto">
                  <span class="text-[10px] text-white/70">{{ new Date(item.creationTime || '').toLocaleDateString() }}</span>
                  <div class="flex gap-2">
                    <el-button v-if="activeTab === 'mine'" @click.stop="deleteItem(item.id)" circle size="small" type="danger" plain class="!bg-black/50 !border-white/20 hover:!bg-red-500 hover:!text-white hover:!border-red-500 backdrop-blur-sm">
                      <el-icon><Delete /></el-icon>
                    </el-button>
                    <!-- Future: Download or Publish Button -->
                  </div>
                </div>
              </div>
            </div>

            <!-- Always visible meta info for success state on mobile or if needed -->
            <div v-if="item.status === 2" class="p-4 bg-white dark:bg-slate-800 lg:hidden">
              <p class="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{{ item.prompt }}</p>
            </div>
          </div>

        </div>

      </div>
    </main>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Picture, QuestionFilled, MagicStick, RefreshRight, 
  PictureRounded, CircleCloseFilled, Loading, Delete 
} from '@element-plus/icons-vue'
import { aiImage } from '@/api/ai'

const models = ref<Api.AiModel.AiModelDto[]>([])
const loadingModels = ref(false)

const activeTab = ref<'mine' | 'plaza'>('mine')
const loadingData = ref(false)

const myTasks = ref<Api.AiImage.ImageTaskOutput[]>([])
const plazaTasks = ref<Api.AiImage.ImageTaskOutput[]>([])

const isGenerating = ref(false)
const activeGeneratingTaskId = ref<string | null>(null)
let pollTimer: any = null
const activeTaskProgress = ref(0) // Visual fake progress

const progressColors = [
  { color: '#818cf8', percentage: 20 },
  { color: '#6366f1', percentage: 40 },
  { color: '#4f46e5', percentage: 60 },
  { color: '#8b5cf6', percentage: 80 },
  { color: '#a855f7', percentage: 100 },
]

const form = ref<Api.AiImage.ImageGenerationInput>({
  prompt: '',
  negativePrompt: '',
  size: '1024x1024',
  modelId: '',
  n: 1,
  quality: 'standard',
  style: 'natural'
})

const displayItems = computed(() => {
  return activeTab.value === 'mine' ? myTasks.value : plazaTasks.value
})

const fetchModels = async () => {
  try {
    loadingModels.value = true
    const res = await aiImage.getModels()
    models.value = res || []
    if (models.value.length > 0) {
      form.value.modelId = models.value[0].id
    }
  } catch (err: any) {
    ElMessage.error(err.message || '获取模型失败')
  } finally {
    loadingModels.value = false
  }
}

const fetchData = async () => {
  try {
    loadingData.value = true
    if (activeTab.value === 'mine') {
      const res = await aiImage.getMyTasks({
        MaxResultCount: 50,
        SkipCount: 0
      })
      // Ensure local array is updated, but don't overwrite if actively polling the top item
      const newItems = res.items || []
      
      // If we have an active generating item locally, we might want to preserve it or let the server overwrite it with its real state.
      // Usually, if the active task is returned by server, server state overrides.
      myTasks.value = newItems
    } else {
      const res = await aiImage.getPlaza({
        MaxResultCount: 50,
        SkipCount: 0
      })
      plazaTasks.value = res.items || []
    }
  } catch (err: any) {
    ElMessage.error(err.message || '获取图片数据失败')
  } finally {
    loadingData.value = false
  }
}

const startGeneration = async () => {
  if (!form.value.prompt || !form.value.modelId) return
  try {
    isGenerating.value = true
    activeTab.value = 'mine' // Force switch to personal workspace
    
    // Call the API
    const taskIdString = await aiImage.generate({ ...form.value })
    // The C# returns a TaskID string
    if (!taskIdString) throw new Error("服务器未返回任务ID")

    activeGeneratingTaskId.value = taskIdString
    activeTaskProgress.value = 10
    
    // Insert a dummy item into UI to show loading state at the top
    myTasks.value.unshift({
      id: taskIdString,
      prompt: form.value.prompt,
      status: 0, // Pending
      creationTime: new Date().toISOString()
    })

    // Start Polling
    startPolling(taskIdString)

  } catch (err: any) {
    ElMessage.error(err.message || '发起生成任务失败')
    isGenerating.value = false
  }
}

const startPolling = (taskId: string) => {
  if (pollTimer) clearInterval(pollTimer)
  
  // Fake progress incrementer
  const progressTimer = setInterval(() => {
    if (activeTaskProgress.value < 90) {
      activeTaskProgress.value += Math.floor(Math.random() * 10) + 5
      if (activeTaskProgress.value > 90) activeTaskProgress.value = 90
    }
  }, 1000)

  // Polling logic
  pollTimer = setInterval(async () => {
    try {
      const taskDetail = await aiImage.getTask(taskId)
      
      // Update the dummy item in the array with actual data
      const index = myTasks.value.findIndex(t => t.id === taskId)
      if (index !== -1) {
        myTasks.value[index] = { ...myTasks.value[index], ...taskDetail }
      }

      if (taskDetail.status === 2 || taskDetail.status === 3) {
        // Task completed (Success or Failed)
        clearInterval(pollTimer)
        clearInterval(progressTimer)
        pollTimer = null
        isGenerating.value = false
        activeGeneratingTaskId.value = null
        activeTaskProgress.value = 100
        
        if (taskDetail.status === 2) {
          ElMessage.success('图片生成成功')
        } else {
          ElMessage.error(`图片生成失败: ${taskDetail.errorMessage}`)
        }
      }
    } catch (err) {
      console.error('Polling error', err)
      // We don't clear interval here immediately to tolerate temporary network drops.
      // E.g. we could count failures and abort after 3 consecutive failures.
    }
  }, 3000)
}

const deleteItem = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除此图片吗？执行后无法恢复。', '删除确认', { type: 'warning' })
    await aiImage.deleteMyTasks([id])
    ElMessage.success('删除成功')
    myTasks.value = myTasks.value.filter(t => t.id !== id)
  } catch (err: any) {
    if (err !== 'cancel') {
      ElMessage.error(err.message || '删除失败')
    }
  }
}

// Utility to parse the resultUrl which might be comma separated
const getAllImageUrls = (urlsStr?: string): string[] => {
  if (!urlsStr) return []
  return urlsStr.split(',').map(s => s.trim()).filter(Boolean)
}

const getFirstImageUrl = (urlsStr?: string): string => {
  const urls = getAllImageUrls(urlsStr)
  return urls.length > 0 ? urls[0] : ''
}

onMounted(() => {
  fetchModels()
  fetchData()
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
})
</script>

<style scoped>
/* Scrollbar */
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.4); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(148, 163, 184, 0.6); }

/* Textareas & Inputs styling Overrides */
:deep(.custom-textarea .el-textarea__inner),
:deep(.custom-textarea-sub .el-textarea__inner) {
  background-color: transparent !important;
  box-shadow: none !important;
  font-family: inherit;
  line-height: 1.6;
  resize: none;
  border-radius: 12px;
}
:deep(.custom-textarea .el-textarea__inner) { font-size: 14px; padding: 12px 14px; }
:deep(.custom-textarea-sub .el-textarea__inner) { font-size: 13px; padding: 10px 12px; background-color: rgba(248,250,252,0.5) !important; border: 1px solid rgba(226,232,240,0.8) !important; }
.dark :deep(.custom-textarea-sub .el-textarea__inner) { background-color: rgba(15,23,42,0.4) !important; border-color: rgba(51,65,85,0.8) !important; }

/* Select overriding */
:deep(.custom-select .el-input__wrapper) {
  background-color: rgba(248,250,252,0.8) !important;
  box-shadow: none !important;
  border: 1px solid rgba(226,232,240,0.8) !important;
  border-radius: 8px;
}
.dark :deep(.custom-select .el-input__wrapper) {
  background-color: rgba(15,23,42,0.6) !important;
  border-color: rgba(51,65,85,0.8) !important;
}
:deep(.custom-select .el-input.is-focus .el-input__wrapper) {
  border-color: #6366f1 !important;
}

/* Base animations */
@keyframes shimmer {
  100% { transform: translateX(100%); }
}
</style>

