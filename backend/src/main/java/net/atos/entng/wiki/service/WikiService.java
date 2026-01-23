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

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import io.vertx.core.Future;
import io.vertx.core.http.HttpServerRequest;
import net.atos.entng.wiki.to.PageId;
import net.atos.entng.wiki.to.PageListRequest;
import net.atos.entng.wiki.to.PageListResponse;
import net.atos.entng.wiki.to.WikiGenerateRequest;
import org.entcore.common.audience.AudienceRightChecker;
import org.entcore.common.user.UserInfos;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

import fr.wseduc.webutils.Either;
import org.entcore.edificewikigenerator.CourseHierarchy;
import org.entcore.edificewikigenerator.CourseResponse;

public interface WikiService extends AudienceRightChecker {

	/**
	 * Generate a wiki using AI.
	 *
	 * @param user      The user requesting wiki generation.
     * @param dto       The DTO containing all required fields for wiki generation (level, subject, sequence, keywords).
     * @param sessionId The session ID extracted from the HTTP request.
     * @param userAgent The User-Agent string extracted from the HTTP request.
     * @return Future with the generated wiki ID.
     */
	Future<String> generateWiki(UserInfos user, WikiGenerateRequest dto, String sessionId, String userAgent);

	default void getWiki(String id, Handler<Either<String, JsonObject>> handler){
		getWiki(id, false, handler);
	}

	void getWiki(String id, boolean includeContent, Handler<Either<String, JsonObject>> handler);

	/* public void getWholeWiki(String id, Handler<Either<String, JsonObject>> handler); */

	public void getWikis(UserInfos user, Handler<Either<String, JsonArray>> handler);

	public void createWiki(UserInfos user, String wikiTitle, String thumbnail, String description, final Optional<Number> folderId,
			Handler<Either<String, JsonObject>> handler);

	public void updateWiki(UserInfos user, String idWiki, String wikiTitle, String thumbnail, String description,
			Handler<Either<String, JsonObject>> handler);

	public void deleteWiki(UserInfos user, String idWiki,
			Handler<Either<String, JsonObject>> handler);

	void getPage(String idWiki, String idPage, HttpServerRequest request, boolean originalFormat, Handler<Either<String, JsonObject>> handler);

	public void getPages(String idWiki, String getContent,
						 Handler<Either<String, JsonObject>> handler);
	/**
	 * List all pages of a wiki
	 * @param user the user
	 * @param onlyVisible if true, only visible pages are returned (except for managers and authors) 
	 * @param handler the handler with the pages as JsonArray
	 */
	public void listAllPages(UserInfos user, boolean onlyVisible, Handler<Either<String, JsonArray>> handler);

	public void createPage(UserInfos user, String wikiId, JsonObject page, HttpServerRequest request
			, Handler<Either<String, JsonObject>> handler);

	public void updatePage(UserInfos user, String idWiki, String idPage, JsonObject pagePayload, HttpServerRequest request, Handler<Either<String, JsonObject>> handler);

	Future<PageListResponse> updatePageList(UserInfos user, String idWiki, PageListRequest pageList);

	public Future<Map<String, List<String>>> deletePage(UserInfos user, JsonObject wiki, String idPage);

	Future<Map<String, List<String>>> deletePages(UserInfos user, JsonObject wiki, Set<String> idPages);

	/**
	 * Unset field "index" if "idPage" is the index
	 */
	public void unsetIndex(String idWiki, String idPage,
			Handler<Either<String, JsonObject>> handler);

	/**
	 * Add a new comment to the page.
	 * @param user
	 * @param idWiki
	 * @param idPage
	 * @param newCommentId
	 * @param comment
	 * @param replyTo the ID of the comment to which the new comment is a reply
	 * @param handler
	 */
	public void addComment(UserInfos user, String idWiki, String idPage, String newCommentId,
			String comment, String replyTo, Handler<Either<String, JsonObject>> handler);

	public void deleteComment(String idWiki, String idPage, String idComment,
			Handler<Either<String, JsonObject>> handler);

	public void updateComment(String idWiki, String idPage, String idComment, String comment,
							  Handler<Either<String, JsonObject>> handler);

	public Future<Void> createRevision(String wikiId, String pageId, UserInfos user, String pageTitle, String pageContent,
										 boolean isVisible, Integer position);

	public void listRevisions(String wikiId, String pageId, Handler<Either<String, JsonArray>> handler);

	/**
	 *
	 * @param revisionId id of the revision
	 * @param handler a Handler that receive revision content as JsonObject using an Either
	 */
	void getRevisionById(String revisionId, Handler<Either<String, JsonObject>> handler);

	public void deleteRevisions(String wikiId, String pageId, Handler<Either<String, JsonObject>> handler);

	/**
	 * Duplicate a page to multiple wikis
	 * @param user the user
	 * @param sourceWikiId the source wiki ID
	 * @param sourcePageId the source page ID
	 * @param targetWikiIdList the list of target wiki IDs
	 * @param shouldIncludeSubPages wether subpages are also duplicated
	 * @return the list of new page IDs
	 */
	Future<List<PageId>> duplicatePage(UserInfos user, String sourceWikiId, String sourcePageId, List<String> targetWikiIdList, boolean shouldIncludeSubPages);

	/**
	 * Update wiki structure from AI-generated page hierarchy.
	 * Used by AI generator to populate wiki pages structure.
	 * 
	 * @param wikiId The wiki ID to update
	 * @param structure The AI-generated page structure
	 * @return Future that completes when structure is updated
	 */
	Future<Void> updateWikiStructureFromAI(String wikiId, CourseHierarchy structure);

	/**
	 * Update wiki content from AI-generated course response.
	 * Used by AI generator to populate wiki pages with content.
	 * 
	 * @param wikiId The wiki ID to update
	 * @param courseResponse The AI-generated course contains one page only at a time, allows frontend to stream content updates.
	 * @return Future that completes when content is updated
	 */
	Future<Void> updateWikiContentFromAI(String wikiId, CourseResponse courseResponse);
}
