import { odeServices } from '@edifice.io/client';
import { Poll, PollRequestPayload } from './poll.types';

export const IMPORT_PDF_POLL_ID = 'import-pdf';

/**
 * Services for Poll API
 * @param baseURL app base URL
 * @returns services methods for Poll API
 */
const createPollService = (baseURL: string) => ({
  /**
   * Get Poll by Poll Name
   * @param pollName Poll name to retrieve
   * @returns a Poll object representing the Poll
   */
  async getPoll(pollName: string): Promise<Poll> {
    const poll = await odeServices
      .http()
      .get<Poll>(`${baseURL}/polls/${pollName}`);
    return poll;
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
    // send the vote to the backend
    await odeServices
      .http()
      .post<void>(`${baseURL}/polls/${pollName}/vote`, requestPayload);
  },
});

export const baseURL = '/wiki';
export const pollService = createPollService(baseURL);
