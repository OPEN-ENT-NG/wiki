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

import static net.atos.entng.wiki.Wiki.REVISIONS_COLLECTION;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.bson.types.ObjectId;
import org.entcore.common.explorer.impl.ExplorerPlugin;
import org.entcore.common.mongodb.MongoDbResult;
import org.entcore.common.service.impl.MongoDbCrudService;
import org.entcore.common.user.UserInfos;
import org.entcore.common.utils.StringUtils;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

import com.mongodb.BasicDBObject;
import com.mongodb.DBObject;
import com.mongodb.QueryBuilder;

import fr.wseduc.mongodb.MongoDb;
import fr.wseduc.mongodb.MongoQueryBuilder;
import fr.wseduc.mongodb.MongoUpdateBuilder;
import fr.wseduc.webutils.Either;

public class WikiServiceMongoImpl extends MongoDbCrudService implements WikiService {

	private final String collection;
	private final MongoDb mongo;
	private final ExplorerPlugin explorerPlugin;

	public WikiServiceMongoImpl(final String collection, final ExplorerPlugin plugin) {
		super(collection);
		this.collection = collection;
		this.mongo = MongoDb.getInstance();
		this.explorerPlugin = plugin;
	}

	// TODO : créer des constantes pour les noms des champs

	@Override
	public void listWikis(UserInfos user,
			Handler<Either<String, JsonArray>> handler) {
		// Query : return wikis visible by current user only (i.e. owner or
		// shared)
		List<DBObject> groups = new ArrayList<>();
		groups.add(QueryBuilder.start("userId").is(user.getUserId()).get());
		if(user.getGroupsIds().size() > 0){
			groups.add(QueryBuilder.start("groupId").in(new JsonArray(user.getGroupsIds())).get());
		}
		QueryBuilder query = new QueryBuilder().or(
				QueryBuilder.start("owner.userId").is(user.getUserId()).get(),
				QueryBuilder
						.start("shared")
						.elemMatch(
								new QueryBuilder().or(
										groups.toArray(new DBObject[groups
												.size()])).get()).get());

		// Projection
		JsonObject projection = new JsonObject();
		projection.put("pages", 0).put("created", 0);

		JsonObject sort = new JsonObject().put("modified", -1);
		mongo.find(collection, MongoQueryBuilder.build(query), sort,
				projection, MongoDbResult.validResultsHandler(handler));
	}

	@Override
	public void listPages(String idWiki,
			Handler<Either<String, JsonObject>> handler) {
		QueryBuilder query = QueryBuilder.start("_id").is(idWiki);

		JsonObject projection = new JsonObject();
		projection.put("pages.content", 0).put("created", 0);

		mongo.findOne(collection, MongoQueryBuilder.build(query), projection,
				MongoDbResult.validResultHandler(handler));
	}

	@Override
	public void listAllPages(UserInfos user,
			Handler<Either<String, JsonArray>> handler) {
		// Query : return pages visible by current user only (i.e. owner or
		// shared)
		List<DBObject> groups = new ArrayList<>();
		groups.add(QueryBuilder.start("userId").is(user.getUserId()).get());
		if(user.getGroupsIds().size() > 0){
			groups.add(QueryBuilder.start("groupId").in(new JsonArray(user.getGroupsIds())).get());
		}

		QueryBuilder query = new QueryBuilder().or(
				QueryBuilder.start("owner.userId").is(user.getUserId()).get(),
				QueryBuilder
						.start("shared")
						.elemMatch(
								new QueryBuilder().or(
										groups.toArray(new DBObject[groups
												.size()])).get()).get());

		// Projection
		JsonObject projection = new JsonObject();
		projection.put("pages.content", 0).put("created", 0);

		JsonObject sort = new JsonObject().put("pages.title", 1);

		mongo.find(collection, MongoQueryBuilder.build(query), sort,
				projection, MongoDbResult.validResultsHandler(handler));
	}

	@Override
	public void createWiki(UserInfos user, String wikiTitle, String thumbnail,
	final Optional<Number> folderId,
			Handler<Either<String, JsonObject>> handler) {

		JsonObject newWiki = new JsonObject();
		newWiki.put("title", wikiTitle)
				.put("pages", new JsonArray());
		if(thumbnail!=null && !thumbnail.trim().isEmpty()){
			newWiki.put("thumbnail", thumbnail);
		}

		super.create(newWiki, user, r -> {
			if(r.isRight()) {
				// notify Explorer
				newWiki.put("version", System.currentTimeMillis());
				newWiki.put("_id", r.right().getValue().getString("_id"));
				explorerPlugin.notifyUpsert(user, newWiki, folderId)
					.onSuccess(e -> {
						// on success return 200
						handler.handle(r);
					})
					.onFailure(e -> {
						// on error return message
						handler.handle(new Either.Left<>(e.getMessage()));
					});
			}
		});
	}

	@Override
	public void updateWiki(String idWiki, String wikiTitle, String thumbnail,
			Handler<Either<String, JsonObject>> handler) {

		JsonObject data = new JsonObject();
		data.put("title", wikiTitle);
		if(thumbnail==null || thumbnail.trim().isEmpty()){
			data.put("thumbnail", "");
		}
		else {
			data.put("thumbnail", thumbnail);
		}

		super.update(idWiki, data, handler);
	}

	@Override
	public void deleteWiki(String idWiki,
			Handler<Either<String, JsonObject>> handler) {
		super.delete(idWiki, handler);
	}

	@Override
	public void getPage(String idWiki, String idPage,
			Handler<Either<String, JsonObject>> handler) {

		QueryBuilder query = QueryBuilder.start("_id").is(idWiki)
				.put("pages._id").is(idPage);

		// Projection
		JsonObject matchId = new JsonObject();
		matchId.put("_id", idPage);
		JsonObject elemMatch = new JsonObject();
		elemMatch.put("$elemMatch", matchId);

		JsonObject projection = new JsonObject();
		projection.put("pages", elemMatch).put("title", 1)
				.put("owner", 1).put("shared", 1);

		// Send query to event bus
		mongo.findOne(collection, MongoQueryBuilder.build(query), projection,
				MongoDbResult.validResultHandler(handler));
	}

	public String newObjectId() {
		return new ObjectId().toString();
	}

	@Override
	public void createPage(UserInfos user, String idWiki, String newPageId, String pageTitle,
			String pageContent, boolean isIndex,  Handler<Either<String, JsonObject>> handler) {

		QueryBuilder query = QueryBuilder.start("_id").is(idWiki);

		// Add new page to array "pages"
		JsonObject newPage = new JsonObject();
		newPage.put("_id", newPageId)
				.put("title", pageTitle)
				.put("content", pageContent)
				.put("contentPlain", StringUtils.stripHtmlTag(pageContent))
				.put("author", user.getUserId())
				.put("authorName", user.getUsername())
				.put("modified", MongoDb.now());

		MongoUpdateBuilder modifier = new MongoUpdateBuilder();
		modifier.push("pages", newPage);

		// Set new page as index
		if(isIndex) {
			modifier.set("index", newPageId);
		}

		mongo.update(collection, MongoQueryBuilder.build(query),
				modifier.build(),
				MongoDbResult.validActionResultHandler(handler));
	}

	@Override
	public void updatePage(UserInfos user, String idWiki, String idPage, String pageTitle, String pageContent,
			boolean isIndex, boolean wasIndex, Handler<Either<String, JsonObject>> handler) {

		// Query
		BasicDBObject idPageDBO = new BasicDBObject("_id", idPage);
		QueryBuilder query = QueryBuilder.start("_id").is(idWiki).put("pages")
				.elemMatch(idPageDBO);

		// Update
		MongoUpdateBuilder modifier = new MongoUpdateBuilder();
		JsonObject now = MongoDb.now();
		modifier.set("pages.$.title", pageTitle)
				.set("pages.$.content", pageContent)
				.set("pages.$.contentPlain", StringUtils.stripHtmlTag(pageContent))
				.set("pages.$.lastContributer", user.getUserId())
				.set("pages.$.lastContributerName", user.getUsername())
				.set("pages.$.modified", now)
				.set("modified", now);
		if (isIndex) { // Set updated page as index
			modifier.set("index", idPage);
		}
		else if (wasIndex) { // Unset index when the value of isIndex has changed from true to false
			modifier.unset("index");
		}

		mongo.update(collection, MongoQueryBuilder.build(query),
				modifier.build(),
				MongoDbResult.validActionResultHandler(handler));
	}

	@Override
	public void deletePage(String idWiki, String idPage,
			Handler<Either<String, JsonObject>> handler) {

		// Query
		BasicDBObject idPageDBO = new BasicDBObject("_id", idPage);
		QueryBuilder query = QueryBuilder.start("_id").is(idWiki).put("pages")
				.elemMatch(idPageDBO);

		// Update
		JsonObject idPageJO = new JsonObject();
		idPageJO.put("_id", idPage);
		MongoUpdateBuilder modifier = new MongoUpdateBuilder();
		modifier.pull("pages", idPageJO);
		modifier.set("modified", MongoDb.now());

		mongo.update(collection, MongoQueryBuilder.build(query),
				modifier.build(),
				MongoDbResult.validActionResultHandler(handler));
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	public void unsetIndex(String idWiki, String idPage,
			Handler<Either<String, JsonObject>> handler) {

		QueryBuilder query = QueryBuilder.start("_id").is(idWiki).put("index").is(idPage);

		MongoUpdateBuilder modifier = new MongoUpdateBuilder();
		modifier.unset("index");

		mongo.update(collection, MongoQueryBuilder.build(query),
				modifier.build(),
				MongoDbResult.validActionResultHandler(handler));
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	public void getDataForNotification(String idWiki, String idPage, Handler<Either<String, JsonObject>> handler) {
		QueryBuilder query = QueryBuilder.start("_id").is(idWiki);

		// Projection
		JsonObject projection = new JsonObject();
		projection.put("owner", 1)
			.put("shared", 1)
			.put("title", 1);

		if(idPage!= null && !idPage.trim().isEmpty()) {
			query.put("pages._id").is(idPage);

			JsonObject matchId = new JsonObject().put("_id", idPage);
			JsonObject elemMatch = new JsonObject().put("$elemMatch", matchId);
			projection.put("pages", elemMatch); // returns the whole page. Projection on a field (e.g. "title") of a subdocument of an array is not supported by mongo
		}

		// Send query to event bus
		mongo.findOne(collection, MongoQueryBuilder.build(query), projection,
				MongoDbResult.validResultHandler(handler));
	}

	@Override
	public void getWholeWiki(String id, Handler<Either<String, JsonObject>> handler) {
		super.retrieve(id, handler);
	}

	@Override
	public void comment(UserInfos user, String idWiki, String idPage, String newCommentId,
			String comment, Handler<Either<String, JsonObject>> handler) {

		// Query
		BasicDBObject idPageDBO = new BasicDBObject("_id", idPage);
		QueryBuilder query = QueryBuilder.start("_id").is(idWiki).put("pages")
				.elemMatch(idPageDBO);

		// Add new comment to array "comments"
		JsonObject newComment = new JsonObject();
		newComment.put("_id", newCommentId)
				.put("comment", comment)
				.put("author", user.getUserId())
				.put("authorName", user.getUsername())
				.put("created", MongoDb.now());

		MongoUpdateBuilder modifier = new MongoUpdateBuilder();
		modifier.push("pages.$.comments", newComment);

		mongo.update(collection, MongoQueryBuilder.build(query),
				modifier.build(), MongoDbResult.validActionResultHandler(handler));
	}

	@Override
	public void deleteComment(String idWiki, String idPage, String idComment,
			Handler<Either<String, JsonObject>> handler){

		// Query
		BasicDBObject idPageDBO = new BasicDBObject("_id", idPage);
		QueryBuilder query = QueryBuilder.start("_id").is(idWiki).put("pages")
				.elemMatch(idPageDBO);

		// Delete comment from array "comments"
		JsonObject commentToDelete = new JsonObject();
		commentToDelete.put("_id", idComment);

		MongoUpdateBuilder modifier = new MongoUpdateBuilder();
		modifier.pull("pages.$.comments", commentToDelete);

		mongo.update(collection, MongoQueryBuilder.build(query),
				modifier.build(), MongoDbResult.validActionResultHandler(handler));
	}

	@Override
	public void createRevision(String wikiId, String pageId, UserInfos user,
							   String pageTitle, String pageContent, Handler<Either<String, JsonObject>> handler) {
		JsonObject document = new JsonObject()
				.put("wikiId", wikiId)
				.put("pageId", pageId)
				.put("userId", user.getUserId())
				.put("username", user.getUsername())
				.put("title", pageTitle)
				.put("content", pageContent)
				.put("date", MongoDb.now());
		mongo.save(REVISIONS_COLLECTION, document, MongoDbResult.validResultHandler(handler));
	}

	@Override
	public void listRevisions(String wikiId, String pageId, Handler<Either<String, JsonArray>> handler) {
		QueryBuilder query = QueryBuilder.start("wikiId").is(wikiId).put("pageId").is(pageId);
		JsonObject sort = new JsonObject().put("date", -1);
		mongo.find(REVISIONS_COLLECTION, MongoQueryBuilder.build(query), sort, null,
				MongoDbResult.validResultsHandler(handler));
	}

	@Override
	public void deleteRevisions(String wikiId, String pageId, Handler<Either<String, JsonObject>> handler) {
		QueryBuilder query = QueryBuilder.start("wikiId").is(wikiId);
		if (pageId != null && !pageId.trim().isEmpty()) {
			query.put("pageId").is(pageId);
		}
		mongo.delete(REVISIONS_COLLECTION, MongoQueryBuilder.build(query), MongoDbResult.validResultHandler(handler));
	}

}
