package net.atos.entng.wiki.service;

import fr.wseduc.webutils.Either;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonObject;
import org.entcore.common.user.UserInfos;

import java.util.Set;

public interface NotificationService {
    /**
     * Get title, owner, userIds and groupIds of wiki.
     * If parameter "idPage" is supplied, also get the associated page
     */
    void getDataForNotification(String idWiki, String idPage, Handler<Either<String, JsonObject>> handler);

    /**
     * Notify page creation.
     * @param request
     * @param pageCreateAuthor
     * @param idWiki
     * @param idPage
     * @param pageTitle
     * @param isVisiblePage
     */
    void notifyPageCreated(final HttpServerRequest request, final UserInfos pageCreateAuthor,
                                   final String idWiki, final String idPage, final String pageTitle,
                                   final boolean isVisiblePage);

    /**
     * Notify comment creation.
     * @param request
     * @param commentAuthor
     * @param idWiki
     * @param idPage
     * @param idComment
     * @param comment
     */
    void notifyCommentCreated(final HttpServerRequest request, final UserInfos commentAuthor,
                              final String idWiki, final String idPage, final String idComment, final String comment);

    /**
     * Notify author of page deletion.
     * Only notify page author.
     *
     * @param wiki wiki information
     * @param pageId if pageId is provided then get page info to send in notification
     * @param pageDeleteAuthor user who deleted the page
     * @param pageAuthorId author of page to send notification
     * @param request http request to get host and language for notification message
     */
    void notifyPageDeleted(final JsonObject wiki, final String pageId, final UserInfos pageDeleteAuthor,
                           final String pageAuthorId, final HttpServerRequest request);

    /**
     * Send notification for page update if page visibility has changed from hidden to visible.
     * @param request the HTTP request
     * @param pageUpdateAuthor the author of the page update
     * @param wiki the wiki information
     * @param idPage the ID of the page
     * @param pageTitle the title of the page
     */
    void notifyPageUpdated(final HttpServerRequest request, final UserInfos pageUpdateAuthor, final JsonObject wiki,
                           final String idPage, final String pageTitle);

    /**
     * Get the recipients for a notification based on the wiki information and the operation author.
     * This method is used for the following operations:
     * - Page creation
     * - Page update
     * - Comment creation
     *
     * @param wiki the wiki information
     * @param operationAuthorId the ID of the user who performed the operation
     * @param expectedRight the expected right for shared items
     * @return a future containing the set of recipient IDs
     */
    Future<Set<String>> getRecipientsForNotification(final JsonObject wiki, final String operationAuthorId,
                                                     final String expectedRight);

    /**
     * Send a notification to the recipients.
     * @param request
     * @param author
     * @param recipientSet
     * @param pageTitle
     * @param wiki
     * @param idPage
     * @param isCreatePage
     * @param idSubResource
     * @param comment
     */
    void sendNotification(final HttpServerRequest request, final UserInfos author, final Set<String> recipientSet,
                          final String pageTitle, final JsonObject wiki, final String idPage,
                          final boolean isCreatePage, final String idSubResource, String comment);
}
