package net.atos.entng.wiki.controllers;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.atomic.AtomicInteger;

import net.atos.entng.wiki.filters.OwnerAuthorOrShared;
import net.atos.entng.wiki.service.WikiService;
import net.atos.entng.wiki.service.WikiServiceMongoImpl;

import org.entcore.common.http.filter.ResourceFilter;
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

import static org.entcore.common.http.response.DefaultResponseHandler.*;

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

	@Get("/print")
	@SecuredAction("wiki.print")
	public void print(HttpServerRequest request) {
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

	@Get("/:id/whole")
	@ApiDoc("Get a wiki with all its pages. Used to print a wiki")
	@SecuredAction(value = "wiki.read", type = ActionType.RESOURCE)
	public void getWholeWiki(final HttpServerRequest request) {
		String idWiki = request.params().get("id");
		wikiService.getWholeWiki(idWiki, notEmptyResponseHandler(request));
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
		final String idWiki = request.params().get("id");

		wikiService.deleteWiki(idWiki, new Handler<Either<String, JsonObject>>() {
			@Override
			public void handle(Either<String, JsonObject> r) {
				if (r.isRight()) {
					deleteRevisions(idWiki, null);
					renderJson(request, r.right().getValue());
				} else {
					leftToResponse(request, r.left());
				}
			}
		});
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
							final String pageContent = data.getString("content");
							if (pageTitle == null || pageTitle.trim().isEmpty() || pageContent == null) {
								badRequest(request);
								return;
							}

							// Return attribute _id of created page in case of success
							Handler<Either<String, JsonObject>> handler = new Handler<Either<String, JsonObject>>() {
								@Override
								public void handle(Either<String, JsonObject> event) {
									if (event.isRight()) {
										createRevision(idWiki, newPageId, user, pageTitle, pageContent);
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

							wikiService.createPage(user, idWiki, newPageId, pageTitle,
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
						final JsonObject wiki = event.right().getValue();
						String pageCreatorId = user.getUserId();
						final Set<String> recipientSet = new HashSet<>();

						if(wiki.getArray("shared") != null) {
							String wikiOwner = wiki.getObject("owner").getString("userId");
							if(!wikiOwner.equals(pageCreatorId)) {
								recipientSet.add(wikiOwner);
							}

							final AtomicInteger remaining = new AtomicInteger(wiki.getArray("shared").size());

							for (Object element : wiki.getArray("shared")) {
								if (!(element instanceof JsonObject)) continue;
								JsonObject jo = (JsonObject) element;
								String uId = jo.getString("userId", null);
								String gId = jo.getString("groupId", null);
								if(uId != null && !uId.isEmpty()) {
									if(!uId.equals(pageCreatorId)){
										recipientSet.add(uId);
									}
									remaining.getAndDecrement();
								}
								else if(gId!=null && !gId.isEmpty()) {
									UserUtils.findUsersInProfilsGroups(gId, eb, pageCreatorId, false, new Handler<JsonArray>() {
										@Override
										public void handle(JsonArray event) {
											if (event != null) {
												for (Object o : event) {
													if (!(o instanceof JsonObject)) continue;
													JsonObject j = (JsonObject) o;
													String id = j.getString("id");
													recipientSet.add(id);
												}
											}
											if (remaining.decrementAndGet() < 1) {
												sendNotification(request, user, recipientSet, pageTitle, wiki, idWiki, idPage);
											}
										}
									});
								}
							}

							if (remaining.get() < 1) {
								sendNotification(request, user, recipientSet, pageTitle, wiki, idWiki, idPage);
							}
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

	private void sendNotification(final HttpServerRequest request, final UserInfos user, final Set<String> recipientSet,
			final String pageTitle, final JsonObject wiki, final String idWiki, final String idPage) {

		if(recipientSet!=null && !recipientSet.isEmpty()){
			List<String> recipients = new ArrayList<>(recipientSet);

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

	@Put("/:id/page/:idpage")
	@ApiDoc("Update page by idwiki and idpage")
	@SecuredAction(value = "wiki.contrib", type = ActionType.RESOURCE)
	public void updatePage(final HttpServerRequest request) {

		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					RequestUtils.bodyToJson(request, new Handler<JsonObject>() {
						@Override
						public void handle(JsonObject data) {

							final String idWiki = request.params().get("id");
							final String idPage = request.params().get("idpage");
							boolean isIndex = data.getBoolean("isIndex", false);
							boolean wasIndex = data.getBoolean("wasIndex", false);

							final String pageTitle = data.getString("title");
							final String pageContent = data.getString("content");
							if (pageTitle == null || pageTitle.trim().isEmpty()
									|| pageContent == null || pageContent.trim().isEmpty()) {
								badRequest(request);
								return;
							}

							wikiService.updatePage(user, idWiki, idPage, pageTitle, pageContent, isIndex, wasIndex,
									new Handler<Either<String, JsonObject>>() {
										@Override
										public void handle(Either<String, JsonObject> r) {
											if (r.isRight()) {
												createRevision(idWiki, idPage, user, pageTitle, pageContent);
												renderJson(request, r.right().getValue());
											} else {
												leftToResponse(request, r.left());
											}
										}
									});
						}
					});
				}
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
					deleteRevisions(idWiki, idPage);
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

	@Post("/:id/page/:idpage")
	@ApiDoc("Add comment to a page")
	@SecuredAction(value = "wiki.comment", type = ActionType.RESOURCE)
	public void comment(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					RequestUtils.bodyToJson(request, new Handler<JsonObject>() {
						@Override
						public void handle(JsonObject data) {
							final String newCommentId = ((WikiServiceMongoImpl) wikiService).newObjectId();

							String idWiki = request.params().get("id");
							String idPage = request.params().get("idpage");
							String comment = data.getString("comment", null);
							if(comment == null || comment.trim().isEmpty()) {
								badRequest(request);
								return;
							}

							// Return attribute _id of created comment in case of success
							Handler<Either<String, JsonObject>> handler = new Handler<Either<String, JsonObject>>() {
								@Override
								public void handle(Either<String, JsonObject> event) {
									if (event.isRight()) {
										JsonObject result = new JsonObject();
										result.putString("_id", newCommentId);
										renderJson(request, result);
									} else {
										JsonObject error = new JsonObject().putString(
												"error", event.left().getValue());
										renderJson(request, error, 400);
									}
								}
							};

							wikiService.comment(user, idWiki, idPage, newCommentId, comment, handler);
						}
					});
				}
			}
		});
	}

	@Delete("/:id/page/:idpage/comment/:idcomment")
	@ApiDoc("Delete a comment")
	@SecuredAction(value = "wiki.manager", type = ActionType.RESOURCE)
	@ResourceFilter(OwnerAuthorOrShared.class)
	public void deleteComment(final HttpServerRequest request) {
		final String idWiki = request.params().get("id");
		final String idPage = request.params().get("idpage");
		final String idComment = request.params().get("idcomment");

		wikiService.deleteComment(idWiki, idPage, idComment, notEmptyResponseHandler(request));
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
					if (id == null || id.trim().isEmpty()) {
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

	@Get("/revisions/:id/:idpage")
	@SecuredAction(value = "wiki.contrib", type = ActionType.RESOURCE)
	public void listRevisions(HttpServerRequest request) {
		String id = request.params().get("id");
		String pageId = request.params().get("idpage");
		if (id == null || pageId == null || id.trim().isEmpty() || pageId.trim().isEmpty()) {
			badRequest(request, "invalid.params");
			return;
		}
		wikiService.listRevisions(id, pageId, arrayResponseHandler(request));
	}

	private void createRevision(final String idWiki, final String pageId,
								UserInfos user, String pageTitle, String pageContent) {
		wikiService.createRevision(idWiki, pageId, user, pageTitle, pageContent,
				new Handler<Either<String, JsonObject>>() {
					@Override
					public void handle(Either<String, JsonObject> r) {
						if (r.isLeft()) {
							log.error("Error creating revision " + idWiki + "/" + pageId + " - " + r.left().getValue());
						}
					}
				});
	}

	private void deleteRevisions(final String idWiki, final String idPage) {
		wikiService.deleteRevisions(idWiki, idPage, new Handler<Either<String, JsonObject>>() {
			@Override
			public void handle(Either<String, JsonObject> r) {
				if (r.isLeft()) {
					log.error("Error creating revision " + idWiki + "/" + idPage + " - " + r.left().getValue());
				}
			}
		});
	}

}