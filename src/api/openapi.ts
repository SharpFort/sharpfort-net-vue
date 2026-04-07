import request from '@/utils/http'

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
