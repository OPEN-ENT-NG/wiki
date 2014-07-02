package fr.wseduc.wiki.controllers;

import org.entcore.common.http.response.DefaultResponseHandler;
import org.entcore.common.mongodb.MongoDbResult;
import org.vertx.java.core.Handler;
import org.vertx.java.core.Vertx;
import org.vertx.java.core.eventbus.EventBus;
import org.vertx.java.core.http.HttpServerRequest;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;
import org.vertx.java.platform.Container;

import com.mongodb.QueryBuilder;

import fr.wseduc.mongodb.MongoDb;
import fr.wseduc.mongodb.MongoQueryBuilder;
import fr.wseduc.webutils.Either;

public class WikiService {

	protected final String collection;

	protected EventBus eb;
	protected MongoDb mongo;

	public WikiService(final String collection) {
		this.collection = collection;
	}

	public void init(Vertx vertx, Container container) {
		this.eb = vertx.eventBus();
		this.mongo = MongoDb.getInstance();
	}

	// TODO gestion des droits

	public void listWikis(final HttpServerRequest request) {
		JsonObject projection = new JsonObject();
		projection.putNumber("title", 1).putNumber("owner", 1)
				.putNumber("modified", 1);

		JsonObject sort = new JsonObject().putNumber("modified", -1);

		Handler<Either<String, JsonArray>> handler = DefaultResponseHandler
				.arrayResponseHandler(request);

		mongo.find(collection, MongoQueryBuilder.build(new QueryBuilder()),
				sort, projection, MongoDbResult.validResultsHandler(handler));
	}

	public void getMainPage(final HttpServerRequest request) {
		// Matcher
		String id = request.params().get("idwiki");
		QueryBuilder query = QueryBuilder.start("_id").is(id);

		// Projection
		JsonObject isMainPage = new JsonObject();
		isMainPage.putBoolean("isMain", true);
		JsonObject elemMatch = new JsonObject();
		elemMatch.putObject("$elemMatch", isMainPage);
		JsonObject projection = new JsonObject();
		projection.putObject("pages", elemMatch);

		Handler<Either<String, JsonObject>> handler = DefaultResponseHandler
				.defaultResponseHandler(request);

		// Send query to event bus
		mongo.findOne(collection, MongoQueryBuilder.build(query), projection,
				MongoDbResult.validResultHandler(handler));
	}

	public void getPage(final HttpServerRequest request) {
		// Matcher
		String idWiki = request.params().get("idwiki");
		String idPage = request.params().get("idpage");
		QueryBuilder query = QueryBuilder.start("_id").is(idWiki)
				.put("pages._id").is(idPage);

		// Projection
		JsonObject matchId = new JsonObject();
		matchId.putString("_id", idPage);
		JsonObject elemMatch = new JsonObject();
		elemMatch.putObject("$elemMatch", matchId);
		JsonObject projection = new JsonObject();
		projection.putObject("pages", elemMatch);

		Handler<Either<String, JsonObject>> handler = DefaultResponseHandler
				.defaultResponseHandler(request);

		// Send query to event bus
		mongo.findOne(collection, MongoQueryBuilder.build(query), projection,
				MongoDbResult.validResultHandler(handler));
	}

}
