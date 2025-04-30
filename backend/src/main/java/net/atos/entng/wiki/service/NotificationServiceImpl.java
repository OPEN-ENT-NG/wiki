package net.atos.entng.wiki.service;

import fr.wseduc.mongodb.MongoDb;
import fr.wseduc.mongodb.MongoQueryBuilder;
import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.I18n;
import fr.wseduc.webutils.http.Renders;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.Promise;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import net.atos.entng.wiki.Wiki;
import org.bson.conversions.Bson;
import org.entcore.common.mongodb.MongoDbResult;
import org.entcore.common.notification.TimelineHelper;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;

import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

import static com.mongodb.client.model.Filters.and;
import static com.mongodb.client.model.Filters.eq;

public class NotificationServiceImpl implements NotificationService {
    public static final String COMMENT_NOTIF_EXPECTED_RIGHT = "net-atos-entng-wiki-controllers-WikiController|updateWiki";
    public static final int OVERVIEW_LENGTH = 50;
    public static final String WIKI_PAGE_CREATED_EVENT_TYPE = "WIKI_PAGE_CREATED";
    public static final String WIKI_COMMENT_CREATED_EVENT_TYPE = "WIKI_COMMENT_CREATED";

    private static final Logger log = LoggerFactory.getLogger(NotificationServiceImpl.class);
    private TimelineHelper timelineHelper;
    private EventBus eventBus;

    public NotificationServiceImpl(TimelineHelper timelineHelper, EventBus eventBus) {
        this.timelineHelper = timelineHelper;
        this.eventBus = eventBus;
    }

    @Override
    public void getDataForNotification(String idWiki, String idPage, Handler<Either<String, JsonObject>> handler) {
        Bson query = eq("_id", idWiki);

        // Projection
        JsonObject projection = new JsonObject();
        projection.put("owner", 1)
                .put("shared", 1)
                .put("title", 1);

        if(idPage!= null && !idPage.trim().isEmpty()) {
            query = and(query, eq("pages._id", idPage));

            JsonObject matchId = new JsonObject().put("_id", idPage);
            JsonObject elemMatch = new JsonObject().put("$elemMatch", matchId);
            projection.put("pages", elemMatch); // returns the whole page. Projection on a field (e.g. "title") of a subdocument of an array is not supported by mongo
        }

        // Send query to event bus
        MongoDb.getInstance().findOne(Wiki.WIKI_COLLECTION, MongoQueryBuilder.build(query), projection,
                MongoDbResult.validResultHandler(handler));
    }

    @Override
    public void notifyPageCreated(HttpServerRequest request, UserInfos pageCreateAuthor, String idWiki, String idPage, String pageTitle, boolean isVisiblePage) {
        // Do not notify hidden page creation
        if (!isVisiblePage) {
            return;
        }

        this.getDataForNotification(idWiki, null, event -> {
            if (event.isRight()) {
                final JsonObject wiki = event.right().getValue();

                // Get the recipients and send the notification
                this.getRecipientsForNotification(wiki, pageCreateAuthor.getUserId(), null)
                        .onSuccess(recipients -> {
                            sendNotification(request,
                                    pageCreateAuthor,
                                    recipients,
                                    pageTitle,
                                    wiki,
                                    idPage,
                                    true,
                                    idPage,
                                    null);
                        })
                        .onFailure(err -> {
                            log.error("Error populating recipients from shared items: " + err.getMessage());
                        });

            } else {
                log.error("Error in service getDataForNotification. Unable to send timeline "
                        + WIKI_PAGE_CREATED_EVENT_TYPE
                        + " notification.");
            }
        });
    }

    @Override
    public void notifyCommentCreated(HttpServerRequest request, UserInfos commentAuthor, String idWiki, String idPage, String idComment, String comment) {
        this.getDataForNotification(idWiki, idPage, event -> {
            if (event.isRight()) {
                final JsonObject wiki = event.right().getValue();
                final JsonObject page = wiki.getJsonArray("pages").getJsonObject(0);

                // Do not notify comment creation for hidden page
                if (!page.getBoolean("isVisible", false)) {
                    return;
                }

                this.getRecipientsForNotification(wiki, commentAuthor.getUserId(), COMMENT_NOTIF_EXPECTED_RIGHT)
                        .onSuccess(recipients -> {
                            sendNotification(request,
                                    commentAuthor,
                                    recipients,
                                    page.getString("title"),
                                    wiki,
                                    idPage,
                                    false,
                                    idComment,
                                    comment);
                        })
                        .onFailure(err -> {
                            log.error("Error populating recipients from shared items: " + err.getMessage());
                        });
            } else {
                log.error("Error in service getDataForNotification. Unable to send timeline "
                        + WIKI_COMMENT_CREATED_EVENT_TYPE
                        + " notification.");
            }
        });
    }

    @Override
    public void notifyPageDeleted(JsonObject wiki, String pageId, UserInfos pageDeleteAuthor, String pageAuthorId, HttpServerRequest request) {
        final String wikiTitle = wiki.getString("title");

        final JsonObject params = new JsonObject()
                .put("uri", "/userbook/annuaire#" + pageDeleteAuthor.getUserId() + "#" + pageDeleteAuthor.getType())
                .put("username", pageDeleteAuthor.getUsername())
                .put("wikiTitle", wikiTitle);

        JsonObject pushNotif = new JsonObject()
                .put("title", "wiki.push.notif.page-deleted.title");

        // if pageId is provided then get page info to send in notification
        if (pageId != null) {
            final String pageTitle = WikiServiceMongoImpl.getPageTitle(wiki, pageId);

            params.put("pageTitle", pageTitle);

            pushNotif.put("body", I18n.getInstance().translate(
                    "wiki.push.notif.page-deleted.body",
                    Renders.getHost(request),
                    I18n.acceptLanguage(request),
                    pageDeleteAuthor.getUsername(),
                    pageTitle,
                    wikiTitle));
        } else {
            params.put("pageTitle", I18n.getInstance().translate(
                    "timeline.wiki.has.deleted.page.multiple",
                    Renders.getHost(request),
                    I18n.acceptLanguage(request)));

            pushNotif.put("body", I18n.getInstance().translate(
                    "wiki.push.notif.pages-deleted.body",
                    Renders.getHost(request),
                    I18n.acceptLanguage(request),
                    pageDeleteAuthor.getUsername(),
                    wikiTitle));
        }

        params.put("pushNotif", pushNotif);

        timelineHelper.notifyTimeline(request,
                "wiki.page-deleted",
                pageDeleteAuthor,
                Collections.singletonList(pageAuthorId),
                pageId,
                params);
    }

    @Override
    public void notifyPageUpdated(HttpServerRequest request, UserInfos pageUpdateAuthor, JsonObject wiki, String idPage, String pageTitle) {
        // Get the recipients and send the notification
        this.getRecipientsForNotification(wiki, pageUpdateAuthor.getUserId(), null)
                .onSuccess(recipients -> {
                    // prepare notification info
                    final String wikiTitle = wiki.getString("title");
                    JsonObject params = new JsonObject();
                    params.put("uri", "/userbook/annuaire#" + pageUpdateAuthor.getUserId() + "#" + pageUpdateAuthor.getType());
                    params.put("username", pageUpdateAuthor.getUsername())
                            .put("pageTitle", pageTitle)
                            .put("wikiTitle", wiki.getString("title"))
                            .put("pageUri", "/wiki/id/" + wiki.getString("_id") + "/page/" + idPage);
                    params.put("resourceUri", params.getString("pageUri"));

                    JsonObject pushNotif = new JsonObject()
                            .put("title", "wiki.push.notif.page-updated.title");
                    params.put("pageTitle", pageTitle);

                    pushNotif.put("body", I18n.getInstance().translate(
                            "wiki.push.notif.page-updated.body",
                            Renders.getHost(request),
                            I18n.acceptLanguage(request),
                            pageUpdateAuthor.getUsername(),
                            pageTitle,
                            wikiTitle));

                    params.put("pushNotif", pushNotif);

                    // send notification
                    timelineHelper.notifyTimeline(request,
                            "wiki.page-updated",
                            pageUpdateAuthor,
                            new ArrayList<>(recipients),
                            wiki.getString("_id"),
                            idPage,
                            params);
                })
                .onFailure(err -> {
                    log.error("Error populating recipients from shared items: " + err.getMessage());
                });
    }

    @Override
    public Future<Set<String>> getRecipientsForNotification(JsonObject wiki, String operationAuthorId, String expectedRight) {
        final Promise<Set<String>> promise = Promise.promise();

        if (wiki == null) {
            promise.fail("Wiki is null");
        } else {
            final Set<String> recipientSet = new HashSet<>();
            final AtomicInteger pendingOperations = new AtomicInteger(0);

            final String wikiOwnerId = wiki.getJsonObject("owner").getString("userId");
            final JsonArray shared = wiki.getJsonArray("shared");

            // Rule #1: If wiki owner is not the operation author, add it to recipients
            if (wikiOwnerId != null && !wikiOwnerId.equals(operationAuthorId)) {
                recipientSet.add(wikiOwnerId);
            }

            // Rule #2: If page author is not the operation author, add it to recipients
            Optional.ofNullable(wiki.getJsonArray("pages"))
                    .map(pages -> pages.getJsonObject(0))
                    .map(page -> page.getString("author"))
                    .filter(author -> !author.equals(operationAuthorId))
                    .ifPresent(recipientSet::add);

            // Process shared items
            if (shared != null) {
                shared.stream()
                        .map(sharedItem -> (JsonObject) sharedItem)
                        .forEach(sharedItemJO -> {
                            // Rule #3: If shared item (user or group) does not have the expected right
                            // 			then do not add it to recipients
                            if (expectedRight != null
                                    && !expectedRight.isEmpty()
                                    && !sharedItemJO.getBoolean(expectedRight, false)) {
                                return;
                            }

                            final String sharedUserId = sharedItemJO.getString("userId", null);
                            // Rule #4: If shared user is not the author then add it to recipients
                            if (sharedUserId != null && !sharedUserId.equals(operationAuthorId)) {
                                recipientSet.add(sharedUserId);
                            } else {
                                final String sharedGroupId = sharedItemJO.getString("groupId", null);
                                // Handle shared group ID asynchronously
                                if (sharedGroupId != null) {
                                    pendingOperations.incrementAndGet(); // Track pending async operation
                                    UserUtils.findUsersInProfilsGroups(sharedGroupId, eventBus, operationAuthorId, false, findUsersEvent -> {
                                        if (findUsersEvent != null) {
                                            findUsersEvent.stream()
                                                    .map(user -> (JsonObject) user)
                                                    .forEach(userJO -> {
                                                        // Rule #4: If shared group member is not the author then add it to recipients
                                                        final String sharedGroupMemberId = userJO.getString("id", null);
                                                        if (sharedGroupMemberId != null && !sharedGroupMemberId.equals(operationAuthorId)) {
                                                            recipientSet.add(sharedGroupMemberId);
                                                        }
                                                    });
                                        }
                                        // Decrement counter and check if all operations are done
                                        if (pendingOperations.decrementAndGet() == 0) {
                                            promise.complete(recipientSet);
                                        }
                                    });
                                }
                            }
                        });
            }

            // Complete the promise if no async operations were triggered
            if (pendingOperations.get() == 0) {
                promise.complete(recipientSet);
            }
        }

        return promise.future();
    }

    @Override
    public void sendNotification(HttpServerRequest request, UserInfos author, Set<String> recipientSet, String pageTitle, JsonObject wiki, String idPage, boolean isCreatePage, String idSubResource, String comment) {
        if (recipientSet != null && !recipientSet.isEmpty()){
            List<String> recipients = new ArrayList<>(recipientSet);

            JsonObject params = new JsonObject();
            params.put("uri", "/userbook/annuaire#" + author.getUserId() + "#" + author.getType());
            params.put("username", author.getUsername())
                    .put("pageTitle", pageTitle)
                    .put("wikiTitle", wiki.getString("title"))
                    .put("pageUri", "/wiki/id/" + wiki.getString("_id") + "/page" + "/" + idPage);
            params.put("resourceUri", params.getString("pageUri"));

            if (!isCreatePage && comment != null && !comment.isEmpty()) {
                if (comment.length() > OVERVIEW_LENGTH) {
                    comment = comment.substring(0, OVERVIEW_LENGTH) + " [...]";
                }
                params.put("overview", comment);
            }

            String notificationName = isCreatePage ? "page-created" : "comment-added";
            String pushNotifTitle = isCreatePage ? "wiki.push.notif.page-created" : "wiki.push.notif.comment-added";
            String pushNotifBody = isCreatePage
                    ? I18n.getInstance().translate(
                    "wiki.push.notif.page-created",
                    Renders.getHost(request),
                    I18n.acceptLanguage(request),
                    author.getUsername(),
                    wiki.getString("title"))
                    : I18n.getInstance().translate(
                    "wiki.push.notif.comment-added",
                    Renders.getHost(request),
                    I18n.acceptLanguage(request),
                    author.getUsername(),
                    pageTitle);

            params.put("pushNotif", new JsonObject().put("title", pushNotifTitle).put("body", pushNotifBody));
            timelineHelper.notifyTimeline(request, "wiki." + notificationName, author, recipients, wiki.getString("_id"), idSubResource, params);
        }
    }
}
