package fr.wseduc.wiki.controllers;

import static org.entcore.common.http.response.DefaultResponseHandler.arrayResponseHandler;
import static org.entcore.common.http.response.DefaultResponseHandler.defaultResponseHandler;
import static org.entcore.common.http.response.DefaultResponseHandler.notEmptyResponseHandler;

import org.entcore.common.mongodb.MongoDbControllerHelper;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;
import org.vertx.java.core.Handler;
import org.vertx.java.core.http.HttpServerRequest;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;

import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Delete;
import fr.wseduc.rs.Get;
import fr.wseduc.rs.Post;
import fr.wseduc.rs.Put;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.request.RequestUtils;
import fr.wseduc.wiki.service.WikiService;
import fr.wseduc.wiki.service.WikiServiceMongoImpl;

public class WikiController extends MongoDbControllerHelper {

	private final WikiService wikiService;
	
	public WikiController(String collection) {
		super(collection);
		wikiService = new WikiServiceMongoImpl(collection);		
	}

	@Get("")
	@ApiDoc("Get HTML view")
	@SecuredAction("wiki.view")
	public void view(HttpServerRequest request) {
		renderView(request);
	}

	@Get("/list")
	@ApiDoc("List wikis")
	@SecuredAction("wiki.list")
	public void listWikis(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					Handler<Either<String, JsonArray>> handler = arrayResponseHandler(request);

					wikiService.listWikis(user, handler);
				}
			}
		});
	}

	@Get("/list/:id")
	@ApiDoc("List pages for a given wikiId")
	@SecuredAction(value = "wiki.read", type = ActionType.RESOURCE)
	public void listPages(final HttpServerRequest request) {
		Handler<Either<String, JsonArray>> handler = arrayResponseHandler(request);

		String idWiki = request.params().get("id");

		wikiService.listPages(idWiki, handler);
	}
	
	@Get("/listallpages")
	@ApiDoc("List pages of all wikis, visible by current user")
	@SecuredAction("wiki.list")
	public void listAllPages(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					Handler<Either<String, JsonArray>> handler = arrayResponseHandler(request);

					wikiService.listAllPages(user, handler);
				}
			}
		});
	}

	@Post("")
	@ApiDoc("Create wiki")
	@SecuredAction("wiki.create")
	public void createWiki(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					RequestUtils.bodyToJson(request, new Handler<JsonObject>() {
						@Override
						public void handle(JsonObject data) {
							Handler<Either<String, JsonObject>> handler = defaultResponseHandler(request);

							String wikiTitle = data.getString("title");
							if (wikiTitle == null || wikiTitle.trim().isEmpty()) {
								badRequest(request);
								return;
							}
							String thumbnail = data.getString("thumbnail");

							wikiService.createWiki(user, wikiTitle, thumbnail, handler);
						}
					});
				}
			}
		});
	}

	@Put("/:id")
	@ApiDoc("Update wiki by id")
	@SecuredAction(value = "wiki.manager", type = ActionType.RESOURCE)
	public void updateWiki(final HttpServerRequest request) {
		RequestUtils.bodyToJson(request, new Handler<JsonObject>() {
			@Override
			public void handle(JsonObject data) {
				Handler<Either<String, JsonObject>> handler = defaultResponseHandler(request);

				String idWiki = request.params().get("id");

				String wikiTitle = data.getString("title");
				if (wikiTitle == null || wikiTitle.trim().isEmpty()) {
					badRequest(request);
					return;
				}
				String thumbnail = data.getString("thumbnail");

				wikiService.updateWiki(idWiki, wikiTitle, thumbnail, handler);
			}
		});
	}

	@Delete("/:id")
	@ApiDoc("Delete wiki by id")
	@SecuredAction(value = "wiki.manager", type = ActionType.RESOURCE)
	public void deleteWiki(final HttpServerRequest request) {
		String idWiki = request.params().get("id");
		Handler<Either<String, JsonObject>> handler = defaultResponseHandler(request);

		wikiService.deleteWiki(idWiki, handler);
	}

	@Get("/:id/page/:idpage")
	@ApiDoc("Get a specific page of a wiki")
	@SecuredAction(value = "wiki.read", type = ActionType.RESOURCE)
	public void getPage(final HttpServerRequest request) {
		String idWiki = request.params().get("id");
		String idPage = request.params().get("idpage");

		Handler<Either<String, JsonObject>> handler = notEmptyResponseHandler(request);

		wikiService.getPage(idWiki, idPage, handler);
	}

	@Post("/:id/page")
	@ApiDoc("Add page to wiki")
	@SecuredAction(value = "wiki.contrib", type = ActionType.RESOURCE)
	public void createPage(final HttpServerRequest request) {
		RequestUtils.bodyToJson(request, new Handler<JsonObject>() {
			@Override
			public void handle(JsonObject data) {
				final String newPageId = ((WikiServiceMongoImpl) wikiService)
						.newObjectId();

				// Return attribute _id of created page in case of success
				Handler<Either<String, JsonObject>> handler = new Handler<Either<String, JsonObject>>() {
					@Override
					public void handle(Either<String, JsonObject> event) {
						if (event.isRight()) {
							JsonObject result = new JsonObject();
							result.putString("_id", newPageId);
							renderJson(request, result);
						} else {
							JsonObject error = new JsonObject().putString(
									"error", event.left().getValue());
							renderJson(request, error, 400);
						}
					}
				};

				String idWiki = request.params().get("id");

				String pageTitle = data.getString("title");
				String pageContent = data.getString("content");
				if (pageTitle == null || pageTitle.trim().isEmpty()
						|| pageContent == null || pageContent.trim().isEmpty()) {
					badRequest(request);
					return;
				}

				wikiService.createPage(idWiki, newPageId, pageTitle,
						pageContent, handler);
			}
		});

	}

	@Put("/:id/page/:idpage")
	@ApiDoc("Update page by idwiki and idpage")
	@SecuredAction(value = "wiki.contrib", type = ActionType.RESOURCE)
	public void updatePage(final HttpServerRequest request) {
		RequestUtils.bodyToJson(request, new Handler<JsonObject>() {
			@Override
			public void handle(JsonObject data) {
				Handler<Either<String, JsonObject>> handler = defaultResponseHandler(request);

				String idWiki = request.params().get("id");
				String idPage = request.params().get("idpage");

				String pageTitle = data.getString("title");
				String pageContent = data.getString("content");
				if (pageTitle == null || pageTitle.trim().isEmpty()
						|| pageContent == null || pageContent.trim().isEmpty()) {
					badRequest(request);
					return;
				}

				wikiService.updatePage(idWiki, idPage, pageTitle, pageContent,
						handler);
			}
		});
	}

	@Delete("/:id/page/:idpage")
	@ApiDoc("Delete page by idwiki and idpage")
	@SecuredAction(value = "wiki.contrib", type = ActionType.RESOURCE)
	public void deletePage(final HttpServerRequest request) {
		Handler<Either<String, JsonObject>> handler = defaultResponseHandler(request);

		String idWiki = request.params().get("id");
		String idPage = request.params().get("idpage");

		wikiService.deletePage(idWiki, idPage, handler);
	}
		
	@Get("/share/json/:id")
	@ApiDoc("List rights for a given wikiId")
	@SecuredAction(value = "wiki.manager", type = ActionType.RESOURCE)
	public void shareWiki(final HttpServerRequest request) {
		super.shareJson(request);
	}
	
	@Put("/share/json/:id")
	@ApiDoc("Add rights for a given wikiId.")
	@SecuredAction(value = "wiki.manager", type = ActionType.RESOURCE)
	public void shareWikiSubmit(final HttpServerRequest request) {
		super.shareJsonSubmit(request, null);
	}
	
	@Put("/share/remove/:id")
	@ApiDoc("Remove rights for a given wikiId.")
	@SecuredAction(value = "wiki.manager", type = ActionType.RESOURCE)
	public void shareWikiRemove(final HttpServerRequest request) {
		super.removeShare(request);
	}
}
