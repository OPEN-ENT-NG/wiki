import {
  AssistantGenerateRequest,
  AssistantGenerateResponse,
} from './assistant.types';
import { odeServices } from '@edifice.io/client';

/**
 * Services for Assistant API
 * @param baseURL app base URL
 * @returns services methods for Assistant API
 */
const createAssistantService = (baseURL: string) => ({
  /**
   * Generate the wiki pages and then the pages content.
   * @returns a Promise of PagesStructureResponse
   */
  async generate(
    requestPayload: AssistantGenerateRequest,
  ): Promise<AssistantGenerateResponse> {
    const response = await odeServices
      .http()
      .post<AssistantGenerateResponse>(`${baseURL}/generate`, requestPayload);
    return response;
  },
});

export const baseURL = '/wiki';
export const assistantService = createAssistantService(baseURL);
