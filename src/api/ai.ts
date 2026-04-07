import request from '@/utils/http'

/**
 * AI 模型管理 API
 */
export const aiModel = {
  /**
   * 获取AI模型列表
   */
  getList: (params?: Api.AiModel.AiModelSearchParams) => {
    return request.get<{ items: Api.AiModel.AiModelDto[]; totalCount: number }>({
      url: '/api/app/ai-model',
      params
    })
  },

  /**
   * 根据 ID 获取 AI 模型详情
   */
  get: (id: string) => {
    return request.get<Api.AiModel.AiModelDto>({
      url: `/api/app/ai-model/${id}`
    })
  },

  /**
   * 创建 AI 模型
   */
  post: (data: Api.AiModel.AiModelCreateInput) => {
    return request.post<Api.AiModel.AiModelDto>({
      url: '/api/app/ai-model',
      data
    })
  },

  /**
   * 更新 AI 模型
   */
  put: (id: string, data: Api.AiModel.AiModelUpdateInput) => {
    return request.put<Api.AiModel.AiModelDto>({
      url: `/api/app/ai-model/${id}`,
      data
    })
  },

  /**
   * 删除 AI 模型
   */
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
  /**
   * 获取可用的对话模型列表
   */
  getModelList: () => {
    return request.get<Api.AiModel.AiModelDto[]>({
      url: '/api/app/ai-chat/model-list'
    })
  },

  /**
   * 统一发送消息
   */
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
  /** 获取可用生图模型 */
  getModels: () => {
    return request.post<Api.AiModel.AiModelDto[]>({ url: '/api/app/ai-image/model' })
  },

  /** 发起图片生成任务 */
  generate: (data: Api.AiImage.ImageGenerationInput) => {
    return request.post<string>({ url: '/api/app/ai-image/generate', data })
  },

  /** 轮询任务状态 */
  getTask: (taskId: string) => {
    return request.get<Api.AiImage.ImageTaskOutput>({ url: `/api/app/ai-image/task/${taskId}` })
  },

  /** 分页获取我的生成历史 */
  getMyTasks: (params?: any) => {
    return request.get<{ items: Api.AiImage.ImageTaskOutput[]; totalCount: number }>({
      url: '/api/app/ai-image/my-tasks',
      params
    })
  },

  /** 删除我的历史记录 */
  deleteMyTasks: (ids: string[]) => {
    return request.del<void>({
      url: '/api/app/ai-image',
      params: { ids } // or data depends on Axios config, usually query params if ids is array
    })
  },

  /** 发布到广场 */
  publish: (data: Api.AiImage.PublishImageInput) => {
    return request.post<void>({ url: '/api/app/ai-image/publish', data })
  },

  /** 获取广场画廊 */
  getPlaza: (params?: any) => {
    return request.get<{ items: Api.AiImage.ImageTaskOutput[]; totalCount: number }>({
      url: '/api/app/ai-image/plaza',
      params
    })
  }
}

/**
 * AI 提示词管理服务 API
 */
export const aiPrompt = {
  /** 获取提示词列表 */
  getList: (params: Api.AiPrompt.AiPromptSearchParams) => {
    return request.get<{ items: Api.AiPrompt.AiPromptDto[]; totalCount: number }>({
      url: '/api/app/ai-prompt',
      params
    })
  },

  /** 根据ID获取单个提示词 */
  get: (id: string) => {
    return request.get<Api.AiPrompt.AiPromptDto>({ url: `/api/app/ai-prompt/${id}` })
  },

  /** 创建提示词 */
  create: (data: Api.AiPrompt.AiPromptCreateInput) => {
    return request.post<Api.AiPrompt.AiPromptDto>({ url: '/api/app/ai-prompt', data })
  },

  /** 更新提示词 */
  update: (id: string, data: Api.AiPrompt.AiPromptUpdateInput) => {
    return request.put<Api.AiPrompt.AiPromptDto>({ url: `/api/app/ai-prompt/${id}`, data })
  },

  /** 删除提示词 */
  delete: (id: string) => {
    return request.del<void>({ url: `/api/app/ai-prompt/${id}` })
  }
}

/**
 * AI 供应商管理服务 API
 */
export const aiProvider = {
  /** 获取供应商列表 */
  getList: (params: Api.AiProvider.AiProviderSearchParams) => {
    return request.get<{ items: Api.AiProvider.AiProviderDto[]; totalCount: number }>({
      url: '/api/app/ai-provider',
      params
    })
  },

  /** 根据ID获取单个供应商 */
  get: (id: string) => {
    return request.get<Api.AiProvider.AiProviderDto>({ url: `/api/app/ai-provider/${id}` })
  },

  /** 创建供应商 */
  create: (data: Api.AiProvider.AiProviderCreateInput) => {
    return request.post<Api.AiProvider.AiProviderDto>({ url: '/api/app/ai-provider', data })
  },

  /** 更新供应商 */
  update: (id: string, data: Api.AiProvider.AiProviderUpdateInput) => {
    return request.put<Api.AiProvider.AiProviderDto>({ url: `/api/app/ai-provider/${id}`, data })
  },

  /** 删除供应商 */
  delete: (id: string) => {
    return request.del<void>({ url: `/api/app/ai-provider/${id}` })
  }
}

/**
 * AI 工具服务 API
 */
export const aiTool = {
  /** 翻译 */
  translate: (modelId: string, params: Api.AiTool.TranslateInput) => {
    return request.post<string>({ url: `/api/app/ai-tool/translate/${modelId}`, params })
  },

  /** 总结提炼 */
  summarize: (modelId: string, params: Api.AiTool.SummarizeInput) => {
    return request.post<string>({ url: `/api/app/ai-tool/summarize/${modelId}`, params })
  },

  /** 联网搜索 */
  search: (modelId: string, params: Api.AiTool.SearchInput) => {
    return request.post<string>({ url: `/api/app/ai-tool/search/${modelId}`, params })
  }
}

/**
 * 使用量统计服务 API
 */
export const usageStatistics = {
  /** 获取当前用户近7天的Token消耗统计 */
  getLast7DaysTokenUsage: (params?: { TokenId?: string }) => {
    return request.get<Api.UsageStatistics.DailyTokenUsageDto[]>({
      url: '/api/app/usage-statistics/last7Days-token-usage',
      params
    })
  },

  /** 获取当前用户各个模型的Token消耗量及占比 */
  getModelTokenUsage: (params?: { TokenId?: string }) => {
    return request.get<Api.UsageStatistics.ModelTokenUsageDto[]>({
      url: '/api/app/usage-statistics/model-token-usage',
      params
    })
  },

  /** 获取当前用户近24小时每小时Token消耗统计（柱状图） */
  getLast24HoursTokenUsage: (params?: { TokenId?: string }) => {
    return request.get<Api.UsageStatistics.HourlyTokenUsageDto[]>({
      url: '/api/app/usage-statistics/last24Hours-token-usage',
      params
    })
  },

  /** 获取当前用户今日各模型使用量统计（卡片列表） */
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
  /** 获取会话列表 */
  getList: (params?: Api.Session.SessionSearchParams) => {
    return request.get<{ items: Api.Session.SessionDto[]; totalCount: number }>({
      url: '/api/app/session',
      params
    })
  },

  /** 分页获取会话列表 (兼容名称) */
  getPage: (params?: Api.Session.SessionSearchParams) => {
    return request.get<{ items: Api.Session.SessionDto[]; totalCount: number }>({
      url: '/api/app/session',
      params
    })
  },

  /** 根据ID获取会话详情 */
  get: (id: string) => {
    return request.get<Api.Session.SessionDto>({
      url: `/api/app/session/${id}`
    })
  },

  /** 创建会话 */
  post: (data: Api.Session.SessionCreateAndUpdateInput) => {
    return request.post<Api.Session.SessionDto>({
      url: '/api/app/session',
      data
    })
  },

  /** 更新会话 */
  put: (id: string, data: Api.Session.SessionCreateAndUpdateInput) => {
    return request.put<Api.Session.SessionDto>({
      url: `/api/app/session/${id}`,
      data
    })
  },

  /** 删除会话 */
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
  /** 获取指定日期各模型Token统计 */
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
  /** 获取Token列表 */
  getList: (params: Api.Token.TokenSearchParams) => {
    return request.get<{ items: Api.Token.TokenGetListOutputDto[]; totalCount: number }>({
      url: '/api/app/token/list',
      params
    })
  },

  /** 创建 Token */
  create: (data: Api.Token.TokenCreateInput) => {
    return request.post<void>({ url: '/api/app/token', data })
  },

  /** 更新 Token */
  update: (data: Api.Token.TokenUpdateInput) => {
    // 根据提取信息 PUT 是由于 /api/app/token 路径
    return request.put<void>({ url: '/api/app/token', data })
  },

  /** 删除 Token */
  delete: (id: string) => {
    return request.del<void>({ url: `/api/app/token/${id}` })
  },

  /** 启用 Token */
  enable: (id: string) => {
    return request.post<void>({ url: `/api/app/token/${id}/enable` })
  },

  /** 禁用 Token */
  disable: (id: string) => {
    return request.post<void>({ url: `/api/app/token/${id}/disable` })
  }
}
