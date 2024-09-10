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

package net.atos.entng.wiki.controllers;

import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Function;

import fr.wseduc.webutils.I18n;
import net.atos.entng.wiki.Wiki;
import net.atos.entng.wiki.config.WikiConfig;
import net.atos.entng.wiki.explorer.WikiExplorerPlugin;
import net.atos.entng.wiki.filters.OwnerAuthorOrShared;
import net.atos.entng.wiki.filters.OwnerAuthorOrSharedPage;
import net.atos.entng.wiki.service.WikiService;

import org.bson.types.ObjectId;
import org.entcore.common.events.EventHelper;
import org.entcore.common.events.EventStore;
import org.entcore.common.events.EventStoreFactory;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.http.response.DefaultResponseHandler;
import org.entcore.common.mongodb.MongoDbControllerHelper;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;
import io.vertx.core.Handler;
import io.vertx.core.Vertx;
import io.vertx.core.http.HttpServerRequest;
import org.vertx.java.core.http.RouteMatcher;

import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;


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
	static final String PAGE_RESOURCE_NAME = "wiki_page";
	static final String WIKI_RESOURCE_NAME = "wiki";

	private final WikiService wikiService;

	private static final String WIKI_NAME = "WIKI";
	private static final String WIKI_PAGE_CREATED_EVENT_TYPE = WIKI_NAME + "_PAGE_CREATED";
	private static final String WIKI_COMMENT_CREATED_EVENT_TYPE = WIKI_NAME + "_COMMENT_CREATED";
	private static final int OVERVIEW_LENGTH = 50;

	private final EventHelper eventHelper;

	private final WikiConfig wikiConfig;

	private final WikiExplorerPlugin explorerPlugin;

	@Override
	public void init(Vertx vertx, JsonObject config, RouteMatcher rm,
			Map<String, fr.wseduc.webutils.security.SecuredAction> securedActions) {
		super.init(vertx, config, rm, securedActions);
		final Map<String, List<String>> groupedActions = new HashMap<>();
		this.shareService = this.explorerPlugin.createShareService(groupedActions);
	}

	public WikiController(String collection, WikiConfig wikiConfig, WikiExplorerPlugin plugin, WikiService wikiService) {
		super(collection);
		this.explorerPlugin = plugin;
		this.wikiService = wikiService;
		this.wikiConfig = wikiConfig;
		final EventStore eventStore = EventStoreFactory.getFactory().getEventStore(Wiki.class.getSimpleName());
		this.eventHelper = new EventHelper(eventStore);
	}

	@Override
	protected boolean shouldNormalizedRights() {
		return true;
	}

	@Override
	protected Function<JsonObject, Optional<String>> jsonToOwnerId() {
		return json -> {
			return this.explorerPlugin.getCreatorForModel(json).map(user -> user.getUserId());
		};
	}

	@Get("")
	@ApiDoc("Get HTML view")
	@SecuredAction("wiki.view")
	public void view(HttpServerRequest request) {
		renderView(request, new JsonObject(), "index.html", null);

		// Create event "access to application Wiki" and store it, for module "statistics"
		eventHelper.onAccess(request);
	}

	/**
     * Display react front view /id/:id
     * @param request
     */
    @Get("/id/:id")
    @SecuredAction(value = "", type = ActionType.AUTHENTICATED)
    public void viewById(HttpServerRequest request) {
        renderView(request, new JsonObject(), "index.html", null);
    }

	/**
	 * Display react front view /id/:id/page/:pageId
	 * @param request
	 */
	@Get("/id/:id/page/:pageId")
	@SecuredAction(value = "", type = ActionType.AUTHENTICATED)
	public void viewPageById(HttpServerRequest request) {
		renderView(request, new JsonObject(), "index.html", null);
	}

	/**
	 * Display react front view /id/:id/page/create
	 * @param request
	 */
	@Get("/id/:id/page/create")
	@SecuredAction(value = "", type = ActionType.AUTHENTICATED)
	public void viewCreatePage(HttpServerRequest request) {
		renderView(request, new JsonObject(), "index.html", null);
	}

	/**
	 * Display react front view /id/:id/page/:pageId/edit
	 * @param request
	 */
	@Get("/id/:id/page/:pageId/edit")
	@SecuredAction(value = "", type = ActionType.AUTHENTICATED)
	public void viewEditPage(HttpServerRequest request) {
		renderView(request, new JsonObject(), "index.html", null);
	}

	/**
     * Display react front print /print/id/:id
     * @param request
     */
    @Get("/print/id/:id")
    @SecuredAction(value = "", type = ActionType.AUTHENTICATED)
    public void viewPrintById(HttpServerRequest request) {
        renderView(request, new JsonObject(), "index.html", null);
    }

	@Get("/:id")
	@ApiDoc("Get a wiki")
	@SecuredAction(value = "wiki.read", type = ActionType.RESOURCE)
	public void getWiki(final HttpServerRequest request) {
		wikiService.getWiki(request.params().get("id"), notEmptyResponseHandler(request));
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
					wikiService.getWikis(user, handler);
				}
			}
		});
	}

	@Get("/:id/pages")
	@ApiDoc("Get pages from wiki with id ':id'")
	@SecuredAction(value = "wiki.read", type = ActionType.RESOURCE)
	public void listPages(final HttpServerRequest request) {
		Handler<Either<String, JsonObject>> handler = notEmptyResponseHandler(request);
		String idWiki = request.params().get("id");
		String getContent = request.params().get("content");
		wikiService.getPages(idWiki, getContent, handler);
	}

	// TODO: add a print param to true in GET /wiki/:id to get all information to print a wiki?
	/*@Get("/:id/whole")
	@ApiDoc("Get a wiki with all its pages. Used to print a wiki")
	@SecuredAction(value = "wiki.read", type = ActionType.RESOURCE)
	public void getWholeWiki(final HttpServerRequest request) {
		String idWiki = request.params().get("id");
		wikiService.getWholeWiki(idWiki, notEmptyResponseHandler(request));
	}*/

	@Post("")
	@ApiDoc("Create wiki")
	@SecuredAction("wiki.create")
	public void createWiki(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, user -> {
			if (user != null) {
				RequestUtils.bodyToJson(request, wiki -> {
					// get data from request body
					final String wikiTitle = wiki.getString("title");
					if (wikiTitle == null || wikiTitle.trim().isEmpty()) {
						badRequest(request);
						return;
					}
					final String thumbnail = wiki.getString("thumbnail");
					final String description = wiki.getString("description");
					final Optional<Number> folderId = Optional.ofNullable(wiki.getNumber("folder"));
					
					// create Wiki
					final Handler<Either<String, JsonObject>> handler = DefaultResponseHandler.notEmptyResponseHandler(request);
					wikiService.createWiki(user, wikiTitle, thumbnail, description, folderId, (r) -> {
						if (r.isLeft()) {
							// if fail return error
                            handler.handle(new Either.Left<>(r.left().getValue()));
						} else {
							// notify Creation Event
							eventHelper.onCreateResource(request, WIKI_RESOURCE_NAME);
							handler.handle(r);
						}
					});
				});
			} else {
				unauthorized(request);
			}
		});
	}

	@Put("/:id")
	@ApiDoc("Update wiki by id")
	@SecuredAction(value = "wiki.manager", type = ActionType.RESOURCE)
	public void updateWiki(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, user -> {
			if (user != null) {
				RequestUtils.bodyToJson(request, wiki -> {
					// get data from request body
					final String idWiki = request.params().get("id");
					final String wikiTitle = wiki.getString("title");
					final String description = wiki.getString("description");
					if (wikiTitle == null || wikiTitle.trim().isEmpty()) {
						badRequest(request);
						return;
					}
					String thumbnail = wiki.getString("thumbnail");
					
					Handler<Either<String, JsonObject>> handler = defaultResponseHandler(request);
					wikiService.updateWiki(user, idWiki, wikiTitle, thumbnail, description, r -> {
						if (r.isLeft()) {
							// if fail return error
							handler.handle(new Either.Left<>(r.left().getValue()));
						} else {
							handler.handle(r);
						}
					});
				});
			} else {
				unauthorized(request);
			}
		});
	}

	@Delete("/:id")
	@ApiDoc("Delete wiki by id")
	@SecuredAction(value = "wiki.manager", type = ActionType.RESOURCE)
	public void deleteWiki(final HttpServerRequest request) {
		final String idWiki = request.params().get("id");

		// get user
		UserUtils.getUserInfos(eb, request, user ->	{
			if (user != null) {
				// delete wiki
				final Handler<Either<String, JsonObject>> handler = DefaultResponseHandler.notEmptyResponseHandler(request);
				wikiService.deleteWiki(user, idWiki, r -> {
					if (r.isRight()) {
						deleteRevisions(idWiki, null);
						renderJson(request, r.right().getValue());
					} else {
						leftToResponse(request, r.left());
					}
				});
			} else {
				unauthorized(request);
			}
		});
	}

	@Get("/:id/page/:idpage")
	@ApiDoc("Get a specific page of a wiki")
	@SecuredAction(value = "wiki.read", type = ActionType.RESOURCE)
	public void getPage(final HttpServerRequest request) {
		final String idWiki = request.params().get("id");
		final String idPage = request.params().get("idpage");

		wikiService.getPage(idWiki, idPage, request, notEmptyResponseHandler(request));
	}

	@Post("/:id/page")
	@ApiDoc("Add page to wiki")
	@SecuredAction(value = "wiki.contrib", type = ActionType.RESOURCE)
	public void createPage(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, user -> {
			if (user != null) {
				RequestUtils.bodyToJson(request, pathPrefix + "page", page -> {
					final String wikiId = request.params().get("id");
					page.put("_id", new ObjectId().toString());

					// Create Page
					wikiService.createPage(user, wikiId, page, request, event -> {
								if (event.isRight()) {
									// create version of a page
									createRevision(wikiId,
											page.getString("_id"),
											user,
											page.getString("title"),
											page.getString("content"),
											page.getBoolean("isVisible"));
									notifyPageCreated(request, user, wikiId, page.getString("_id"), page.getString("title"));
									eventHelper.onCreateResource(request, PAGE_RESOURCE_NAME);
									// render created page json information
									renderJson(request, page);
								} else {
									renderJson(request
											, new JsonObject().put("error", event.left().getValue())
											, 400);
								}
							});
				});
			} else {
				unauthorized(request);
			}
		});

	}

	@Put("/:id/page/:idpage")
	@ApiDoc("Update page by idwiki and idpage")
	@SecuredAction(value = "wiki.contrib", type = ActionType.RESOURCE)
	public void updatePage(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, user -> {
			if (user != null) {
				RequestUtils.bodyToJson(request, pathPrefix + "page", page -> {
					final String idWiki = request.params().get("id");
					page.put("_id", request.params().get("idpage"));

					wikiService.updatePage(user, idWiki, page, request, updatePageResult -> {
						if (updatePageResult.isRight()) {
							renderJson(request, updatePageResult.right().getValue());
						} else {
							renderJson(request
									, new JsonObject().put("error", updatePageResult.left().getValue())
									, 400);
						}
					});
				});
			} else {
				unauthorized(request);
			}
		});

	}

	@Delete("/:id/page/:idpage")
	@ApiDoc("Delete page by idwiki and idpage")
	@SecuredAction(value = "wiki.manager", type = ActionType.RESOURCE)
	@ResourceFilter(OwnerAuthorOrSharedPage.class)
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
							.put("error", event.left().getValue());
					renderJson(request, error, 400);
				}
			}
		};

		wikiService.deletePage(idWiki, idPage, handler);
	}

	@Post("/:id/page/:idpage/comment")
	@ApiDoc("Add comment to a page")
	@SecuredAction(value = "wiki.comment", type = ActionType.RESOURCE)
	public void comment(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, user -> {
			if (user != null) {
				RequestUtils.bodyToJson(request, body -> {
					final String newCommentId = new ObjectId().toString();

					final String idWiki = request.params().get("id");
					final String idPage = request.params().get("idpage");
					final String comment = body.getString("comment", null);
					if (comment == null || comment.trim().isEmpty()) {
						badRequest(request);
						return;
					}

					wikiService.addComment(user, idWiki, idPage, newCommentId, comment, res -> {
						// Return attribute _id of created comment in case of success
						if (res.isRight()) {
							JsonObject result = new JsonObject();
							result.put("_id", newCommentId);
							notifyCommentCreated(request, user, idWiki, idPage, newCommentId, comment);
							renderJson(request, result);
						} else {
							JsonObject error = new JsonObject().put(
									"error", res.left().getValue());
							renderJson(request, error, 400);
						}
					});
				});
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

	@Get("/library")
	@SecuredAction("wiki.publish")
	public void publish(final HttpServerRequest request) {
		// This route is used to create publish Workflow right, nothing to do
		return;
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
					params.put("uri", "/userbook/annuaire#" + user.getUserId() + "#" + user.getType())
							.put("username", user.getUsername())
							.put("wikiUri", "/wiki#/view/" + id);
					params.put("resourceUri", params.getString("wikiUri"));

					JsonObject pushNotif = new JsonObject()
                            .put("title", "wiki.push.notif.shared.title")
                            .put("body", I18n.getInstance()
                                    .translate(
                                            "wiki.push.notif.shared.body",
                                            getHost(request),
                                            I18n.acceptLanguage(request),
                                            user.getUsername()
                                    ));
					params.put("pushNotif", pushNotif);

					shareJsonSubmit(request, "wiki.shared", false, params, "title");
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

	@Put("/share/resource/:id")
	@ApiDoc("Add rights for a given wikiId.")
	@SecuredAction(value = "wiki.manager", type = ActionType.RESOURCE)
	public void shareResource(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					final String id = request.params().get("id");
					if(id == null || id.trim().isEmpty()) {
						badRequest(request, "invalid.id");
						return;
					}

					JsonObject params = new JsonObject();
					params.put("uri", "/userbook/annuaire#" + user.getUserId() + "#" + user.getType())
							.put("username", user.getUsername())
							.put("wikiUri", "/wiki#/view/" + id);
					params.put("resourceUri", params.getString("wikiUri"));

					shareResource(request, "wiki.shared", false, params, "title");
				}
			}
		});
	}

	private void createRevision(final String idWiki, final String pageId,
								UserInfos user, String pageTitle, String pageContent, boolean isVisible) {
		wikiService.createRevision(idWiki, pageId, user, pageTitle, pageContent, isVisible,
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

	private void notifyPageCreated(final HttpServerRequest request, final UserInfos user,
								   final String idWiki, final String idPage, final String pageTitle) {
		this.notify(request, user, idWiki, idPage, true, pageTitle, null, null);
	}

	private void notifyCommentCreated(final HttpServerRequest request, final UserInfos user,
									  final String idWiki, final String idPage, final String idComment, final String comment) {
		this.notify(request, user, idWiki, idPage, false, null, idComment, comment);
	}

	/*
	 * If "isCreatePage" is true, notify that a page has been created.
	 * Else, notify that a comment has been added.
	 */
	private void notify(final HttpServerRequest request, final UserInfos user,
						final String idWiki, final String idPage, final boolean isCreatePage,
						final String pageTitle, final String idComment, final String comment) {

		final String eventType = isCreatePage ? WIKI_PAGE_CREATED_EVENT_TYPE : WIKI_COMMENT_CREATED_EVENT_TYPE;
		final String idResource = isCreatePage ? idPage : idComment;
		final String optionalPageId = isCreatePage ? null : idPage;

		wikiService.getDataForNotification(idWiki, optionalPageId, new Handler<Either<String,JsonObject>>() {
			@Override
			public void handle(Either<String, JsonObject> event) {

				try {
					if(event.isRight() && event.right().getValue()!=null) {
						final JsonObject wiki = event.right().getValue();
						String contentCreatorId = user.getUserId(); // author of page or comment. Will not receive a notification
						final Set<String> recipientSet = new HashSet<>();

						if(wiki.getJsonArray("shared") != null) {
							String wikiOwner = wiki.getJsonObject("owner").getString("userId");
							if(!wikiOwner.equals(contentCreatorId)) {
								recipientSet.add(wikiOwner);
							}

							final String title;
							if(isCreatePage) {
								title = pageTitle;
							}
							else {
								JsonArray pages = wiki.getJsonArray("pages");
								JsonObject page = pages.getJsonObject(0);
								title = page.getString("title");
							}

							final AtomicInteger remaining = new AtomicInteger(wiki.getJsonArray("shared").size());

							// Get userIds and members of groups, and add them to recipients
							for (Object element : wiki.getJsonArray("shared")) {
								if (!(element instanceof JsonObject)) continue;
								JsonObject jo = (JsonObject) element;
								// Send notifications for comments to owner and gestionnaire share only
								if(!isCreatePage && !jo.getBoolean("net-atos-entng-wiki-controllers-WikiController|updateWiki", false)) continue;
								String uId = jo.getString("userId", null);
								String gId = jo.getString("groupId", null);
								if(uId != null && !uId.isEmpty()) {
									if(!uId.equals(contentCreatorId)){
										recipientSet.add(uId);
									}
									remaining.getAndDecrement();
								}
								else if(gId!=null && !gId.isEmpty()) {
									UserUtils.findUsersInProfilsGroups(gId, eb, contentCreatorId, false, new Handler<JsonArray>() {
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
												sendNotification(request, user, recipientSet, title, wiki,
														idWiki, idPage, isCreatePage, idResource, comment);
											}
										}
									});
								}
							}

							if (remaining.get() < 1) {
								sendNotification(request, user, recipientSet, title, wiki,
										idWiki, idPage, isCreatePage, idResource, comment);
							}
						}
					}
					else {
						log.error("Error in service getDataForNotification. Unable to send timeline "+ eventType + " notification.");
					}
				} catch (Exception e) {
					log.error("Error when parsing response from service getDataForNotification. Unable to send timeline "+ eventType + " notification.", e);
				}
			}
		});
	}

	private void sendNotification(final HttpServerRequest request, final UserInfos user, final Set<String> recipientSet,
								  final String pageTitle, final JsonObject wiki, final String idWiki, final String idPage,
								  final boolean isCreatePage, final String idResource, String comment) {

		if(recipientSet!=null && !recipientSet.isEmpty()){
			List<String> recipients = new ArrayList<>(recipientSet);

			JsonObject params = new JsonObject();
			params.put("uri", "/userbook/annuaire#" + user.getUserId() + "#" + user.getType());
			params.put("username", user.getUsername())
					.put("pageTitle", pageTitle)
					.put("wikiTitle", wiki.getString("title"))
					.put("pageUri", "/wiki#/view/" + idWiki + "/" + idPage);
			params.put("resourceUri", params.getString("pageUri"));

			if(!isCreatePage && comment!=null && !comment.isEmpty()) {
				if(comment.length() > OVERVIEW_LENGTH) {
					comment = comment.substring(0, OVERVIEW_LENGTH) + " [...]";
				}
				params.put("overview", comment);
			}

			String notificationName = isCreatePage ? "page-created" : "comment-added";
			String pushNotifTitle = isCreatePage ? "wiki.push.notif.page-created" : "wiki.push.notif.comment-added";
			String pushNotifBody = isCreatePage
					? I18n.getInstance().translate("wiki.push.notif.page-created",
					getHost(request),
					I18n.acceptLanguage(request),
					user.getUsername(),
					wiki.getString("title"))
					: I18n.getInstance().translate("wiki.push.notif.comment-added",
					getHost(request),
					I18n.acceptLanguage(request),
					user.getUsername(),
					pageTitle);

			params.put("pushNotif", new JsonObject().put("title", pushNotifTitle).put("body", pushNotifBody));
			notification.notifyTimeline(request, "wiki." + notificationName, user, recipients, idResource, params);
		}

	}
}
