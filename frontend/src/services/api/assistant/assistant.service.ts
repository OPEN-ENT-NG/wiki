import {
  mockPagesContentResponse,
  mockPagesStructureResponse,
} from '~/mocks/assistant';
import {
  PagesStructureRequest,
  PagesContentResponse,
  PagesStructureResponse,
} from './assistant.types';

const createAssistantService = () => ({
  /**
   * Fetches the structure of the pages.
   * @returns a Promise of PagesStructureResponse
   */
  async getPagesStructure(
    requestPayload: PagesStructureRequest,
  ): Promise<PagesStructureResponse> {
    // TODO: call wiki backend API with "requestPayload"

    // This is the mocked response
    return new Promise<PagesStructureResponse>((resolve) => {
      setTimeout(() => {
        resolve({
          status: 'success',
          message: 'Course has been successfully generated.',
          model: 'gpt-4.1-mini-2025-04-14',
          version: '0.1.0',
          usage: {
            completion_tokens: 2910,
            prompt_tokens: 1372,
            total_tokens: 4282,
          },
          data: mockPagesStructureResponse,
        });
      }, 5000); // 5 seconds delay
    });
  },

  /**
   * Fetches the content of the pages.
   * @returns a Promise of PagesContentResponse
   */
  async getPagesContent(): Promise<PagesContentResponse> {
    // TODO: call wiki backend API
    return new Promise<PagesContentResponse>((resolve) => {
      setTimeout(() => {
        resolve({
          status: 'success',
          message: 'Course has been successfully generated.',
          model: 'gpt-4.1-mini-2025-04-14',
          version: '0.1.0',
          usage: {
            completion_tokens: 2910,
            prompt_tokens: 1372,
            total_tokens: 4282,
          },
          data: mockPagesContentResponse,
        });
      }, 5000); // 5 seconds delay
    });
  },
});

export const assistantService = createAssistantService();
