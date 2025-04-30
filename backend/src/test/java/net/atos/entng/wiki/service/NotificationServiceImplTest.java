package net.atos.entng.wiki.service;

import io.vertx.core.Context;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.Async;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;
import org.entcore.common.user.UserUtils;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.MockedStatic;
import static org.mockito.Mockito.*;

import java.util.Collections;
import java.util.List;
import java.util.Set;

@RunWith(VertxUnitRunner.class)
public class NotificationServiceImplTest {
    private static final Vertx vertx = Vertx.vertx();
    private static MockedStatic<Vertx> mockedVertx;
    private static MockedStatic<UserUtils> mockedUserUtils;

    @BeforeClass
    public static void setUp(TestContext context) {
        // Mock Vertx
        mockedVertx = mockStatic(Vertx.class);
        // Mock the current context
        Context mockContext = mock(Context.class);
        Vertx mockVertx = mock(Vertx.class);

        // Define behavior for Vertx.currentContext() and Context.owner()
        mockedVertx.when(Vertx::currentContext).thenReturn(mockContext);
        when(mockContext.owner()).thenReturn(mockVertx);

        mockedUserUtils = mockStatic(UserUtils.class);
    }

    @AfterClass
    public static void tearDown() {
        if(!mockedVertx.isClosed()) {
            mockedVertx.close();
        }
        if(!mockedUserUtils.isClosed()) {
            mockedUserUtils.close();
        }
    }

    /**
     * <h2>Goal</h2>
     * <p>
     *     Checks that the recipients of a page creation notification are correctly retrieved.
     * </p>
     * <p>
     *     The recipients should include:
     *     - The wiki owner
     *     - The shared users:
     *       - sharedUser1
     *       - users in sharedGroup1: mockedUsersInGroup1 & mockedUsersInGroup2
     * </p>
     * <p>
     *     The recipients should not include:
     *     - The page author
     * </p>
     * @param context
     */
    @Test
    public void testGetRecipientsForPageCreatedNotification(TestContext context) {
        // mock data
        final String wikiOwnerId = "wikiOwner1";
        final String pageAuthorId = "pageAuthor1";
        final String sharedUserId = "sharedUser1";
        final String sharedGroupId = "sharedGroup1";
        final JsonArray mockedUsersInGroup = new JsonArray()
                .add(new JsonObject().put("id", "mockedUsersInGroup1"))
                .add(new JsonObject().put("id", "mockedUsersInGroup2"));

        final JsonObject owner = new JsonObject().put("userId", wikiOwnerId);
        final List pages = Collections.singletonList(new JsonObject().put("author", pageAuthorId));
        final JsonArray sharedArray = new JsonArray()
                .add(new JsonObject().put("userId", sharedUserId))
                .add(new JsonObject().put("groupId", sharedGroupId));

        JsonObject wiki = new JsonObject()
                .put("owner", owner)
                .put("pages", pages)
                .put("shared", sharedArray);

        mockedUserUtils.when(() ->
                UserUtils.findUsersInProfilsGroups(eq(sharedGroupId), any(), eq(pageAuthorId), eq(false), any())
        ).thenAnswer(invocation -> {
            Handler<JsonArray> handler = invocation.getArgument(4);
            vertx.runOnContext(v -> {
                handler.handle(mockedUsersInGroup); // Simulate the callback
            });
            return null;
        });

        // Act
        Future<Set<String>> future = new NotificationServiceImpl(null, null)
                .getRecipientsForNotification(wiki, pageAuthorId, null);

        // Use async to wait for the test to complete
        final Async async = context.async();

        // Assert
        future.onComplete(result -> {
            context.assertTrue(result.succeeded());

            Set<String> recipients = result.result();
            context.assertTrue(recipients.contains(wikiOwnerId));
            context.assertTrue(recipients.contains(sharedUserId));
            context.assertTrue(recipients.contains("mockedUsersInGroup1"));
            context.assertTrue(recipients.contains("mockedUsersInGroup2"));
            context.assertFalse(recipients.contains(pageAuthorId));

            async.complete();
        });
    }

    /**
     * <h2>Goal</h2>
     * <p>
     *     Checks that the recipients of a page update notification are correctly retrieved.
     *     The update author is not the page author, meaning that the page author should be included in the recipients.
     * </p>
     * <p>
     *     The recipients should include:
     *     - The wiki owner
     *     - The page author
     *     - The shared users:
     *       - sharedUser1
     *       - users in sharedGroup1: mockedUsersInGroup1 & mockedUsersInGroup2
     * </p>
     * <p>
     *     The recipients should not include:
     *     - The page update author
     * </p>
     * @param context
     */
    @Test
    public void testGetRecipientsForPageUpdatedNotificationWhenUpdaterIsNotPageAuthor(TestContext context) {
        // mock data
        final String pageUpdateAuthorId = "pageUpdateAuthor1";
        final String wikiOwnerId = "wikiOwner1";
        final String pageAuthorId = "pageAuthor1";
        final String sharedUserId = "sharedUser1";
        final String sharedGroupId = "sharedGroup1";
        final JsonArray mockedUsersInGroup = new JsonArray()
                .add(new JsonObject().put("id", "mockedUsersInGroup1"))
                .add(new JsonObject().put("id", "mockedUsersInGroup2"));

        final JsonObject owner = new JsonObject().put("userId", wikiOwnerId);
        final List pages = Collections.singletonList(new JsonObject().put("author", pageAuthorId));
        final JsonArray sharedArray = new JsonArray()
                .add(new JsonObject().put("userId", sharedUserId))
                .add(new JsonObject().put("groupId", sharedGroupId));

        JsonObject wiki = new JsonObject()
                .put("owner", owner)
                .put("pages", pages)
                .put("shared", sharedArray);

        mockedUserUtils.when(() ->
                UserUtils.findUsersInProfilsGroups(eq(sharedGroupId), any(), eq(pageUpdateAuthorId), eq(false), any())
        ).thenAnswer(invocation -> {
            Handler<JsonArray> handler = invocation.getArgument(4);
            vertx.runOnContext(v -> {
                handler.handle(mockedUsersInGroup); // Simulate the callback
            });
            return null;
        });

        // Act
        Future<Set<String>> future = new NotificationServiceImpl(null, null)
                .getRecipientsForNotification(wiki, pageUpdateAuthorId, null);

        // Use async to wait for the test to complete
        final Async async = context.async();

        // Assert
        future.onComplete(result -> {
            context.assertTrue(result.succeeded());

            Set<String> recipients = result.result();
            context.assertTrue(recipients.contains(wikiOwnerId));
            context.assertTrue(recipients.contains(sharedUserId));
            context.assertTrue(recipients.contains("mockedUsersInGroup1"));
            context.assertTrue(recipients.contains("mockedUsersInGroup2"));
            context.assertTrue(recipients.contains(pageAuthorId));
            context.assertFalse(recipients.contains(pageUpdateAuthorId));

            async.complete();
        });
    }

    /**
     * <h2>Goal</h2>
     * <p>
     *     Checks that the recipients of a page update notification are correctly retrieved.
     *     The update author is the page author, meaning that the page author should not be included in the recipients.
     * </p>
     * <p>
     *     The recipients should include:
     *     - The wiki owner
     *     - The shared users:
     *       - sharedUser1
     *       - users in sharedGroup1: mockedUsersInGroup1 & mockedUsersInGroup2
     * </p>
     * <p>
     *     The recipients should not include:
     *     - The page author
     * </p>
     * @param context
     */
    @Test
    public void testGetRecipientsForPageUpdatedNotificationWhenUpdaterIsPageAuthor(TestContext context) {
        // mock data
        final String wikiOwnerId = "wikiOwner1";
        final String pageAuthorId = "pageAuthor1";
        final String pageUpdateAuthorId = pageAuthorId;
        final String sharedUserId = "sharedUser1";
        final String sharedGroupId = "sharedGroup1";
        final JsonArray mockedUsersInGroup = new JsonArray()
                .add(new JsonObject().put("id", "mockedUsersInGroup1"))
                .add(new JsonObject().put("id", "mockedUsersInGroup2"));

        final JsonObject owner = new JsonObject().put("userId", wikiOwnerId);
        final List pages = Collections.singletonList(new JsonObject().put("author", pageAuthorId));
        final JsonArray sharedArray = new JsonArray()
                .add(new JsonObject().put("userId", sharedUserId))
                .add(new JsonObject().put("groupId", sharedGroupId));

        JsonObject wiki = new JsonObject()
                .put("owner", owner)
                .put("pages", pages)
                .put("shared", sharedArray);

        mockedUserUtils.when(() ->
                UserUtils.findUsersInProfilsGroups(eq(sharedGroupId), any(), eq(pageUpdateAuthorId), eq(false), any())
        ).thenAnswer(invocation -> {
            Handler<JsonArray> handler = invocation.getArgument(4);
            vertx.runOnContext(v -> {
                handler.handle(mockedUsersInGroup); // Simulate the callback
            });
            return null;
        });

        // Act
        Future<Set<String>> future = new NotificationServiceImpl(null, null)
                .getRecipientsForNotification(wiki, pageUpdateAuthorId, null);

        // Use async to wait for the test to complete
        final Async async = context.async();

        // Assert
        future.onComplete(result -> {
            context.assertTrue(result.succeeded());

            Set<String> recipients = result.result();
            context.assertTrue(recipients.contains(wikiOwnerId));
            context.assertTrue(recipients.contains(sharedUserId));
            context.assertTrue(recipients.contains("mockedUsersInGroup1"));
            context.assertTrue(recipients.contains("mockedUsersInGroup2"));
            context.assertFalse(recipients.contains(pageAuthorId));
            context.assertFalse(recipients.contains(pageUpdateAuthorId));

            async.complete();
        });
    }

    /**
     * <h2>Goal</h2>
     * <p>
     *     Checks that the recipients of a page comment notification are correctly retrieved.
     *     The comment author is the page author, meaning that the page author should not be included in the recipients.
     * </p>
     * <p>
     *     The recipients should include:
     *     - The wiki owner
     *     - The shared users:
     *       - sharedUser1
     *       - users in sharedGroup1: mockedUsersInGroup1 & mockedUsersInGroup2
     * </p>
     * <p>
     *     The recipients should not include:
     *     - The page author
     * </p>
     * @param context
     */
    @Test
    public void testGetRecipientsForPageCommentNotificationWhenCommentUserIsPageAuthor(TestContext context) {
        // mock data
        final String wikiOwnerId = "wikiOwner1";
        final String pageAuthorId = "pageAuthor1";
        final String pageCommentAuthorId = pageAuthorId;
        final String sharedUserId = "sharedUser1";
        final String expectedRight = NotificationServiceImpl.COMMENT_NOTIF_EXPECTED_RIGHT;
        final String sharedGroupId = "sharedGroup1";
        final JsonArray mockedUsersInGroup = new JsonArray()
                .add(new JsonObject().put("id", "mockedUsersInGroup1"))
                .add(new JsonObject().put("id", "mockedUsersInGroup2"));

        final JsonObject owner = new JsonObject().put("userId", wikiOwnerId);
        final List pages = Collections.singletonList(new JsonObject().put("author", pageAuthorId));
        final JsonArray sharedArray = new JsonArray()
                .add(new JsonObject().put("userId", sharedUserId).put(expectedRight, true))
                .add(new JsonObject().put("groupId", sharedGroupId).put(expectedRight, true));

        JsonObject wiki = new JsonObject()
                .put("owner", owner)
                .put("pages", pages)
                .put("shared", sharedArray);

        mockedUserUtils.when(() ->
                UserUtils.findUsersInProfilsGroups(eq(sharedGroupId), any(), eq(pageCommentAuthorId), eq(false), any())
        ).thenAnswer(invocation -> {
            Handler<JsonArray> handler = invocation.getArgument(4);
            vertx.runOnContext(v -> {
                handler.handle(mockedUsersInGroup); // Simulate the callback
            });
            return null;
        });

        // Act
        Future<Set<String>> future = new NotificationServiceImpl(null, null)
                .getRecipientsForNotification(wiki, pageCommentAuthorId, expectedRight);

        // Use async to wait for the test to complete
        final Async async = context.async();

        // Assert
        future.onComplete(result -> {
            context.assertTrue(result.succeeded());

            Set<String> recipients = result.result();
            context.assertTrue(recipients.contains(wikiOwnerId));
            context.assertTrue(recipients.contains(sharedUserId));
            context.assertTrue(recipients.contains("mockedUsersInGroup1"));
            context.assertTrue(recipients.contains("mockedUsersInGroup2"));
            context.assertFalse(recipients.contains(pageAuthorId));
            context.assertFalse(recipients.contains(pageCommentAuthorId));

            async.complete();
        });
    }

    /**
     * <h2>Goal</h2>
     * <p>
     *     Checks that the recipients of a page comment notification are correctly retrieved.
     *     The comment author is not the page author, meaning that the page author should be included in the recipients.
     * </p>
     * <p>
     *     The recipients should include:
     *     - The wiki owner
     *     - The page author
     *     - The shared users:
     *       - sharedUser1
     *       - users in sharedGroup1: mockedUsersInGroup1 & mockedUsersInGroup2
     * </p>
     * <p>
     *     The recipients should not include:
     *     - The page comment author
     * </p>
     * @param context
     */
    @Test
    public void testGetRecipientsForPageCommentNotificationWhenCommentUserIsNotPageAuthor(TestContext context) {
        // mock data
        final String pageCommentAuthorId = "pageCommentAuthor1";
        final String wikiOwnerId = "wikiOwner1";
        final String pageAuthorId = "pageAuthor1";
        final String sharedUserId = "sharedUser1";
        final String expectedRight = NotificationServiceImpl.COMMENT_NOTIF_EXPECTED_RIGHT;
        final String sharedGroupId = "sharedGroup1";
        final JsonArray mockedUsersInGroup = new JsonArray()
                .add(new JsonObject().put("id", "mockedUsersInGroup1"))
                .add(new JsonObject().put("id", "mockedUsersInGroup2"));

        final JsonObject owner = new JsonObject().put("userId", wikiOwnerId);
        final List pages = Collections.singletonList(new JsonObject().put("author", pageAuthorId));
        final JsonArray sharedArray = new JsonArray()
                .add(new JsonObject().put("userId", sharedUserId).put(expectedRight, true))
                .add(new JsonObject().put("groupId", sharedGroupId).put(expectedRight, true));

        JsonObject wiki = new JsonObject()
                .put("owner", owner)
                .put("pages", pages)
                .put("shared", sharedArray);

        mockedUserUtils.when(() ->
                UserUtils.findUsersInProfilsGroups(eq(sharedGroupId), any(), eq(pageCommentAuthorId), eq(false), any())
        ).thenAnswer(invocation -> {
            Handler<JsonArray> handler = invocation.getArgument(4);
            vertx.runOnContext(v -> {
                handler.handle(mockedUsersInGroup); // Simulate the callback
            });
            return null;
        });

        // Act
        Future<Set<String>> future = new NotificationServiceImpl(null, null)
                .getRecipientsForNotification(wiki, pageCommentAuthorId, expectedRight);

        // Use async to wait for the test to complete
        final Async async = context.async();

        // Assert
        future.onComplete(result -> {
            context.assertTrue(result.succeeded());

            Set<String> recipients = result.result();
            context.assertTrue(recipients.contains(wikiOwnerId));
            context.assertTrue(recipients.contains(sharedUserId));
            context.assertTrue(recipients.contains("mockedUsersInGroup1"));
            context.assertTrue(recipients.contains("mockedUsersInGroup2"));
            context.assertTrue(recipients.contains(pageAuthorId));
            context.assertFalse(recipients.contains(pageCommentAuthorId));

            async.complete();
        });
    }

    /**
     * <h2>Goal</h2>
     * <p>
     *     Checks that the recipients of a page comment notification are correctly retrieved.
     *     The comment author is the page author, meaning that the page author should not be included in the recipients.
     *     And the expected right for shared users is not the one expected so shared users should not be included in the recipients.
     * </p>
     * <p>
     *     The recipients should include:
     *     - The wiki owner
     *
     * </p>
     * <p>
     *     The recipients should not include:
     *     - The page author
     *     - The shared users
     * </p>
     * @param context
     */
    @Test
    public void testGetRecipientsForPageCommentNotificationWhenCommentUserIsPageAuthorAndExpectedRightIsNotCorrect(TestContext context) {
        // mock data
        final String wikiOwnerId = "wikiOwner1";
        final String pageAuthorId = "pageAuthor1";
        final String pageCommentAuthorId = pageAuthorId;
        final String sharedUserId = "sharedUser1";
        final String expectedRight = NotificationServiceImpl.COMMENT_NOTIF_EXPECTED_RIGHT;
        final String notExpectedRight = "notExpectedRight";
        final String sharedGroupId = "sharedGroup1";
        final JsonArray mockedUsersInGroup = new JsonArray()
                .add(new JsonObject().put("id", "mockedUsersInGroup1"))
                .add(new JsonObject().put("id", "mockedUsersInGroup2"));

        final JsonObject owner = new JsonObject().put("userId", wikiOwnerId);
        final List pages = Collections.singletonList(new JsonObject().put("author", pageAuthorId));
        final JsonArray sharedArray = new JsonArray()
                .add(new JsonObject().put("userId", sharedUserId).put(notExpectedRight, true))
                .add(new JsonObject().put("groupId", sharedGroupId).put(notExpectedRight, true));

        JsonObject wiki = new JsonObject()
                .put("owner", owner)
                .put("pages", pages)
                .put("shared", sharedArray);

        mockedUserUtils.when(() ->
                UserUtils.findUsersInProfilsGroups(eq(sharedGroupId), any(), eq(pageCommentAuthorId), eq(false), any())
        ).thenAnswer(invocation -> {
            Handler<JsonArray> handler = invocation.getArgument(4);
            vertx.runOnContext(v -> {
                handler.handle(mockedUsersInGroup); // Simulate the callback
            });
            return null;
        });

        // Act
        Future<Set<String>> future = new NotificationServiceImpl(null, null)
                .getRecipientsForNotification(wiki, pageCommentAuthorId, expectedRight);

        // Use async to wait for the test to complete
        final Async async = context.async();

        // Assert
        future.onComplete(result -> {
            context.assertTrue(result.succeeded());

            Set<String> recipients = result.result();
            context.assertTrue(recipients.contains(wikiOwnerId));
            context.assertFalse(recipients.contains(sharedUserId));
            context.assertFalse(recipients.contains("mockedUsersInGroup1"));
            context.assertFalse(recipients.contains("mockedUsersInGroup2"));
            context.assertFalse(recipients.contains(pageAuthorId));
            context.assertFalse(recipients.contains(pageCommentAuthorId));

            async.complete();
        });
    }
}