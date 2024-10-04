package net.atos.entng.wiki.service;

import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;
import org.entcore.common.user.UserInfos;
import org.junit.Test;
import org.junit.runner.RunWith;

import java.util.Arrays;
import java.util.Collections;

@RunWith(VertxUnitRunner.class)
public class WikiServiceMongoImplTest {

    @Test
    public void shouldBeManagerAsUser(TestContext context) {
        final JsonObject wiki = new JsonObject();
        wiki.put("rights", new JsonArray().add("user:1:manager"));

        final UserInfos userInfos = new UserInfos();
        userInfos.setUserId("1");

        final boolean isManager = WikiServiceMongoImpl.isManager(wiki, userInfos);
        context.assertEquals(isManager, true);
    }

    @Test
    public void shouldBeManagerAsUserInGroup(TestContext context) {
        final JsonObject wiki = new JsonObject();
        wiki.put("rights", new JsonArray().add("group:1:manager"));

        final UserInfos userInfos = new UserInfos();
        userInfos.setGroupsIds(Collections.singletonList("1"));

        final boolean isManager = WikiServiceMongoImpl.isManager(wiki, userInfos);
        context.assertEquals(isManager, true);
    }

    @Test
    public void shouldBeManagerAsOwner(TestContext context) {
        final JsonObject wiki = new JsonObject();
        wiki.put("owner", new JsonObject().put("userId", "1"));

        final UserInfos userInfos = new UserInfos();
        userInfos.setUserId("1");

        final boolean isManager = WikiServiceMongoImpl.isManager(wiki, userInfos);
        context.assertEquals(isManager, true);
    }

    @Test
    public void shouldNotBeManagerAsContrib(TestContext context) {
        final JsonObject wiki = new JsonObject();
        wiki.put("rights", new JsonArray().add("user:1:contrib"));

        final UserInfos userInfos = new UserInfos();
        userInfos.setUserId("1");

        final boolean isManager = WikiServiceMongoImpl.isManager(wiki, userInfos);
        context.assertEquals(isManager, false);
    }

    @Test
    public void shouldNotBeManagerAsDifferentUserid(TestContext context) {
        final JsonObject wiki = new JsonObject();
        wiki.put("rights", new JsonArray().add("user:1:manager"));

        final UserInfos userInfos = new UserInfos();
        userInfos.setUserId("2");

        final boolean isManager = WikiServiceMongoImpl.isManager(wiki, userInfos);
        context.assertEquals(isManager, false);
    }

    @Test
    public void shouldBeContrib(TestContext context) {
        final JsonObject wiki = new JsonObject();
        wiki.put("rights", new JsonArray().add("user:1:contrib"));

        final UserInfos userInfos = new UserInfos();
        userInfos.setUserId("1");

        final boolean isContrib = WikiServiceMongoImpl.isContrib(wiki, userInfos);
        context.assertEquals(isContrib, true);
    }

    @Test
    public void shouldNotBeContribAsDifferentUserid(TestContext context) {
        final JsonObject wiki = new JsonObject();
        wiki.put("rights", new JsonArray().add("user:1:contrib"));

        final UserInfos userInfos = new UserInfos();
        userInfos.setUserId("2");

        final boolean isContrib = WikiServiceMongoImpl.isContrib(wiki, userInfos);
        context.assertEquals(isContrib, false);
    }

    @Test
    public void shouldBePageAuthor(TestContext context) {
        final JsonObject page = new JsonObject();
        page.put("author", "1");

        final UserInfos userInfos = new UserInfos();
        userInfos.setUserId("1");

        final boolean isPageAuthor = WikiServiceMongoImpl.isPageAuthor(page, userInfos);
        context.assertEquals(isPageAuthor, true);
    }

    @Test
    public void shouldNotBePageAuthorAsDifferentUserid(TestContext context) {
        final JsonObject page = new JsonObject();
        page.put("author", "1");

        final UserInfos userInfos = new UserInfos();
        userInfos.setUserId("2");

        final boolean isPageAuthor = WikiServiceMongoImpl.isPageAuthor(page, userInfos);
        context.assertEquals(isPageAuthor, false);
    }

    @Test
    public void shouldGetOneSubpage(TestContext context) {
        final JsonObject pageParent = new JsonObject()
                .put("_id", "pageParent1");

        final JsonObject subPage = new JsonObject()
                .put("_id", "subpage1")
                .put("parentId", "pageParent1");

        final JsonArray pages = new JsonArray()
                .add(pageParent)
                .add(subPage);

        final JsonObject wiki = new JsonObject()
                .put("pages", pages);

        final JsonArray subPages = WikiServiceMongoImpl.getSubPages(wiki, Arrays.asList("pageParent1"));
        context.assertEquals(subPages.size(), 1);
    }

    @Test
    public void shouldGetNoSubpage(TestContext context) {
        final JsonObject pageParent = new JsonObject()
                .put("_id", "page1");

        final JsonObject subPage = new JsonObject()
                .put("_id", "page2");

        final JsonArray pages = new JsonArray()
                .add(pageParent)
                .add(subPage);

        final JsonObject wiki = new JsonObject()
                .put("pages", pages);

        final JsonArray subPages = WikiServiceMongoImpl.getSubPages(wiki, Arrays.asList("page1"));
        context.assertEquals(subPages.size(), 0);
    }
}
