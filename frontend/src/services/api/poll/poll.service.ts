import { odeServices } from '@edifice.io/client';
import { PollRequestPayload } from './poll.types';

export const IMPORT_PDF_POLL_ID = 'import-pdf';

/**
 * Services for Poll API
 * @param baseURL app base URL
 * @returns services methods for Poll API
 */
const createPollService = (baseURL: string) => ({
  /**
   * Get user poll vote from local storage.
   * @param pollId poll id to retrieve the vote
   * @returns user poll vote from local storage
   */
  getPollVote(pollId: string): string | null {
    return localStorage.getItem(`wiki_poll_${pollId}_voted`);
  },

  /**
   * Submit a vote to a poll. The poll is identified by the pollId in the request payload.
   * @param pollName Name of the poll (used for local storage key)
   * @param requestPayload JSON object with the vote.
   */
  async submitPollVote(
    pollName: string,
    requestPayload: PollRequestPayload,
  ): Promise<void> {
    // store in the local storage that the user has voted to this poll
    localStorage.setItem(`wiki_poll_${pollName}_voted`, requestPayload.vote);

    // send the vote to the backend
    await odeServices
      .http()
      .post<void>(`${baseURL}/polls/${pollName}/vote`, requestPayload);
  },
});

export const baseURL = '/wiki';
export const pollService = createPollService(baseURL);
