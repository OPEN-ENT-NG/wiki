package fr.wseduc.wiki.controllers;

import static org.entcore.common.http.response.DefaultResponseHandler.arrayResponseHandler;
import static org.entcore.common.http.response.DefaultResponseHandler.defaultResponseHandler;
import static org.entcore.common.http.response.DefaultResponseHandler.notEmptyResponseHandler;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

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

	private final static String WIKI_NAME = "WIKI";
	private static final String WIKI_PAGE_CREATED_EVENT_TYPE = WIKI_NAME + "_PAGE_CREATED";

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

	@Get("/:id/listpages")
	@ApiDoc("Get a wiki with all its pages' titles")
	@SecuredAction(value = "wiki.read", type = ActionType.RESOURCE)
	public void listPages(final HttpServerRequest request) {
		Handler<Either<String, JsonObject>> handler = notEmptyResponseHandler(request);

		String idWiki = request.params().get("id");

		wikiService.listPages(idWiki, handler);
	}

	@Get("/listallpages")
	@ApiDoc("List wikis, visible by current user, with all their pages' titles")
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

		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					RequestUtils.bodyToJson(request, new Handler<JsonObject>() {
						@Override
						public void handle(JsonObject data) {
							final String newPageId = ((WikiServiceMongoImpl) wikiService)
									.newObjectId();

							final String idWiki = request.params().get("id");
							boolean isIndex = data.getBoolean("isIndex", false);

							final String pageTitle = data.getString("title");
							String pageContent = data.getString("content");
							if (pageTitle == null || pageTitle.trim().isEmpty()
									|| pageContent == null || pageContent.trim().isEmpty()) {
								badRequest(request);
								return;
							}

							// Return attribute _id of created page in case of success
							Handler<Either<String, JsonObject>> handler = new Handler<Either<String, JsonObject>>() {
								@Override
								public void handle(Either<String, JsonObject> event) {
									if (event.isRight()) {
										JsonObject result = new JsonObject();
										result.putString("_id", newPageId);
										notifyPageCreated(request, user, idWiki, newPageId, pageTitle);
										renderJson(request, result);
									} else {
										JsonObject error = new JsonObject().putString(
												"error", event.left().getValue());
										renderJson(request, error, 400);
									}
								}
							};

							wikiService.createPage(idWiki, newPageId, pageTitle,
									pageContent, isIndex, handler);
						}
					});
				}
			}
		});

	}

	private void notifyPageCreated(final HttpServerRequest request, final UserInfos user,
			final String idWiki, final String idPage, final String pageTitle) {

		try {
			wikiService.getDataForNotification(idWiki, new Handler<Either<String,JsonObject>>() {
				@Override
				public void handle(Either<String, JsonObject> event) {
					if(event.isRight() && event.right().getValue()!=null) {
						JsonObject wiki = event.right().getValue();
						List<String> recipients = extractRecipientsFromWiki(wiki, user.getUserId());

						if(!recipients.isEmpty()){
							JsonObject params = new JsonObject();
							params.putString("uri", container.config().getString("userbook-host") +
									"/userbook/annuaire#" + user.getUserId() + "#" + user.getType());
							params.putString("username", user.getUsername())
								.putString("pageTitle", pageTitle)
								.putString("wikiTitle", wiki.getString("title"))
								.putString("pageUri", container.config().getString("host") +
									"/wiki#/view/" + idWiki + "/" + idPage);

							notification.notifyTimeline(request, user, WIKI_NAME, WIKI_PAGE_CREATED_EVENT_TYPE,
									recipients, idPage, "notify-page-created.html", params);
						}
					}
					else {
						log.error("Error in service getDataForNotification. Unable to send timeline "+ WIKI_PAGE_CREATED_EVENT_TYPE + " notification.");
					}

				}
			});
		} catch (Exception e) {
			log.error("Unable to send timeline "+ WIKI_PAGE_CREATED_EVENT_TYPE + " notification.", e);
		}

	}

	private List<String> extractRecipientsFromWiki(JsonObject wiki, String pageCreatorId){
		Set<String> recipientSet = new HashSet<>();

		String wikiOwner = wiki.getObject("owner").getString("userId");
		if(!wikiOwner.equals(pageCreatorId)) {
			recipientSet.add(wikiOwner);
		}

		for (Object element : wiki.getArray("shared")) {
			JsonObject jo = (JsonObject) element;
			String uId = jo.getString("userId", null);
			String gId = jo.getString("groupId", null);
			if(uId != null && !uId.isEmpty() && !uId.equals(pageCreatorId)) {
				recipientSet.add(uId);
			}
			else if(gId!=null && !gId.isEmpty()) {
				recipientSet.add(gId);
			}
		}

		return new ArrayList<>(recipientSet);
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
				boolean isIndex = data.getBoolean("isIndex", false);
				boolean wasIndex = data.getBoolean("wasIndex", false);

				String pageTitle = data.getString("title");
				String pageContent = data.getString("content");
				if (pageTitle == null || pageTitle.trim().isEmpty()
						|| pageContent == null || pageContent.trim().isEmpty()) {
					badRequest(request);
					return;
				}

				wikiService.updatePage(idWiki, idPage, pageTitle, pageContent,
						isIndex, wasIndex, handler);
			}
		});
	}

	@Delete("/:id/page/:idpage")
	@ApiDoc("Delete page by idwiki and idpage")
	@SecuredAction(value = "wiki.contrib", type = ActionType.RESOURCE)
	public void deletePage(final HttpServerRequest request) {
		final String idWiki = request.params().get("id");
		final String idPage = request.params().get("idpage");

		Handler<Either<String, JsonObject>> handler = new Handler<Either<String, JsonObject>>() {
			@Override
			public void handle(Either<String, JsonObject> event) {
				if (event.isRight()) {
					wikiService.unsetIndex(idWiki, idPage, notEmptyResponseHandler(request));
				} else {
					JsonObject error = new JsonObject()
							.putString("error", event.left().getValue());
					renderJson(request, error, 400);
				}
			}
		};

		wikiService.deletePage(idWiki, idPage, handler);
	}

	@Get("/share/json/:id")
	@ApiDoc("List rights for a given wikiId")
	@SecuredAction(value = "wiki.manager", type = ActionType.RESOURCE)
	public void shareWiki(final HttpServerRequest request) {
		super.shareJson(request, false);
	}

	@Put("/share/json/:id")
	@ApiDoc("Add rights for a given wikiId.")
	@SecuredAction(value = "wiki.manager", type = ActionType.RESOURCE)
	public void shareWikiSubmit(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
			        final String id = request.params().get("id");
			        if(id == null || id.trim().isEmpty()) {
			            badRequest(request);
			            return;
			        }

					JsonObject params = new JsonObject();
					params.putString("uri", container.config().getString("userbook-host") +
							"/userbook/annuaire#" + user.getUserId() + "#" + user.getType())
					.putString("username", user.getUsername())
					.putString("wikiUri", container.config().getString("host") + "/wiki#/view/" + id);

					shareJsonSubmit(request, "notify-wiki-shared.html", false, params, "title");
				}
			}
		});


	}

	@Put("/share/remove/:id")
	@ApiDoc("Remove rights for a given wikiId.")
	@SecuredAction(value = "wiki.manager", type = ActionType.RESOURCE)
	public void shareWikiRemove(final HttpServerRequest request) {
		super.removeShare(request, false);
	}

}
