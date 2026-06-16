import request from '@/utils/http'

/**
 * AI 模型管理 API
 */
export const aiModel = {
  getList: (params?: Api.AiModel.AiModelSearchParams) => {
    return request.get<{ items: Api.AiModel.AiModelDto[]; totalCount: number }>({
      url: '/api/app/ai-model',
      params
    })
  },

  get: (id: string) => {
    return request.get<Api.AiModel.AiModelDto>({
      url: `/api/app/ai-model/${id}`
    })
  },

  post: (data: Api.AiModel.AiModelCreateInput) => {
    return request.post<Api.AiModel.AiModelDto>({
      url: '/api/app/ai-model',
      data
    })
  },

  put: (id: string, data: Api.AiModel.AiModelUpdateInput) => {
    return request.put<Api.AiModel.AiModelDto>({
      url: `/api/app/ai-model/${id}`,
      data
    })
  },

  delete: (id: string) => {
    return request.del<void>({
      url: `/api/app/ai-model/${id}`
    })
  }
}

/**
 * AI 聊天服务 API
 */
export const aiChat = {
  getModelList: () => {
    return request.get<Api.AiModel.AiModelDto[]>({
      url: '/api/app/ai-chat/model-list'
    })
  },

  unifiedSend: (params: Api.AiChat.UnifiedSendParams, data: Api.AiChat.UnifiedSendBody) => {
    return request.post<any>({
      url: '/api/app/ai-chat/unified-send',
      params,
      data
    })
  }
}

/**
 * AI 图片生成服务 API
 */
export const aiImage = {
  getModels: () => {
    return request.post<Api.AiModel.AiModelDto[]>({ url: '/api/app/ai-image/model' })
  },

  generate: (data: Api.AiImage.ImageGenerationInput) => {
    return request.post<string>({ url: '/api/app/ai-image/generate', data })
  },

  getTask: (taskId: string) => {
    return request.get<Api.AiImage.ImageTaskOutput>({ url: `/api/app/ai-image/task/${taskId}` })
  },

  getMyTasks: (params?: any) => {
    return request.get<{ items: Api.AiImage.ImageTaskOutput[]; totalCount: number }>({
      url: '/api/app/ai-image/my-tasks',
      params
    })
  },

  deleteMyTasks: (ids: string[]) => {
    return request.del<void>({
      url: '/api/app/ai-image',
      params: { ids }
    })
  },

  publish: (data: Api.AiImage.PublishImageInput) => {
    return request.post<void>({ url: '/api/app/ai-image/publish', data })
  },

  getPlaza: (params?: any) => {
    return request.get<{ items: Api.AiImage.ImageTaskOutput[]; totalCount: number }>({
      url: '/api/app/ai-image/plaza',
      params
    })
  },

  uploadBase64: (data: { base64: string }) => {
    return request.post<string>({ url: '/api/app/ai-image/upload-base64', data })
  }
}

/**
 * AI 提示词管理服务 API
 */
export const aiPrompt = {
  getList: (params: Api.AiPrompt.AiPromptSearchParams) => {
    return request.get<{ items: Api.AiPrompt.AiPromptDto[]; totalCount: number }>({
      url: '/api/app/ai-prompt',
      params
    })
  },

  get: (id: string) => {
    return request.get<Api.AiPrompt.AiPromptDto>({ url: `/api/app/ai-prompt/${id}` })
  },

  create: (data: Api.AiPrompt.AiPromptCreateInput) => {
    return request.post<Api.AiPrompt.AiPromptDto>({ url: '/api/app/ai-prompt', data })
  },

  update: (id: string, data: Api.AiPrompt.AiPromptUpdateInput) => {
    return request.put<Api.AiPrompt.AiPromptDto>({ url: `/api/app/ai-prompt/${id}`, data })
  },

  delete: (id: string) => {
    return request.del<void>({ url: `/api/app/ai-prompt/${id}` })
  }
}

/**
 * AI 供应商管理服务 API
 */
export const aiProvider = {
  getList: (params: Api.AiProvider.AiProviderSearchParams) => {
    return request.get<{ items: Api.AiProvider.AiProviderDto[]; totalCount: number }>({
      url: '/api/app/ai-provider',
      params
    })
  },

  get: (id: string) => {
    return request.get<Api.AiProvider.AiProviderDto>({ url: `/api/app/ai-provider/${id}` })
  },

  create: (data: Api.AiProvider.AiProviderCreateInput) => {
    return request.post<Api.AiProvider.AiProviderDto>({ url: '/api/app/ai-provider', data })
  },

  update: (id: string, data: Api.AiProvider.AiProviderUpdateInput) => {
    return request.put<Api.AiProvider.AiProviderDto>({ url: `/api/app/ai-provider/${id}`, data })
  },

  delete: (id: string) => {
    return request.del<void>({ url: `/api/app/ai-provider/${id}` })
  }
}

/**
 * AI 工具服务 API
 */
export const aiTool = {
  translate: (modelId: string, params: Api.AiTool.TranslateInput) => {
    return request.post<string>({ url: `/api/app/ai-tool/translate/${modelId}`, params })
  },

  summarize: (modelId: string, params: Api.AiTool.SummarizeInput) => {
    return request.post<string>({ url: `/api/app/ai-tool/summarize/${modelId}`, params })
  },

  search: (modelId: string, params: Api.AiTool.SearchInput) => {
    return request.post<string>({ url: `/api/app/ai-tool/search/${modelId}`, params })
  }
}

/**
 * 使用量统计服务 API
 */
export const usageStatistics = {
  getLast7DaysTokenUsage: (params?: { TokenId?: string }) => {
    return request.get<Api.UsageStatistics.DailyTokenUsageDto[]>({
      url: '/api/app/usage-statistics/last7Days-token-usage',
      params
    })
  },

  getModelTokenUsage: (params?: { TokenId?: string }) => {
    return request.get<Api.UsageStatistics.ModelTokenUsageDto[]>({
      url: '/api/app/usage-statistics/model-token-usage',
      params
    })
  },

  getLast24HoursTokenUsage: (params?: { TokenId?: string }) => {
    return request.get<Api.UsageStatistics.HourlyTokenUsageDto[]>({
      url: '/api/app/usage-statistics/last24Hours-token-usage',
      params
    })
  },

  getTodayModelUsage: (params?: { TokenId?: string }) => {
    return request.get<Api.UsageStatistics.ModelTodayUsageDto[]>({
      url: '/api/app/usage-statistics/today-model-usage',
      params
    })
  }
}

/**
 * Session 服务 API
 */
export const sessionApi = {
  getList: (params?: Api.Session.SessionSearchParams) => {
    return request.get<{ items: Api.Session.SessionDto[]; totalCount: number }>({
      url: '/api/app/session',
      params
    })
  },

  get: (id: string) => {
    return request.get<Api.Session.SessionDto>({
      url: `/api/app/session/${id}`
    })
  },

  post: (data: Api.Session.SessionCreateAndUpdateInput) => {
    return request.post<Api.Session.SessionDto>({
      url: '/api/app/session',
      data
    })
  },

  put: (id: string, data: Api.Session.SessionCreateAndUpdateInput) => {
    return request.put<Api.Session.SessionDto>({
      url: `/api/app/session/${id}`,
      data
    })
  },

  delete: (id: string) => {
    return request.del<void>({
      url: `/api/app/session/${id}`
    })
  }
}

/**
 * 系统使用量统计服务 API
 */
export const systemStatisticsApi = {
  getTokenStatistics: (data: Api.SystemStatistics.TokenStatisticsInput) => {
    return request.post<Api.SystemStatistics.TokenStatisticsOutput>({
      url: '/api/app/system-statistics/token',
      data
    })
  }
}

/**
 * OpenApi 服务 API
 */
export const openApi = {
  chatCompletions(data: Api.OpenApi.ThorChatCompletionsRequest) {
    return request.post<void>({ url: '/api/app/openApi/v1/chat/completions', data })
  },

  imagesGenerations(data: Api.OpenApi.ImageCreateRequest) {
    return request.post<void>({ url: '/api/app/openApi/v1/images/generations', data })
  },

  embeddings(data: Api.OpenApi.ThorEmbeddingInput) {
    return request.post<void>({ url: '/api/app/openApi/v1/embeddings', data })
  },

  getModels() {
    return request.get<Api.OpenApi.ModelsListDto>({ url: '/api/app/openApi/v1/models' })
  },

  messages(data: Api.OpenApi.AnthropicInput) {
    return request.post<void>({ url: '/api/app/openApi/v1/messages', data })
  }
}

/**
 * Token 服务 API
 */
export const aiToken = {
  getList: (params: Api.Token.TokenSearchParams) => {
    return request.get<{ items: Api.Token.TokenGetListOutputDto[]; totalCount: number }>({
      url: '/api/app/token/list',
      params
    })
  },

  getSelectList: () => {
    return request.get<Api.Token.TokenGetListOutputDto[]>({
      url: '/api/app/token/select-list'
    })
  },

  create: (data: Api.Token.TokenCreateInput) => {
    return request.post<void>({ url: '/api/app/token', data })
  },

  update: (data: Api.Token.TokenUpdateInput) => {
    return request.put<void>({ url: '/api/app/token', data })
  },

  delete: (id: string) => {
    return request.del<void>({ url: `/api/app/token/${id}` })
  },

  enable: (id: string) => {
    return request.post<void>({ url: `/api/app/token/${id}/enable` })
  },

  disable: (id: string) => {
    return request.post<void>({ url: `/api/app/token/${id}/disable` })
  }
}

// ===== 新增 API 对象 =====

/**
 * AI 知识库管理 API
 */
export const aiKms = {
  getList: (data?: Api.AiKms.AiKmsSearchParams) => {
    return request.post<{ items: Api.AiKms.AiKmsDto[]; totalCount: number }>({
      url: '/api/ai-kms/list',
      data
    })
  },

  getAll: () => {
    return request.get<Api.AiKms.AiKmsDto[]>({
      url: '/api/ai-kms/all'
    })
  },

  get: (id: string) => {
    return request.get<Api.AiKms.AiKmsDto>({
      url: `/api/ai-kms/${id}`
    })
  },

  create: (data: Api.AiKms.AiKmsDto) => {
    return request.post<Api.AiKms.AiKmsDto>({
      url: '/api/ai-kms',
      data
    })
  },

  update: (id: string, data: Api.AiKms.AiKmsDto) => {
    return request.put<Api.AiKms.AiKmsDto>({
      url: `/api/ai-kms/${id}`,
      data
    })
  },

  delete: (id: string) => {
    return request.del<void>({
      url: `/api/ai-kms/${id}`
    })
  },

  processVectorData: (kmsId: string) => {
    return request.post<void>({
      url: `/api/app/ai-kms/process-kmss-vector-data/${kmsId}`
    })
  }
}

/**
 * AI 技能/工具管理 API
 */
export const aiSkillTool = {
  getList: (data?: Api.AiSkillTool.AiSkillToolSearchParams) => {
    return request.post<{ items: Api.AiSkillTool.AiSkillToolDto[]; totalCount: number }>({
      url: '/api/ai-skill-tool/list',
      data
    })
  },

  getSkills: () => {
    return request.get<Api.AiSkillTool.AiSkillToolDto[]>({
      url: '/api/ai-skill-tool/skills'
    })
  },

  getTools: () => {
    return request.get<Api.AiSkillTool.AiSkillToolDto[]>({
      url: '/api/ai-skill-tool/tools'
    })
  },

  create: (data: Api.AiSkillTool.AiSkillToolDto) => {
    return request.post<Api.AiSkillTool.AiSkillToolDto>({
      url: '/api/ai-skill-tool',
      data
    })
  },

  update: (id: string, data: Api.AiSkillTool.AiSkillToolDto) => {
    return request.put<Api.AiSkillTool.AiSkillToolDto>({
      url: `/api/ai-skill-tool/${id}`,
      data
    })
  },

  delete: (id: string) => {
    return request.del<void>({
      url: `/api/ai-skill-tool/${id}`
    })
  }
}

/**
 * AI 应用管理 API (新版)
 */
export const aiAppManagement = {
  getList: (data?: Api.AiApp.AiAppGetListInput) => {
    return request.post<{ items: Api.AiApp.AiAppDto[]; totalCount: number }>({
      url: '/api/ai-app/list',
      data
    })
  },

  getAll: () => {
    return request.get<Api.AiApp.AiAppDto[]>({
      url: '/api/ai-app/all'
    })
  },

  get: (id: string) => {
    return request.get<Api.AiApp.AiAppDto>({
      url: `/api/ai-app/${id}`
    })
  },

  create: (data: Api.AiApp.AiAppDto) => {
    return request.post<Api.AiApp.AiAppDto>({
      url: '/api/ai-app',
      data
    })
  },

  update: (id: string, data: Api.AiApp.AiAppDto) => {
    return request.put<Api.AiApp.AiAppDto>({
      url: `/api/ai-app/${id}`,
      data
    })
  },

  delete: (id: string) => {
    return request.del<void>({
      url: `/api/ai-app/${id}`
    })
  },

  newInitialization: () => {
    return request.get<void>({
      url: '/api/ai-app/new-initialization'
    })
  }
}

/**
 * AI 自动任务管理 API
 */
export const aiTask = {
  getList: () => {
    return request.get<string[]>({
      url: '/api/ai-task/list'
    })
  },

  createOrUpdate: (params: Api.AiTask.AiTaskCreateUpdateInput) => {
    return request.post<string>({
      url: '/api/ai-task',
      params
    })
  },

  delete: (name: string) => {
    return request.del<string>({
      url: '/api/ai-task',
      params: { name }
    })
  },

  trigger: (name: string) => {
    return request.post<string>({
      url: '/api/ai-task/trigger',
      params: { name }
    })
  }
}

/**
 * AI 通用管理 API (legacy 兼容 /api/app/ai)
 */
export const aiGeneral = {
  getList: (params?: {
    Keyword?: string
    Sorting?: string
    SkipCount?: number
    MaxResultCount?: number
  }) => {
    return request.get<{ items: Api.AiApp.AiAppDto[]; totalCount: number }>({
      url: '/api/app/ai',
      params
    })
  },

  get: (id: string) => {
    return request.get<Api.AiApp.AiAppDto>({
      url: `/api/app/ai/${id}`
    })
  },

  create: (data: Api.AiApp.AiAppDto) => {
    return request.post<Api.AiApp.AiAppDto>({
      url: '/api/app/ai',
      data
    })
  },

  update: (id: string, data: Api.AiApp.AiAppDto) => {
    return request.put<Api.AiApp.AiAppDto>({
      url: `/api/app/ai/${id}`,
      data
    })
  },

  delete: (id: string) => {
    return request.del<void>({
      url: `/api/app/ai/${id}`
    })
  },

  newInitialization: () => {
    return request.post<void>({
      url: '/api/app/ai/new-initialization'
    })
  }
}

/**
 * AI 消息存储 API
 */
export const aiMessage = {
  getMessages: (threadId: string) => {
    return request.get<any[]>({
      url: `/api/app/ai-chat-message-store/messages/${threadId}`
    })
  },

  saveMessages: (data: any) => {
    return request.post<void>({
      url: '/api/app/ai-chat-message-store/messages',
      data
    })
  }
}

/**
 * AI 技能/工具绑定 API
 */
export const aiSkillToolBind = {
  getBoundIds: (bindId: string) => {
    return request.get<string[]>({
      url: `/api/app/ai-skill-tool-bind/bound-skill-tool-ids/${bindId}`
    })
  },

  batchBind: (bindId: string, ids: string[]) => {
    return request.post<void>({
      url: `/api/app/ai-skill-tool-bind/batch-bind/${bindId}`,
      data: ids
    })
  }
}
