package net.atos.entng.wiki.service.poll;

import io.vertx.core.Future;
import net.atos.entng.wiki.models.poll.Poll;
import net.atos.entng.wiki.models.poll.Vote;
import net.atos.entng.wiki.models.poll.VotesSummary;

/**
 * Service interface for managing wiki polls.
 */
public interface WikiPollService {
    /**
     * Get a poll by its name.
     * @param name The name of the poll.
     * @return Future with the poll data.
     */
    Future<Poll> getPoll(String name);
    /**
     * Create a new poll with the given name and description.
     * @param name The name of the poll.
     * @param description The description of the poll.
     * @return Future with the created poll ID.
     */
    Future<String> createPoll(String name, String description, String authorId, String authorName, String authorEmail);

    /**
     * Submit a vote for the specified poll.
     * @param pollId mongo technical _id of the poll.
     * @param vote The vote data.
     * @return Future indicating success or failure.
     */
    Future<Void> submitPollVote(String pollId, Vote vote);

    /**
     * Get a poll summary of votes.
     * - poll name
     * - number of Yes
     * - number of No
     * @param pollName
     * @return
     */
    Future<VotesSummary> getPollVotesSummary(String pollName);
}
