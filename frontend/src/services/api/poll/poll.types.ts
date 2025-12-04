export enum PollVote {
  YES = 'YES',
  NO = 'NO',
}

export interface PollRequestPayload {
  vote: PollVote;
}
