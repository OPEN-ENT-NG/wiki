/*
 * Copyright © Région Nord Pas de Calais-Picardie,  Département 91, Région Aquitaine-Limousin-Poitou-Charentes, 2016.
 *
 * This file is part of OPEN ENT NG. OPEN ENT NG is a versatile ENT Project based on the JVM and ENT Core Project.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation (version 3 of the License).
 *
 * For the sake of explanation, any module that communicate over native
 * Web protocols, such as HTTP, with OPEN ENT NG is outside the scope of this
 * license and could be license under its own terms. This is merely considered
 * normal use of OPEN ENT NG, and does not fall under the heading of "covered work".
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 */

package net.atos.entng.wiki.service;

import org.entcore.common.user.UserInfos;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

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

	/**
	 * Unset field "index" if "idPage" is the index
	 */
	public void unsetIndex(String idWiki, String idPage,
			Handler<Either<String, JsonObject>> handler);

	/**
	 * Get title, owner, userIds and groupIds of wiki.
	 * If parameter "idPage" is supplied, also get the associated page
	 */
	public void getDataForNotification(String idWiki, String idPage, Handler<Either<String, JsonObject>> handler);

	public void comment(UserInfos user, String idWiki, String idPage, String newCommentId,
			String comment, Handler<Either<String, JsonObject>> handler);

	public void deleteComment(String idWiki, String idPage, String idComment,
			Handler<Either<String, JsonObject>> handler);

	public void createRevision(String wikiId, String pageId, UserInfos user,
			String pageTitle, String pageContent, Handler<Either<String, JsonObject>> handler);

	public void listRevisions(String wikiId, String pageId, Handler<Either<String, JsonArray>> handler);

	public void deleteRevisions(String wikiId, String pageId, Handler<Either<String, JsonObject>> handler);

}
