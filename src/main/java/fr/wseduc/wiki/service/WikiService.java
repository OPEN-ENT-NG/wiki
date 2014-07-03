package fr.wseduc.wiki.service;

import org.entcore.common.user.UserInfos;
import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;

import fr.wseduc.webutils.Either;

public interface WikiService {
	
	public void listWikis(Handler<Either<String, JsonArray>> handler);
	
	public void createWiki(final UserInfos user, String wikiTitle,
			Handler<Either<String, JsonObject>> handler);

	public void getMainPage(String idwiki,
			Handler<Either<String, JsonObject>> handler);

	public void getPage(String idWiki, String idPage,
			Handler<Either<String, JsonObject>> handler);

	public void createPage(UserInfos user, String idWiki, String pageTitle,
			String pageContent, Handler<Either<String, JsonObject>> handler);

}
