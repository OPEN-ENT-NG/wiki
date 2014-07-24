package fr.wseduc.wiki.service;

import java.util.ArrayList;
import java.util.List;

import org.bson.types.ObjectId;
import org.entcore.common.mongodb.MongoDbResult;
import org.entcore.common.service.impl.MongoDbCrudService;
import org.entcore.common.user.UserInfos;
import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;

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

	public WikiServiceMongoImpl(final String collection) {
		super(collection);
		this.collection = collection;
		this.mongo = MongoDb.getInstance();
	}

	// TODO : créer des constantes pour les noms des champs

	@Override
	public void listWikis(UserInfos user,
			Handler<Either<String, JsonArray>> handler) {
		// Query : return wikis visible by current user only (i.e. owner or
		// shared)
		List<DBObject> groups = new ArrayList<>();
		groups.add(QueryBuilder.start("userId").is(user.getUserId()).get());
		for (String gpId : user.getProfilGroupsIds()) {
			groups.add(QueryBuilder.start("groupId").is(gpId).get());
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
		projection.putNumber("pages", 0).putNumber("created", 0);

		JsonObject sort = new JsonObject().putNumber("modified", -1);

		mongo.find(collection, MongoQueryBuilder.build(query), sort,
				projection, MongoDbResult.validResultsHandler(handler));
	}

	@Override
	public void listPages(String idWiki,
			Handler<Either<String, JsonObject>> handler) {
		QueryBuilder query = QueryBuilder.start("_id").is(idWiki);

		JsonObject projection = new JsonObject();
		projection.putNumber("pages.content", 0).putNumber("created", 0);

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
		for (String gpId : user.getProfilGroupsIds()) {
			groups.add(QueryBuilder.start("groupId").is(gpId).get());
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
		projection.putNumber("pages.content", 0).putNumber("created", 0);

		JsonObject sort = new JsonObject().putNumber("pages.title", 1);

		mongo.find(collection, MongoQueryBuilder.build(query), sort,
				projection, MongoDbResult.validResultsHandler(handler));
	}

	@Override
	public void createWiki(UserInfos user, String wikiTitle, String thumbnail,
			Handler<Either<String, JsonObject>> handler) {
		
		JsonObject newWiki = new JsonObject();
		newWiki.putString("title", wikiTitle)
				.putArray("pages", new JsonArray());		
		if(thumbnail!=null && !thumbnail.trim().isEmpty()){
			newWiki.putString("thumbnail", thumbnail);
		}

		super.create(newWiki, user, handler);
	}

	@Override
	public void updateWiki(String idWiki, String wikiTitle, String thumbnail,
			Handler<Either<String, JsonObject>> handler) {

		JsonObject data = new JsonObject();
		data.putString("title", wikiTitle);
		if(thumbnail==null || thumbnail.trim().isEmpty()){
			data.putString("thumbnail", "");
		}
		else {
			data.putString("thumbnail", thumbnail);
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
		matchId.putString("_id", idPage);
		JsonObject elemMatch = new JsonObject();
		elemMatch.putObject("$elemMatch", matchId);
		JsonObject projection = new JsonObject();
		projection.putObject("pages", elemMatch).putNumber("title", 1)
				.putNumber("owner", 1).putNumber("shared", 1);

		// Send query to event bus
		mongo.findOne(collection, MongoQueryBuilder.build(query), projection,
				MongoDbResult.validResultHandler(handler));
	}

	public String newObjectId() {
		return new ObjectId().toString();
	}

	@Override
	public void createPage(String idWiki, String newPageId, String pageTitle,
			String pageContent, Handler<Either<String, JsonObject>> handler) {

		QueryBuilder query = QueryBuilder.start("_id").is(idWiki);

		JsonObject newPage = new JsonObject();
		newPage.putString("_id", newPageId).putString("title", pageTitle)
				.putString("content", pageContent);

		MongoUpdateBuilder modifier = new MongoUpdateBuilder();
		modifier.push("pages", newPage);

		mongo.update(collection, MongoQueryBuilder.build(query),
				modifier.build(),
				MongoDbResult.validActionResultHandler(handler));
	}

	@Override
	public void updatePage(String idWiki, String idPage, String pageTitle,
			String pageContent, Handler<Either<String, JsonObject>> handler) {

		// Query
		BasicDBObject idPageDBO = new BasicDBObject("_id", idPage);
		QueryBuilder query = QueryBuilder.start("_id").is(idWiki).put("pages")
				.elemMatch(idPageDBO);

		// Update
		MongoUpdateBuilder modifier = new MongoUpdateBuilder();
		modifier.set("pages.$.title", pageTitle)
				.set("pages.$.content", pageContent)
				.set("modified", MongoDb.now());

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
		idPageJO.putString("_id", idPage);
		MongoUpdateBuilder modifier = new MongoUpdateBuilder();
		modifier.pull("pages", idPageJO);
		modifier.set("modified", MongoDb.now());

		mongo.update(collection, MongoQueryBuilder.build(query),
				modifier.build(),
				MongoDbResult.validActionResultHandler(handler));
	}

}
