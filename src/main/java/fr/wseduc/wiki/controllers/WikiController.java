package fr.wseduc.wiki.controllers;

import static org.entcore.common.http.response.DefaultResponseHandler.arrayResponseHandler;
import static org.entcore.common.http.response.DefaultResponseHandler.defaultResponseHandler;

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
import fr.wseduc.webutils.http.BaseController;
import fr.wseduc.webutils.request.RequestUtils;
import fr.wseduc.wiki.service.WikiService;
import fr.wseduc.wiki.service.WikiServiceMongoImpl;

public class WikiController extends BaseController {

	private final WikiService wikiService;

	public WikiController(String collection) {
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
		Handler<Either<String, JsonArray>> handler = arrayResponseHandler(request);

		wikiService.listWikis(handler);
	}

	@Get("/list/:idwiki")
	@ApiDoc("List pages of a given wiki")
	@SecuredAction(value = "wiki.page.list", type = ActionType.RESOURCE)
	public void listPages(final HttpServerRequest request) {
		Handler<Either<String, JsonArray>> handler = arrayResponseHandler(request);

		String idWiki = request.params().get("idwiki");

		wikiService.listPages(idWiki, handler);
	}

	@Get("/listallpages")
	@ApiDoc("List pages of all wikis")
	@SecuredAction("wiki.list")
	public void listAllPages(final HttpServerRequest request) {
		
		// TODO : faire ce traitement côté client
		// Return an array of pages (instead of an array of wikis)
		Handler<Either<String, JsonArray>> handler = new Handler<Either<String, JsonArray>>() {
			@Override
			public void handle(Either<String, JsonArray> event) {
				if (event.isRight()) {
					JsonArray wikiArray = event.right().getValue();
					JsonArray returnedPageArray = new JsonArray();

					try {
						for (Object wiki : wikiArray) {
							JsonObject wikiJO = (JsonObject) wiki;
							String wikiId = wikiJO.getString("_id");
							String wikiTitle = wikiJO.getString("title");

							JsonArray pageArray = wikiJO.getArray("pages");
							for (Object aPage : pageArray) {
								JsonObject pageJO = (JsonObject) aPage;
								JsonObject newPage = pageJO.copy();
								newPage.putString("wiki_id", wikiId);
								newPage.putString("wiki_title", wikiTitle);
								returnedPageArray.addObject(newPage);
							}
						}

						renderJson(request, returnedPageArray);
					} catch (Exception e) {
						log.error(e.getMessage());
						JsonObject error = new JsonObject().putString("error",
								e.getMessage());
						renderJson(request, error, 500);
					}

				} else {
					JsonObject error = new JsonObject().putString("error",
							event.left().getValue());
					renderJson(request, error, 400);
				}
			}
		};

		wikiService.listAllPages(handler);
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

							wikiService.createWiki(user, wikiTitle, handler);
						}
					});
				}
			}
		});
	}

	@Put("/:idwiki")
	@ApiDoc("Update wiki by id")
	@SecuredAction(value = "wiki.update", type = ActionType.RESOURCE)
	public void updateWiki(final HttpServerRequest request) {
		RequestUtils.bodyToJson(request, new Handler<JsonObject>() {
			@Override
			public void handle(JsonObject data) {
				Handler<Either<String, JsonObject>> handler = defaultResponseHandler(request);

				String idWiki = request.params().get("idwiki");

				String wikiTitle = data.getString("title");
				if (wikiTitle == null || wikiTitle.trim().isEmpty()) {
					badRequest(request);
					return;
				}

				wikiService.updateWiki(idWiki, wikiTitle, handler);
			}
		});
	}

	@Delete("/:idwiki")
	@ApiDoc("Delete wiki by id")
	@SecuredAction(value = "wiki.delete", type = ActionType.RESOURCE)
	public void deleteWiki(final HttpServerRequest request) {
		String idWiki = request.params().get("idwiki");
		Handler<Either<String, JsonObject>> handler = defaultResponseHandler(request);

		wikiService.deleteWiki(idWiki, handler);
	}

	@Get("/:idwiki/page/:idpage")
	@ApiDoc("Get a specific page of a wiki")
	@SecuredAction(value = "wiki.page.get", type = ActionType.RESOURCE)
	public void getPage(final HttpServerRequest request) {
		String idWiki = request.params().get("idwiki");
		String idPage = request.params().get("idpage");

		Handler<Either<String, JsonObject>> handler = defaultResponseHandler(request);

		wikiService.getPage(idWiki, idPage, handler);
	}

	@Post("/:idwiki/page")
	@ApiDoc("Add page to wiki")
	@SecuredAction("wiki.page.create")
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

				String idWiki = request.params().get("idwiki");

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

	@Put("/:idwiki/page/:idpage")
	@ApiDoc("Update page by idwiki and idpage")
	@SecuredAction(value = "wiki.page.update", type = ActionType.RESOURCE)
	public void updatePage(final HttpServerRequest request) {
		RequestUtils.bodyToJson(request, new Handler<JsonObject>() {
			@Override
			public void handle(JsonObject data) {
				Handler<Either<String, JsonObject>> handler = defaultResponseHandler(request);

				String idWiki = request.params().get("idwiki");
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

	@Delete("/:idwiki/page/:idpage")
	@ApiDoc("Delete page by idwiki and idpage")
	@SecuredAction(value = "wiki.page.delete", type = ActionType.RESOURCE)
	public void deletePage(final HttpServerRequest request) {
		Handler<Either<String, JsonObject>> handler = defaultResponseHandler(request);

		String idWiki = request.params().get("idwiki");
		String idPage = request.params().get("idpage");

		wikiService.deletePage(idWiki, idPage, handler);
	}
}
