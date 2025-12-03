package net.atos.entng.wiki.service.poll;

import fr.wseduc.mongodb.MongoDb;
import fr.wseduc.mongodb.MongoQueryBuilder;
import io.vertx.core.Future;
import io.vertx.core.Promise;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import net.atos.entng.wiki.models.poll.Poll;
import net.atos.entng.wiki.models.poll.Vote;
import net.atos.entng.wiki.models.poll.VotesSummary;
import net.atos.entng.wiki.service.WikiServiceMongoImpl;
import org.bson.conversions.Bson;
import org.entcore.common.service.impl.MongoDbCrudService;
import org.entcore.common.utils.StringUtils;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import static com.mongodb.client.model.Filters.eq;

/**
 * MongoDB implementation of the WikiPollService.
 */
public class WikiPollServiceMongoImpl extends MongoDbCrudService implements WikiPollService {
    protected static final Logger log = LoggerFactory.getLogger(WikiPollServiceMongoImpl.class);
    private final String collection;
    private final MongoDb mongo;

    public WikiPollServiceMongoImpl(String collection) {
        super(collection);
        this.collection = collection;
        this.mongo = MongoDb.getInstance();
    }

    @Override
    public Future<Poll> getPoll(String name) {
        final Promise<Poll> promise = Promise.promise();

        final Bson query = eq("name", name);

        mongo.findOne(collection, MongoQueryBuilder.build(query), res -> {
            if (res != null && res.body() != null && "ok".equals(res.body().getString("status"))) {
                JsonObject result = res.body().getJsonObject("result");

                if (result != null) {
                    // Manually handle the votes field
                    JsonArray votesArray = result.getJsonArray("votes");
                    List<Vote> votes = votesArray
                            .stream()
                            .map(vote -> {
                                JsonObject voteJson = (JsonObject) vote;

                                // Preprocess the "modified" field
                                if (voteJson.containsKey("modified") && voteJson.getJsonObject("modified").containsKey("$date")) {
                                    String modifiedDateStr = voteJson.getJsonObject("modified").getString("$date");
                                    try {
                                        Date modifiedDate = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSX").parse(modifiedDateStr);
                                        voteJson.put("modified", modifiedDate); // Replace with the Date object
                                    } catch (Exception e) {
                                        log.error("Error parsing modified date", e);
                                    }
                                }

                                return voteJson.mapTo(Vote.class);
                            })
                            .collect(Collectors.toList());
                    // Remove votes to avoid mapping issues
                    result.remove("votes");

                    // Map the rest of the fields to Poll
                    // Preprocess the "created" field
                    if (result.containsKey("created") && result.getJsonObject("created").containsKey("$date")) {
                        String createdDateStr = result.getJsonObject("created").getString("$date");
                        try {
                            Date createdDate = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSX").parse(createdDateStr);
                            result.put("created", createdDate); // Replace with the Date object
                        } catch (Exception e) {
                            log.error("Error parsing date", e);
                        }
                    }

                    Poll poll = result.mapTo(Poll.class);
                    poll.setVotes(votes); // Set the votes manually

                    promise.complete(poll);
                } else {
                    promise.complete(null);
                }
            } else {
                promise.fail(res.body().getString("message"));
            }
        });

        return promise.future();
    }

    @Override
    public Future<String> createPoll(String name, String description, String authorId, String authorName,
                                     String authorEmail) {
        final Promise<String> promise = Promise.promise();
        // Check if poll already exists
        this.getPoll(name)
                .onSuccess(poll -> {
                    // if poll exists we do nothing
                    if (poll != null) {
                        log.info("Poll with name " + name + " already exists.");
                        promise.complete();
                    } else {
                        // otherwise we create it
                        final JsonObject newPoll = new JsonObject()
                                .put("name", name)
                                .put("description", description)
                                .put("votes", new JsonArray())
                                .put("created", MongoDb.now())
                                .put("authorId", authorId)
                                .put("authorName", authorName)
                                .put("authorEmail", authorEmail);
                        mongo.insert(collection, newPoll, res -> {
                            if ("ok".equals(res.body().getString("status"))) {
                                promise.complete(res.body().getString("_id"));
                            } else {
                                promise.fail(res.body().getString("message"));
                            }
                        });
                    }
                })
                .onFailure(err -> {
                    log.error("Error while retrieving poll with name " + name + ". Error: " + err);
                    promise.fail(err);
                });

        return promise.future();
    }

    @Override
    public Future<Void> submitPollVote(String pollId, Vote vote) {
        final Promise<Void> promise = Promise.promise();

        if (StringUtils.isEmpty(pollId)) {
            promise.fail("pollId is empty");
            return promise.future();
        }

        // Create the vote object to be added
        JsonObject voteJson = JsonObject.mapFrom(vote);
        // Add modified date
        final JsonObject mongoNow = MongoDb.now();
        voteJson.put("modified", mongoNow);

        // Update the existing vote or add a new one
        JsonObject query = new JsonObject()
                .put("_id", pollId)
                .put("votes", new JsonObject().put("$elemMatch", new JsonObject().put("userId", vote.getUserId())));

        JsonObject update = new JsonObject()
                .put("$set", new JsonObject().put("votes.$", voteJson));

        mongo.update(collection, query, update, res -> {
            // If an existing vote was modified, we are done
            if ("ok".equals(res.body().getString("status")) && res.body().getInteger("number", 0) > 0) {
                promise.complete();
            } else {
                // If no existing vote is found, push the new vote
                JsonObject pushUpdate = new JsonObject()
                        .put("$push", new JsonObject().put("votes", voteJson));

                mongo.update(collection, new JsonObject().put("_id", pollId), pushUpdate, pushRes -> {
                    if ("ok".equals(pushRes.body().getString("status"))) {
                        promise.complete();
                    } else {
                        promise.fail(pushRes.body().getString("message"));
                    }
                });
            }
        });

        return promise.future();
    }

    @Override
    public Future<VotesSummary> getPollVotesSummary(String pollName) {
        final Promise<VotesSummary> promise = Promise.promise();

        final Bson query = eq("name", pollName);

        mongo.findOne(collection, MongoQueryBuilder.build(query), res -> {
            if ("ok".equals(res.body().getString("status"))) {
                JsonObject result = res.body().getJsonObject("result");
                if (result != null) {
                    final VotesSummary votesSummary = new VotesSummary();
                    votesSummary.setPollName(pollName);
                    int numbersOfYes = 0;
                    int numbersOfNo = 0;
                    final JsonArray votes = result.getJsonArray("votes");
                    for (int i = 0; i < votes.size(); i++) {
                        final JsonObject vote = votes.getJsonObject(i);
                        if ("YES".equals(vote.getString("vote"))) {
                            numbersOfYes++;
                        } else {
                            numbersOfNo++;
                        }
                    }
                    votesSummary.setNumberOfYes(numbersOfYes);
                    votesSummary.setNumberOfNo(numbersOfNo);
                    promise.complete(votesSummary);
                } else {
                    promise.complete(null);
                }
            } else {
                promise.fail(res.body().getString("message"));
            }
        });
        return promise.future();
    }
}
