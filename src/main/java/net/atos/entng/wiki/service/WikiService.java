package net.atos.entng.wiki.service;

import org.entcore.common.user.UserInfos;
import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;

import fr.wseduc.webutils.Either;

public interface WikiService {

	public void listWikis(UserInfos user, Handler<Either<String, JsonArray>> handler);

	public void listPages(String idWiki,
			Handler<Either<String, JsonObject>> handler);

	public void listAllPages(UserInfos user, Handler<Either<String, JsonArray>> handler);

	public void getWholeWiki(String id, Handler<Either<String, JsonObject>> handler);

	public void createWiki(UserInfos user, String wikiTitle, String thumbnail,
			Handler<Either<String, JsonObject>> handler);

	public void updateWiki(String idWiki, String wikiTitle, String thumbnail,
			Handler<Either<String, JsonObject>> handler);

	public void deleteWiki(String idWiki,
			Handler<Either<String, JsonObject>> handler);

	public void getPage(String idWiki, String idPage,
			Handler<Either<String, JsonObject>> handler);

	public void createPage(UserInfos user, String idWiki, String newPageId, String pageTitle,
			String pageContent, boolean isIndex, Handler<Either<String, JsonObject>> handler);

	public void updatePage(UserInfos user, String idWiki, String idPage, String pageTitle, String pageContent,
			boolean isIndex, boolean wasIndex, Handler<Either<String, JsonObject>> handler);

	public void deletePage(String idWiki, String idPage,
			Handler<Either<String, JsonObject>> handler);

	public void unsetIndex(String idWiki, String idPage,
			Handler<Either<String, JsonObject>> handler);

	public void getDataForNotification(String idWiki, Handler<Either<String, JsonObject>> handler);

	public void comment(UserInfos user, String idWiki, String idPage, String newCommentId,
			String comment, Handler<Either<String, JsonObject>> handler);

	public void deleteComment(String idWiki, String idPage, String idComment,
			Handler<Either<String, JsonObject>> handler);

	public void createRevision(String wikiId, String pageId, UserInfos user,
			String pageTitle, String pageContent, Handler<Either<String, JsonObject>> handler);

	public void listRevisions(String wikiId, String pageId, Handler<Either<String, JsonArray>> handler);

	public void deleteRevisions(String wikiId, String pageId, Handler<Either<String, JsonObject>> handler);

}
