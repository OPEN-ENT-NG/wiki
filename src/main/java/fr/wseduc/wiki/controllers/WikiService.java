package fr.wseduc.wiki.controllers;

import static org.entcore.common.mongodb.MongoDbResult.validActionResultHandler;

import org.bson.types.ObjectId;
import org.entcore.common.http.response.DefaultResponseHandler;
import org.entcore.common.mongodb.MongoDbResult;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;
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
import fr.wseduc.mongodb.MongoUpdateBuilder;
import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.http.Renders;
import fr.wseduc.webutils.request.RequestUtils;

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

	// TODO : créer des constantes pour les noms des champs
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

	public void createWiki(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					RequestUtils.bodyToJson(request, new Handler<JsonObject>() {
						@Override
						public void handle(JsonObject data) {
							// Get user info
							JsonObject now = MongoDb.now();
							JsonObject owner = new JsonObject().putString(
									"userId", user.getUserId()).putString(
									"displayName", user.getUsername());

							// Create an empty main page, entitled "Accueil"
							JsonObject mainPage = new JsonObject();
							mainPage.putString("_id", new ObjectId().toString())
									.putBoolean("isMain", true)
									.putString("title", "Accueil")
									.putString("content", "");
							JsonArray pages = new JsonArray();
							pages.addObject(mainPage);

							JsonObject newWiki = new JsonObject();
							// TODO : check data object
							newWiki.putString("title", data.getString("title"))
									.putObject("owner", owner)
									.putObject("created", now)
									.putObject("modified", now)
									.putArray("pages", pages);

							Handler<Either<String, JsonObject>> handler = DefaultResponseHandler
									.defaultResponseHandler(request);
							mongo.save(collection, data,
									validActionResultHandler(handler));
						}
					});
				} else {
					Renders.unauthorized(request);
				}
			}
		});
	}

	public void createPage(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					RequestUtils.bodyToJson(request, new Handler<JsonObject>() {
						@Override
						public void handle(JsonObject data) {
							String idWiki = request.params().get("idwiki");
							QueryBuilder query = QueryBuilder.start("_id").is(
									idWiki);

							// TODO : check data object
							JsonObject newPage = new JsonObject();
							newPage.putString("_id", new ObjectId().toString())
									.putString("title", data.getString("title"))
									.putString("content",
											data.getString("content"));

							MongoUpdateBuilder modifier = new MongoUpdateBuilder();
							modifier.push("pages", newPage);

							Handler<Either<String, JsonObject>> handler = DefaultResponseHandler
									.defaultResponseHandler(request);

							mongo.update(collection, MongoQueryBuilder
									.build(query), modifier.build(),
									MongoDbResult
											.validActionResultHandler(handler));
						}

					});
				} else {
					Renders.unauthorized(request);
				}
			}
		});
	}
}
