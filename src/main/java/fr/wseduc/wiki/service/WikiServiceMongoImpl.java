package fr.wseduc.wiki.service;

import static org.entcore.common.mongodb.MongoDbResult.validActionResultHandler;

import org.bson.types.ObjectId;
import org.entcore.common.mongodb.MongoDbResult;
import org.entcore.common.user.UserInfos;
import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;

import com.mongodb.BasicDBObject;
import com.mongodb.QueryBuilder;

import fr.wseduc.mongodb.MongoDb;
import fr.wseduc.mongodb.MongoQueryBuilder;
import fr.wseduc.mongodb.MongoUpdateBuilder;
import fr.wseduc.webutils.Either;

public class WikiServiceMongoImpl implements WikiService {

	protected final String collection;
	protected MongoDb mongo;

	public WikiServiceMongoImpl(final String collection) {
		this.collection = collection;
		this.mongo = MongoDb.getInstance();
	}

	// TODO : hériter de MongoDbCrudService pour économiser du code
	// TODO : créer des constantes pour les noms des champs

	@Override
	public void listWikis(Handler<Either<String, JsonArray>> handler) {
		JsonObject projection = new JsonObject();
		projection.putNumber("title", 1).putNumber("owner", 1)
				.putNumber("modified", 1);

		JsonObject sort = new JsonObject().putNumber("modified", -1);

		mongo.find(collection, MongoQueryBuilder.build(new QueryBuilder()),
				sort, projection, MongoDbResult.validResultsHandler(handler));
	}

	@Override
	public void listPages(String idWiki,
			Handler<Either<String, JsonArray>> handler) {
		QueryBuilder query = QueryBuilder.start("_id").is(idWiki);

		JsonObject projection = new JsonObject();
		projection.putNumber("title", 1).putNumber("pages._id", 1)
				.putNumber("pages.title", 1);

		JsonObject sort = new JsonObject().putNumber("pages.title", 1);

		mongo.find(collection, MongoQueryBuilder.build(query), sort,
				projection, MongoDbResult.validResultsHandler(handler));
	}

	@Override
	public void listAllPages(Handler<Either<String, JsonArray>> handler) {
		QueryBuilder query = new QueryBuilder();

		JsonObject projection = new JsonObject();
		projection.putNumber("title", 1).putNumber("pages._id", 1)
				.putNumber("pages.title", 1).putNumber("owner", 1);

		JsonObject sort = new JsonObject().putNumber("pages.title", 1);

		mongo.find(collection, MongoQueryBuilder.build(query), sort,
				projection, MongoDbResult.validResultsHandler(handler));
	}

	@Override
	public void createWiki(UserInfos user, String wikiTitle,
			Handler<Either<String, JsonObject>> handler) {
		JsonObject now = MongoDb.now();
		JsonObject owner = new JsonObject().putString("userId",
				user.getUserId()).putString("displayName", user.getUsername());

		JsonArray pages = new JsonArray();

		JsonObject newWiki = new JsonObject();

		newWiki.putString("title", wikiTitle).putObject("owner", owner)
				.putObject("created", now).putObject("modified", now)
				.putArray("pages", pages);

		mongo.save(collection, newWiki, validActionResultHandler(handler));
	}

	@Override
	public void updateWiki(String idWiki, String wikiTitle,
			Handler<Either<String, JsonObject>> handler) {

		QueryBuilder query = QueryBuilder.start("_id").is(idWiki);

		MongoUpdateBuilder modifier = new MongoUpdateBuilder();
		modifier.set("title", wikiTitle);
		modifier.set("modified", MongoDb.now());

		mongo.update(collection, MongoQueryBuilder.build(query),
				modifier.build(),
				MongoDbResult.validActionResultHandler(handler));
	}

	@Override
	public void deleteWiki(String idWiki,
			Handler<Either<String, JsonObject>> handler) {

		QueryBuilder query = QueryBuilder.start("_id").is(idWiki);
		mongo.delete(collection, MongoQueryBuilder.build(query),
				MongoDbResult.validActionResultHandler(handler));
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
		projection.putObject("pages", elemMatch).putNumber("title", 1);

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

		mongo.update(collection, MongoQueryBuilder.build(query),
				modifier.build(),
				MongoDbResult.validActionResultHandler(handler));
	}

}
