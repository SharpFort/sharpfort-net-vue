<template>
  <div class="ai-chat-container h-[calc(100vh-80px)] w-full flex overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 shadow-2xl relative">
    
    <!-- Animated background accents -->
    <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-300/30 dark:bg-purple-600/20 blur-[100px] pointer-events-none animate-pulse-slow"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-300/30 dark:bg-blue-600/20 blur-[100px] pointer-events-none animate-pulse-slow" style="animation-delay: 2s;"></div>

    <!-- Sidebar: Model Selection & Settings -->
    <aside class="w-80 h-full backdrop-blur-xl bg-white/40 dark:bg-slate-800/40 border-r border-white/50 dark:border-slate-700/50 flex flex-col z-10 transition-all duration-300">
      <div class="p-6 border-b border-white/50 dark:border-slate-700/50">
        <h1 class="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 tracking-tight flex items-center gap-2">
          <el-icon><ChatLineRound /></el-icon>
          AI 通枢
        </h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium tracking-wider uppercase">全局智能链路</p>
      </div>

      <div class="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <!-- Model Selection -->
        <div class="mb-6">
          <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-3 uppercase tracking-widest">当前交互模型</label>
          <div v-if="loadingModels" class="space-y-3">
            <el-skeleton animated>
              <template #template>
                <el-skeleton-item variant="rect" style="height: 60px; border-radius: 12px" />
              </template>
            </el-skeleton>
          </div>
          <div v-else-if="modelList.length === 0" class="text-center py-6 text-slate-400 text-sm">
            暂无可用模型
          </div>
          <div v-else class="space-y-3">
            <div 
              v-for="model in modelList" 
              :key="model.id"
              @click="selectModel(model)"
              :class="[
                'group p-3 rounded-xl border cursor-pointer transition-all duration-300 flex items-center gap-3 relative overflow-hidden',
                selectedModelId === model.id 
                  ? 'bg-indigo-50/80 dark:bg-indigo-900/40 border-indigo-200 dark:border-indigo-700 shadow-sm' 
                  : 'bg-white/50 dark:bg-slate-800/50 border-transparent hover:bg-white/80 dark:hover:bg-slate-800/80 hover:border-slate-200 dark:hover:border-slate-600'
              ]"
            >
              <!-- Active Indicator -->
              <div v-if="selectedModelId === model.id" class="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>

              <el-avatar :size="36" shape="square" class="bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 !rounded-lg text-indigo-600 dark:text-indigo-300 shadow-inner">
                <img v-if="model.iconUrl" :src="model.iconUrl" alt="icon" />
                <span v-else class="text-xs font-bold">{{ model.name?.substring(0, 2).toUpperCase() }}</span>
              </el-avatar>
              
              <div class="flex-1 truncate">
                <h3 class="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{{ model.name }}</h3>
                <div class="flex items-center gap-2 mt-0.5">
                  <span class="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-medium">{{ model.providerName }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Session settings -->
        <div>
          <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-3 uppercase tracking-widest">模型能力点</label>
          <div class="bg-white/40 dark:bg-slate-800/40 rounded-xl p-4 border border-white/50 dark:border-slate-700/50">
            <el-select v-model="apiType" class="w-full !bg-transparent custom-select" placeholder="API Type" popper-class="glass-popper">
              <el-option label="Completions" :value="0" />
              <el-option label="Messages" :value="1" />
              <el-option label="Responses" :value="2" />
              <el-option label="GenerateContent" :value="3" />
            </el-select>
          </div>
        </div>
      </div>

      <!-- Action Footer -->
      <div class="p-4 border-t border-white/50 dark:border-slate-700/50">
        <el-button @click="clearChat" class="w-full !rounded-xl !h-10 hover:!bg-red-50 hover:!text-red-500 hover:!border-red-200 transition-colors duration-300 text-slate-600">
          <el-icon class="mr-2"><Delete /></el-icon> 清理会话记忆
        </el-button>
      </div>
    </aside>

    <!-- Main Chat Area -->
    <main class="flex-1 flex flex-col z-10 relative">
      <!-- Chat Header -->
      <header class="h-16 backdrop-blur-md bg-white/30 dark:bg-slate-900/30 border-b border-white/20 dark:border-slate-700/30 flex items-center justify-between px-6">
        <div class="flex items-center gap-3">
          <div class="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
          <h2 class="text-sm font-bold text-slate-700 dark:text-slate-200">
            {{ selectedModel ? selectedModel.name : '请选中左侧模型开始体验' }}
          </h2>
        </div>
        <div class="flex items-center gap-4">
          <el-tooltip content="会话详情" placement="bottom">
            <el-button circle plain size="small" class="!border-none !bg-white/40 hover:!bg-white/80 dark:!bg-slate-800/40 dark:hover:!bg-slate-800/80">
              <el-icon><InfoFilled /></el-icon>
            </el-button>
          </el-tooltip>
        </div>
      </header>

      <!-- Messages Pane -->
      <div class="flex-1 overflow-y-auto p-6 scroll-smooth custom-scrollbar flex flex-col gap-6" ref="messagesRef">
        <!-- Empty State -->
        <div v-if="messages.length === 0" class="flex-1 flex flex-col items-center justify-center text-center opacity-70">
          <div class="w-24 h-24 mb-6 rounded-full bg-gradient-to-tr from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 flex items-center justify-center shadow-inner">
            <el-icon :size="40" class="text-indigo-400"><Cpu /></el-icon>
          </div>
          <h3 class="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">今天我能帮您些什么？</h3>
          <p class="text-sm text-slate-500 max-w-md">我是综合智能助手。您可以挑选左侧的不同 AI 推理引擎以开始交互体验。</p>
        </div>

        <!-- Chat Bubbles -->
        <div 
          v-for="(msg, index) in messages" 
          :key="index"
          :class="['flex w-full animate-fade-in-up', msg.role === 'user' ? 'justify-end' : 'justify-start']"
          :style="{ animationDelay: `${index * 0.05}s` }"
        >
          <div 
            :class="[
              'max-w-[75%] rounded-2xl px-5 py-4 shadow-sm relative group',
              msg.role === 'user' 
                ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-br-none' 
                : 'bg-white/90 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 border border-white/50 dark:border-slate-700/50 rounded-bl-none backdrop-blur-md'
            ]"
          >
            <div v-if="msg.role === 'assistant'" class="flex items-center gap-2 mb-2">
              <el-icon class="text-indigo-500"><MagicStick /></el-icon>
              <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400">{{ selectedModel?.name || 'AI' }}</span>
            </div>
            
            <div class="text-[15px] leading-relaxed whitespace-pre-wrap font-sans">{{ msg.content }}</div>
            
            <div :class="['text-[10px] mt-2 opacity-50 text-right', msg.role === 'user' ? 'text-indigo-200' : 'text-slate-400']">
               {{ msg.time }}
            </div>
          </div>
        </div>

        <!-- Typing Indicator -->
        <div v-if="isTyping" class="flex w-full justify-start animate-fade-in-up">
          <div class="bg-white/90 dark:bg-slate-800/90 border border-white/50 dark:border-slate-700/50 rounded-2xl rounded-bl-none px-5 py-4 shadow-sm backdrop-blur-md flex items-center gap-2">
            <div class="flex gap-1">
              <div class="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style="animation-delay: 0s"></div>
              <div class="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style="animation-delay: 0.2s"></div>
              <div class="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style="animation-delay: 0.4s"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Input Bar -->
      <div class="p-6 pt-2 z-20">
        <div class="relative bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 dark:border-slate-700/50 transition-all duration-300 focus-within:shadow-[0_8px_30px_rgb(99,102,241,0.1)] focus-within:border-indigo-300 dark:focus-within:border-indigo-600">
          <el-input
            v-model="inputRaw"
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 6 }"
            placeholder="输入您的问题... (Shift + Enter 换行)"
            class="chat-input !bg-transparent border-none"
            @keydown.enter.prevent="handleEnter"
          />
          
          <div class="flex justify-between items-center px-4 pb-3 pt-1">
            <div class="flex gap-2">
              <el-tooltip content="支持 Markdown 排版">
                <el-button circle plain size="small" class="!border-none !bg-transparent hover:!bg-slate-100 dark:hover:!bg-slate-700">
                  <el-icon><EditPen /></el-icon>
                </el-button>
              </el-tooltip>
            </div>
            
            <el-button 
              type="primary"
              @click="sendMessage"
              :disabled="!inputRaw.trim() || isTyping || !selectedModelId"
              class="!rounded-xl px-5 !h-9 shadow-md transition-all duration-300"
            >
              发送消息 <el-icon class="ml-1"><Position /></el-icon>
            </el-button>
          </div>
        </div>
        <p class="text-[11px] text-center mt-3 text-slate-400 font-medium">AI 可能会出现错误反馈，请务必人工核实重要信息。</p>
      </div>

    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { ElMessage } from 'element-plus'
import { 
  ChatLineRound, 
  Delete, 
  Position, 
  Cpu, 
  InfoFilled,
  MagicStick,
  EditPen
} from '@element-plus/icons-vue'
import { aiChat } from '@/api/ai'

const modelList = ref<Api.AiModel.AiModelDto[]>([])
const loadingModels = ref(true)

const selectedModelId = ref<string>('')
const apiType = ref<number>(1) // Default to Messages
const sessionId = ref<string>(uuidv4())
const inputRaw = ref('')
const isTyping = ref(false)
const messagesRef = ref<HTMLElement | null>(null)

const messages = ref<Api.AiChat.ChatMessage[]>([])

const selectedModel = computed(() => {
  return modelList.value.find(m => m.id === selectedModelId.value)
})

const fetchModels = async () => {
  try {
    loadingModels.value = true
    const res = await aiChat.getModelList()
    modelList.value = res || []
    
    // Auto-select first model if available
    if (modelList.value.length > 0) {
      selectModel(modelList.value[0])
    }
  } catch (err: any) {
    ElMessage.error(err?.message || '无法获取 AI 模型列表')
  } finally {
    loadingModels.value = false
  }
}

const selectModel = (model: Api.AiModel.AiModelDto) => {
  selectedModelId.value = model.id
  apiType.value = model.modelApiType ?? 1
}

const scrollToBottom = async () => {
  await nextTick()
  if (messagesRef.value) {
    messagesRef.value.scrollTop = messagesRef.value.scrollHeight
  }
}

const handleEnter = (e: any) => {
  if (e.shiftKey) return // Allow newlines on shift+enter
  sendMessage()
}

const sendMessage = async () => {
  const text = inputRaw.value.trim()
  if (!text || isTyping.value || !selectedModelId.value) return

  const now = new Date()
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  // Push user message
  messages.value.push({
    role: 'user',
    content: text,
    time: timeStr
  })
  
  inputRaw.value = ''
  isTyping.value = true
  scrollToBottom()

  try {
    const params: Api.AiChat.UnifiedSendParams = {
      apiType: apiType.value,
      modelId: selectedModelId.value,
      sessionId: sessionId.value
    }
    
    // Convert history to what backend expects.
    // Assuming backend might just accept the raw messages array or a specific struct.
    const body: Api.AiChat.UnifiedSendBody = {
      prompt: text,
      messages: messages.value.slice(0, -1) // Exclude the current text as it's passed as prompt
    }

    const res = await aiChat.unifiedSend(params, body)

    // Parse response based on API format, assuming text comes back as direct string or in a struct
    let replyContent = 'No content'
    if (typeof res === 'string') {
      replyContent = res
    } else if (res?.content) {
      replyContent = res.content
    } else if (res?.choices && res.choices[0]?.message?.content) {
      replyContent = res.choices[0].message.content
    } else {
      replyContent = JSON.stringify(res)
    }

    messages.value.push({
      role: 'assistant',
      content: replyContent,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })

  } catch (err: any) {
    ElMessage.error(err?.message || '消息发送失败，请重试')
    messages.value.push({
      role: 'system',
      content: '系统错误：网络连接失败或响应不合法。',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
  } finally {
    isTyping.value = false
    scrollToBottom()
  }
}

const clearChat = () => {
  messages.value = []
  sessionId.value = uuidv4() // generate new session
}

onMounted(() => {
  fetchModels()
})
</script>

<style scoped>
/* Glassmorphism custom scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.3);
  border-radius: 20px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.5);
}

/* Base tailwind animations definition if missing config */
@keyframes pulse-slow {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
}
.animate-pulse-slow {
  animation: pulse-slow 8s infinite alternate ease-in-out;
}

@keyframes fade-in-up {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in-up {
  animation: fade-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  opacity: 0;
}

/* Customize element plus textarea */
:deep(.chat-input .el-textarea__inner) {
  background-color: transparent !important;
  box-shadow: none !important;
  border: none !important;
  font-family: inherit;
  font-size: 15px;
  line-height: 1.6;
  resize: none;
  padding: 12px 16px;
  color: inherit;
}
:deep(.chat-input .el-textarea__inner:focus) {
  box-shadow: none !important;
}

/* Hide select box borders */
:deep(.custom-select .el-input__wrapper) {
  box-shadow: none !important;
  background-color: transparent !important;
  padding: 0;
}
:deep(.custom-select .el-input__inner) {
  font-weight: 600;
  color: rgb(71 85 105); /* text-slate-600 */
}
.dark :deep(.custom-select .el-input__inner) {
  color: rgb(203 213 225); /* text-slate-300 */
}
</style>
