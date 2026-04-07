declare namespace Api {
  namespace OpenApi {
    interface AnthropicInput {
      stream?: boolean;
      model?: string | null;
      max_tokens?: number | null;
      messages?: AnthropicMessageInput[] | null;
      tools?: AnthropicMessageTool[] | null;
      tool_choice?: any | null;
      system?: any | null;
      thinking?: AnthropicThinkingInput;
      temperature?: number | null;
      metadata?: Record<string, any> | null;
    }

    interface AnthropicMessageInput {
      role?: string | null;
      content?: any | null;
    }

    interface AnthropicMessageTool {
      name?: string | null;
      description?: string | null;
      input_schema?: any | null;
    }

    interface AnthropicThinkingInput {
      type?: string | null;
      budget_tokens?: number | null;
      signature?: string | null;
      thinking?: string | null;
      data?: string | null;
      text?: string | null;
    }

    interface ThorEmbeddingInput {
      model?: string | null;
      input?: any | null;
      encoding_format?: string | null;
      dimensions?: number | null;
      user?: string | null;
    }

    interface ImageCreateRequest {
      n?: number | null;
      size?: string | null;
      response_format?: string | null;
      user?: string | null;
      model?: string | null;
      prompt?: string | null;
      quality?: string | null;
      style?: string | null;
      background?: string | null;
      moderation?: string | null;
      output_compression?: string | null;
      output_format?: string | null;
    }

    interface ModelsDataDto {
      id?: string | null;
      object?: string | null;
      created?: number;
      owned_by?: string | null;
      type?: string | null;
    }

    interface ModelsListDto {
      object?: string | null;
      data?: ModelsDataDto[] | null;
    }

    interface ThorChatCompletionsRequest {
      store?: boolean | null;
      modalities?: string[] | null;
      audio?: any;
      messages?: ThorChatMessage[] | null;
      model?: string | null;
      top_p?: number | null;
      temperature?: number | null;
      n?: number | null;
      stream?: boolean | null;
      stream_options?: any;
      stop?: string[] | null;
      max_tokens?: number | null;
      max_completion_tokens?: number | null;
      presence_penalty?: number | null;
      frequency_penalty?: number | null;
      logit_bias?: any | null;
      logprobs?: boolean | null;
      top_logprobs?: number | null;
      service_tier?: string | null;
      tools?: any[] | null;
      tool_choice?: any | null;
      response_format?: any;
      metadata?: Record<string, string> | null;
      seed?: number | null;
      user?: string | null;
      thinking?: any;
      enable_thinking?: boolean | null;
      web_search_options?: any;
      reasoning_effort?: string | null;
    }

    interface ThorChatMessage {
      role?: string | null;
      content?: any | null;
      name?: string | null;
      tool_call_id?: string | null;
      function_call?: any;
      reasoning_content?: string | null;
      id?: string | null;
      tool_calls?: any[] | null;
    }
  }

  namespace Channel {
    interface AiAppCreateInput {
      name?: string;
      endpoint?: string;
      extraUrl?: string;
      apiKey?: string;
      orderNum?: number;
    }

    interface AiAppDto {
      id?: string;
      name?: string;
      endpoint?: string;
      extraUrl?: string;
      apiKey?: string;
      orderNum?: number;
      creationTime?: string;
    }

    interface AiAppUpdateInput {
      id?: string;
      name?: string;
      endpoint?: string;
      extraUrl?: string;
      apiKey?: string;
      orderNum?: number;
    }

    interface AiAppSearchParams {
      searchKey?: string;
      startTime?: string;
      endTime?: string;
      maxResultCount?: number;
      skipCount?: number;
    }
  }

  namespace Token {
    interface TokenSearchParams {
      searchKey?: string;
      startTime?: string;
      endTime?: string;
      maxResultCount?: number;
      skipCount?: number;
    }

    interface TokenGetListOutputDto {
      id: string;
      name?: string;
      apiKey?: string;
      expireTime?: string;
      isDisabled: boolean;
      isEnableLog: boolean;
      creationTime: string;
    }

    interface TokenCreateInput {
      name: string;
      expireTime?: string;
    }

    interface TokenUpdateInput {
      id: string;
      name: string;
      expireTime?: string;
    }
  }

  namespace UsageStatistics {
    interface DailyTokenUsageDto {
      date?: string;
      tokens?: number;
    }

    interface HourlyTokenUsageDto {
      hour?: string;
      totalTokens?: number;
      modelBreakdown?: ModelTokenBreakdownDto[] | null;
    }

    interface ModelTodayUsageDto {
      modelId?: string | null;
      usageCount?: number;
      totalTokens?: number;
      iconUrl?: string | null;
    }

    interface ModelTokenBreakdownDto {
      modelId?: string | null;
      tokens?: number;
    }

    interface ModelTokenUsageDto {
      model?: string | null;
      tokens?: number;
      percentage?: number;
    }
  }

  namespace Session {
    type SessionTypeEnum = 'Chat' | 'Agent';

    interface SessionSearchParams {
      sessionTitle?: string;
      sessionType?: SessionTypeEnum;
      startTime?: string;
      endTime?: string;
      maxResultCount?: number;
      skipCount?: number;
    }

    interface SessionDto {
      id: string;
      creationTime: string;
      creatorId?: string | null;
      lastModificationTime?: string | null;
      lastModifierId?: string | null;
      isDeleted: boolean;
      deleterId?: string | null;
      deletionTime?: string | null;
      sessionTitle?: string | null;
      sessionContent?: string | null;
      remark?: string | null;
      sessionType?: SessionTypeEnum;
    }

    interface SessionCreateAndUpdateInput {
      sessionTitle?: string | null;
      sessionContent?: string | null;
      remark?: string | null;
      sessionType?: SessionTypeEnum;
    }
  }

  namespace SystemStatistics {
    interface TokenStatisticsInput {
      date?: string;
    }

    interface TokenStatisticsOutput {
      date?: string | null;
      modelStatistics?: ModelTokenStatisticsDto[] | null;
    }

    interface ModelTokenStatisticsDto {
      modelId?: string | null;
      modelName?: string | null;
      tokens?: number;
      tokensInWan?: number;
      count?: number;
      cost?: number;
      costPerHundredMillion?: number;
    }
  }
}
