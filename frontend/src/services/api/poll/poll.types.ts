import { Created, Modified } from '~/models';

export enum PollVoteResult {
  YES = 'YES',
  NO = 'NO',
}

export interface PollRequestPayload {
  vote: PollVoteResult;
}

export interface PollVote {
  vote: PollVoteResult;
  userId: string;
  userName: string;
  userEmail: string;
  created: Created;
  modified: Modified;
}
export interface Poll {
  _id: string;
  name: string;
  description: string;
  votes: Array<PollVote>;
  created: Created;
  modified: Modified;
  authorId: string;
  authorName: string;
  authorEmail: string;
}
