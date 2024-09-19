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

import java.util.Optional;

import io.vertx.core.http.HttpServerRequest;
import org.entcore.common.user.UserInfos;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

import fr.wseduc.webutils.Either;

public interface WikiService {
	public void getWiki(String id, Handler<Either<String, JsonObject>> handler);

	/* public void getWholeWiki(String id, Handler<Either<String, JsonObject>> handler); */

	public void getWikis(UserInfos user, Handler<Either<String, JsonArray>> handler);

	public void createWiki(UserInfos user, String wikiTitle, String thumbnail, String description, final Optional<Number> folderId,
			Handler<Either<String, JsonObject>> handler);

	public void updateWiki(UserInfos user, String idWiki, String wikiTitle, String thumbnail, String description,
			Handler<Either<String, JsonObject>> handler);

	public void deleteWiki(UserInfos user, String idWiki,
			Handler<Either<String, JsonObject>> handler);

	public void getPage(String idWiki, String idPage, HttpServerRequest request,
			Handler<Either<String, JsonObject>> handler);

	public void getPages(String idWiki, String getContent,
						 Handler<Either<String, JsonObject>> handler);

	public void createPage(UserInfos user, String wikiId, JsonObject page, HttpServerRequest request
			, Handler<Either<String, JsonObject>> handler);

	public void updatePage(UserInfos user, String idWiki, JsonObject page, HttpServerRequest request, Handler<Either<String, JsonObject>> handler);

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

	public void addComment(UserInfos user, String idWiki, String idPage, String newCommentId,
			String comment, Handler<Either<String, JsonObject>> handler);

	public void deleteComment(String idWiki, String idPage, String idComment,
			Handler<Either<String, JsonObject>> handler);

	public void updateComment(String idWiki, String idPage, String idComment, String comment,
							  Handler<Either<String, JsonObject>> handler);

	public void createRevision(String wikiId, String pageId, UserInfos user,
			String pageTitle, String pageContent, boolean isVisible, Handler<Either<String, JsonObject>> handler);

	public void listRevisions(String wikiId, String pageId, Handler<Either<String, JsonArray>> handler);

	/**
	 *
	 * @param revisionId id of the revision
	 * @param handler a Handler that receive revision content as JsonObject using an Either
	 */
	void getRevisionById(String revisionId, Handler<Either<String, JsonObject>> handler);

	public void deleteRevisions(String wikiId, String pageId, Handler<Either<String, JsonObject>> handler);

}
