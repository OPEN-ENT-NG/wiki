package net.atos.entng.wiki.controllers.poll;

import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Get;
import fr.wseduc.rs.Post;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.request.RequestUtils;
import io.vertx.core.Vertx;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonObject;
import net.atos.entng.wiki.models.poll.Vote;
import net.atos.entng.wiki.service.poll.WikiPollService;
import org.entcore.common.mongodb.MongoDbControllerHelper;
import org.entcore.common.user.UserUtils;
import org.vertx.java.core.http.RouteMatcher;

import java.util.Map;

public class WikiPollController extends MongoDbControllerHelper {
    private final WikiPollService wikiPollService;

    @Override
    public void init(Vertx vertx, JsonObject config, RouteMatcher rm,
                     Map<String, fr.wseduc.webutils.security.SecuredAction> securedActions) {
        super.init(vertx, config, rm, securedActions);
    }

    public WikiPollController(String collection, WikiPollService wikiPollService) {
        super(collection);
        this.wikiPollService = wikiPollService;
    }

    @Get("/polls/:name")
    @ApiDoc("Get a Poll by its name.")
    @SecuredAction(value = "wiki.getPoll")
    public void getPoll(final HttpServerRequest request) {
        wikiPollService.getPoll(request.params().get("name"))
                .onSuccess(results -> renderJson(request, new JsonObject().put("results", results)))
                .onFailure(err -> {
                    log.error("Error retrieving poll results", err);
                    renderJson(request, new JsonObject().put("error", err.getMessage()), 500);
                });
    }

    @Post("/polls")
    @ApiDoc("Create a new poll.")
    @SecuredAction(value = "wiki.createPoll")
    public void createPoll(final HttpServerRequest request) {
        RequestUtils.bodyToJson(request, pathPrefix + "pollCreate", payload -> {
            final String pollName = payload.getString("name");
            final String pollDescription = payload.getString("description");

            UserUtils.getUserInfos(eb, request, userInfo -> {
                if (userInfo == null) {
                    renderJson(request, new JsonObject().put("error", "User not found"), 401);
                    return;
                }
                wikiPollService.createPoll(pollName, pollDescription, userInfo.getUserId(), userInfo.getUsername(), userInfo.getEmail())
                        .onSuccess(results -> renderJson(request, new JsonObject().put("_id", results)))
                        .onFailure(err -> {
                            log.error("Error creating poll with name " + payload.getString("name"), err);
                            renderJson(request, new JsonObject().put("error", err.getMessage()), 500);
                        });
            });

        });
    }

    @Post("/polls/:name/vote")
    @ApiDoc("Submit a vote for a poll.")
    @SecuredAction(value = "wiki.votePoll")
    public void submitPollVote(final HttpServerRequest request) {
        final String requestPollName = request.params().get("name");

        RequestUtils.bodyToJson(request, pathPrefix + "pollVote", payload -> {
            final String voteStr = payload.getString("vote");
            final String pollDescription = payload.getString("description");

            UserUtils.getUserInfos(eb, request, userInfo -> {
                if (userInfo == null) {
                    renderJson(request, new JsonObject().put("error", "User not found"), 401);
                    return;
                }

                // Create Vote object
                final Vote vote = new Vote(
                        voteStr,
                        userInfo.getUserId(),
                        userInfo.getUsername(),
                        userInfo.getEmail());

                // Check if poll exists
                wikiPollService.getPoll(requestPollName)
                        .onSuccess(poll -> {
                            // If the poll does not exist, create it and submit the vote
                            if (poll == null) {
                                wikiPollService.createPoll(requestPollName, pollDescription, userInfo.getUserId(), userInfo.getUsername(), userInfo.getEmail())
                                        .onSuccess(createdPollId -> {
                                            wikiPollService.submitPollVote(createdPollId, vote)
                                                    .onSuccess(v -> renderJson(request, new JsonObject().put("status", "vote recorded")))
                                                    .onFailure(err -> {
                                                        log.error("Error submitting poll vote", err);
                                                        renderJson(request, new JsonObject().put("error", err.getMessage()), 500);
                                                    });
                                        })
                                        .onFailure(err -> {
                                            log.error("Error creating poll", err);
                                            renderJson(request, new JsonObject().put("error", err.getMessage()), 500);
                                        });
                            } else {
                                // If poll exists, submit the vote
                                String pollId = poll.get_id();
                                wikiPollService.submitPollVote(pollId, vote)
                                        .onSuccess(v -> renderJson(request, new JsonObject().put("status", "vote recorded")))
                                        .onFailure(err -> {
                                            log.error("Error submitting poll vote", err);
                                            renderJson(request, new JsonObject().put("error", err.getMessage()), 500);
                                        });
                            }
                        })
                        .onFailure(err -> {
                            log.error("Error while retrieving poll with name " + requestPollName, err);
                            renderJson(request, new JsonObject().put("error", err.getMessage()), 500);
                        });
            });
        });
    }

    @Get("/polls/:name/votesSummary")
    @ApiDoc("Get poll vote summary (basically the numbers of YES and the numbers of NO)")
    @SecuredAction("wiki.getPollSummary")
    public void getPollVotesSummary(final HttpServerRequest request) {
        final String requestPollName = request.params().get("name");
        wikiPollService.getPollVotesSummary(requestPollName)
                .onSuccess(votesSummary -> renderJson(request, votesSummary.toJson()))
                .onFailure(err -> renderJson(request, new JsonObject().put("error", err.getMessage()), 500));
    }
}
