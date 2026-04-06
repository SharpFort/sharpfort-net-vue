declare namespace Api {
  namespace AiModel {
    /** AI模型创建输入 */
    interface AiModelCreateInput {
      /** 理程序名称 */
      handlerName: string;
      /** 模型ID */
      modelId: string;
      /** 模型名称 */
      name: string;
      /** 描述 */
      description?: string | null;
      /** 排序 */
      orderNum?: number;
      /** 供应商ID */
      aiProviderId: string;
      /** 额外信息 */
      extraInfo?: string | null;
      /** 模型类型 */
      modelType: number;
      /** 模型API类型 */
      modelApiType: number;
      /** 成本倍率 */
      multiplier?: number;
      /** 显示倍率 */
      multiplierShow?: number;
      /** 供应商分组名称 */
      providerName?: string | null;
      /** 图标URL */
      iconUrl?: string | null;
      /** 是否启用 */
      isEnabled?: boolean;
    }

    /** AI模型更新输入 */
    interface AiModelUpdateInput {
      /** 模型的主键ID */
      id: string;
      handlerName: string;
      modelId: string;
      name: string;
      description?: string | null;
      orderNum?: number;
      aiProviderId: string;
      extraInfo?: string | null;
      modelType: number;
      modelApiType: number;
      multiplier?: number;
      multiplierShow?: number;
      providerName?: string | null;
      iconUrl?: string | null;
      isEnabled?: boolean;
    }

    /** AI模型详情 DTO */
    interface AiModelDto {
      id: string;
      handlerName?: string | null;
      modelId?: string | null;
      name?: string | null;
      description?: string | null;
      orderNum?: number;
      aiProviderId: string;
      extraInfo?: string | null;
      modelType: number;
      modelApiType: number;
      multiplier?: number;
      multiplierShow?: number;
      providerName?: string | null;
      iconUrl?: string | null;
      isEnabled?: boolean;
      creationTime?: string;
      creatorId?: string | null;
      lastModificationTime?: string | null;
      lastModifierId?: string | null;
      isDeleted?: boolean;
      deleterId?: string | null;
      deletionTime?: string | null;
    }

    /** 列表查询参 */
    interface AiModelSearchParams {
      SearchKey?: string;
      AiProviderId?: string;
      StartTime?: string;
      EndTime?: string;
      OrderByColumn?: string;
      IsAsc?: string;
      IsAscending?: boolean;
      Sorting?: string;
      SkipCount?: number;
      MaxResultCount?: number;
    }
  }

  namespace AiChat {
    interface UnifiedSendParams {
      apiType: number;
      modelId: string;
      sessionId: string;
    }

    interface ChatMessage {
      role: 'user' | 'assistant' | 'system';
      content: string;
      time?: string;
    }

    interface UnifiedSendBody {
      prompt?: string;
      messages?: ChatMessage[];
      [key: string]: any;
    }
  }

  namespace AiImage {
    interface ImageGenerationInput {
      prompt: string;
      negativePrompt?: string;
      size?: string;
      modelId?: string;
      n?: number;
      quality?: string;
      style?: string;
      [key: string]: any;
    }
    
    interface ImageTaskOutput {
      id: string; // taskId
      prompt?: string;
      status?: number; // TaskStatusEnum (0: Pending, 1: Processing, 2: Success, 3: Failed)
      resultUrl?: string; // Comma separated URLs usually
      errorMessage?: string;
      creationTime?: string;
      extraInfo?: string;
    }
    
    interface PublishImageInput {
      taskId: string;
      title?: string;
      description?: string;
      categories?: string;
    }
  }

  namespace AiPrompt {
    interface AiPromptDto {
      id: string;
      creationTime: string;
      creatorId?: string | null;
      lastModificationTime?: string | null;
      lastModifierId?: string | null;
      isDeleted: boolean;
      deleterId?: string | null;
      deletionTime?: string | null;
      code?: string | null;
      content?: string | null;
      description?: string | null;
      defaultModelId?: string | null;
    }

    interface AiPromptCreateInput {
      code: string;
      content: string;
      description?: string | null;
      defaultModelId?: string | null;
    }

    interface AiPromptUpdateInput {
      code: string;
      content: string;
      description?: string | null;
      defaultModelId?: string | null;
    }

    interface AiPromptSearchParams {
      searchKey?: string;
      startTime?: string;
      endTime?: string;
      sorting?: string;
      skipCount: number;
      maxResultCount: number;
    }
  }

  namespace AiProvider {
    interface AiProviderDto {
      id: string;
      creationTime: string;
      creatorId?: string | null;
      lastModificationTime?: string | null;
      lastModifierId?: string | null;
      isDeleted: boolean;
      deleterId?: string | null;
      deletionTime?: string | null;
      name?: string | null;
      endpoint?: string | null;
      extraUrl?: string | null;
      apiKey?: string | null;
      orderNum?: number;
    }

    interface AiProviderCreateInput {
      name: string;
      endpoint: string;
      extraUrl?: string | null;
      apiKey: string;
      orderNum?: number;
    }

    interface AiProviderUpdateInput {
      name: string;
      endpoint: string;
      extraUrl?: string | null;
      apiKey: string;
      orderNum?: number;
    }

    interface AiProviderSearchParams {
      SearchKey?: string;
      StartTime?: string;
      EndTime?: string;
      Sorting?: string;
      SkipCount?: number;
      MaxResultCount?: number;
    }
  }

  namespace AiTool {
    interface TranslateInput {
      text: string;
      targetLang: string;
    }

    interface SummarizeInput {
      content: string;
    }

    interface SearchInput {
      query: string;
    }
  }

  namespace Channel {
    interface AiAppDto {
      id: string;
      name?: string | null;
      endpoint?: string | null;
      extraUrl?: string | null;
      apiKey?: string | null;
      orderNum?: number;
      creationTime: string;
    }

    interface AiAppCreateInput {
      name: string;
      endpoint: string;
      extraUrl?: string | null;
      apiKey: string;
      orderNum?: number;
    }

    interface AiAppUpdateInput {
      id: string;
      name: string;
      endpoint: string;
      extraUrl?: string | null;
      apiKey: string;
      orderNum?: number;
    }

    interface AiAppSearchParams {
      SearchKey?: string;
      StartTime?: string;
      EndTime?: string;
      Sorting?: string;
      SkipCount?: number;
      MaxResultCount?: number;
    }
  }
}


