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
import java.util.stream.Collectors;

import fr.wseduc.webutils.I18n;
import fr.wseduc.webutils.http.Renders;
import io.vertx.core.AsyncResult;
import net.atos.entng.wiki.Wiki;
import net.atos.entng.wiki.config.WikiConfig;
import net.atos.entng.wiki.explorer.WikiExplorerPlugin;
import net.atos.entng.wiki.filters.OwnerAuthorOrShared;
import net.atos.entng.wiki.filters.OwnerAuthorOrSharedPage;
import net.atos.entng.wiki.service.WikiService;

import net.atos.entng.wiki.service.WikiServiceMongoImpl;
import net.atos.entng.wiki.to.PageListRequest;
import org.apache.commons.lang3.StringUtils;
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
	 * Display react front view /id/:id/pages
	 * @param request
	 */
	@Get("/id/:id/pages")
	@SecuredAction(value = "", type = ActionType.AUTHENTICATED)
	public void viewWikiPages(HttpServerRequest request) {
		renderView(request, new JsonObject(), "index.html", null);
	}

	@Get("/id/:id/page/:pageId/version/:versionId")
	@SecuredAction(value = "", type = ActionType.AUTHENTICATED)
	public void viewByRevision(HttpServerRequest request){
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

	@Get("/listallpages")
	@ApiDoc("List wikis, visible by current user, with all their pages' titles. Used by Behaviours.")
	@SecuredAction("wiki.list")
	public void listAllPages(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					// We get the onlyVisible parameter
					final boolean onlyVisible = request.params().get("visible") != null;
					// We get the handler
					Handler<Either<String, JsonArray>> handler = arrayResponseHandler(request);
					// We list all pages
					wikiService.listAllPages(user, onlyVisible, handler);
				}
			}
		});
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
		final boolean originalFormat = "true".equalsIgnoreCase(request.params().get("originalformat"));
		if (StringUtils.isEmpty(idWiki) || StringUtils.isEmpty(idPage)) {
			badRequest(request);
			return;
		}
		wikiService.getPage(idWiki, idPage, request, originalFormat, notEmptyResponseHandler(request));
	}

	@Post("/:id/page")
	@ApiDoc("Add page to wiki")
	@SecuredAction(value = "wiki.contrib", type = ActionType.RESOURCE)
	public void createPage(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, user -> {
			if (user != null) {
				RequestUtils.bodyToJson(request, pathPrefix + "pageCreate", page -> {
					final String wikiId = request.params().get("id");
					page.put("_id", new ObjectId().toString());

					// Create Page
					wikiService.createPage(user, wikiId, page, request, event -> {
								if (event.isRight()) {
									// create version of a page
									wikiService.createRevision(
											wikiId,
											page.getString("_id"),
											user,
											page.getString("title"),
											page.getString("content"),
											page.getBoolean("isVisible"),
											page.getInteger("position"))
											.onFailure(handler -> {
												log.error("Error creating revision " + wikiId + "/" + page.getString("_id") + " - " + handler.getMessage());
											});
									notifyPageCreated(request, user, wikiId, page.getString("_id"), page.getString("title"), page.getBoolean("isVisible", false));
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
		final String requestIdWiki = request.params().get("id");
		final String requestIdPage = request.params().get("idpage");

		UserUtils.getUserInfos(eb, request, user -> {
			if (user != null) {
				RequestUtils.bodyToJson(request, pathPrefix + "pageUpdate", pagePayload -> {
					// get the wiki to get the page visibility before update and to get shared users for notification
					wikiService.getWiki(requestIdWiki, wikiRes -> {
						if (wikiRes.isRight()) {
							// update the page
							wikiService.updatePage(user, requestIdWiki, requestIdPage, pagePayload, request, updatePageResult -> {
										if (updatePageResult.isRight()) {
											final JsonObject wiki = wikiRes.right().getValue();
											final boolean pageWasVisible = wiki.getJsonArray("pages")
													.stream()
													.map(page -> (JsonObject) page)
													.filter(page -> page.getString("_id").equals(requestIdPage))
													.findFirst()
													.map(page -> page.getBoolean("isVisible", false))
													.orElse(false);
											final boolean pageIsNowVisible = pagePayload.getBoolean("isVisible", false);

											// If page became visible, then send notification
											if (!pageWasVisible && pageIsNowVisible) {
												final String pageTitle = updatePageResult.right().getValue().getString("title");
												notifyPageUpdated(request, user, wiki, requestIdPage, pageTitle);
											}
											renderJson(request, updatePageResult.right().getValue());
										} else {
											renderJson(request
													, new JsonObject().put("error", updatePageResult.left().getValue())
													, 500);
										}
									});
						} else {
							renderJson(request, new JsonObject().put("error", "wiki with id " + requestIdWiki + " was not found"), 404);
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

		UserUtils.getUserInfos(eb, request, user -> {
			if (user != null) {
				// get wiki information before deleting: wiki information will be used in deleted page author notification
				// (in case author is different from logged user)
				wikiService.getWiki(idWiki, wikiRes -> {
					if (wikiRes.isRight()) {
						final JsonObject wiki = wikiRes.right().getValue();

						wikiService.deletePage(user, wiki, idPage)
								.onSuccess(notifyAuthorMap -> {
									deleteRevisions(idWiki, idPage);
									wikiService.unsetIndex(idWiki, idPage, notEmptyResponseHandler(request));

									// notify author of page deletion
									if (notifyAuthorMap != null && !notifyAuthorMap.isEmpty()) {
										final String authorId = notifyAuthorMap.entrySet().iterator().next().getKey();
										this.notifyPageDeleted(wiki, idPage, user, authorId, request);
									}
								})
								.onFailure(err -> renderJson(request, new JsonObject().put("error", err.getMessage()), 400));
					} else {
						renderJson(request, new JsonObject().put("error", "wiki with id " + idWiki + " was not found"), 400);
					}
				});
			} else {
				unauthorized(request);
			}
		});
	}



	@Delete("/:id/pages")
	@ApiDoc("Delete a list of page")
	// a contributor can delete a page on which he is the owner => so only check whether use is a contributor
	@SecuredAction(value = "wiki.contrib", type = ActionType.RESOURCE)
	public void deletePageList(final HttpServerRequest request) {
		final String idWiki = request.params().get("id");

		UserUtils.getAuthenticatedUserInfos(eb, request).onSuccess(user -> {
			RequestUtils.bodyToJson(request, pathPrefix + "pageDeleteList", pagePayload -> {
				final Set<String> toDeletePageIDs = pagePayload.getJsonArray("ids")
						.stream()
						.map(Object::toString)
						.collect(Collectors.toSet());

				// get wiki information before deleting,
				// in order to send wiki and page notification info to author, in case author is different from logged user
				wikiService.getWiki(idWiki, wikiRes -> {
					if (wikiRes.isRight()) {
						final JsonObject wiki = wikiRes.right().getValue();

						// delete pages
						wikiService.deletePages(user, wiki, toDeletePageIDs)
								.onSuccess(notifyAuthorMap -> {
									// notifyMapRes contains map of author and page ids to notify
									notifyAuthorMap.forEach((authorId, pageIDs) -> {
										// if only one page is concerned for an author then send a notification with page info
										if (pageIDs != null && pageIDs.size() == 1) {
											this.notifyPageDeleted(wiki, pageIDs.get(0), user, authorId, request);
										}
										// else send a notification for all pages (without pages info)
										else {
											this.notifyPageDeleted(wiki, null, user, authorId, request);
										}
									});

									noContent(request);
								})
								.onFailure(err -> renderJson(request,
										new JsonObject().put("error", err.getMessage()), 400));
					} else {
						renderJson(request,
								new JsonObject().put("error", "wiki with id " + idWiki + " was not found"), 400);
					}
				});
			});
		});
	}

	@Put("/:id/pages")
	@ApiDoc("Update page list")
	@SecuredAction(value = "wiki.contrib", type = ActionType.RESOURCE)
	public void updatePageList(final HttpServerRequest request) {
		UserUtils.getAuthenticatedUserInfos(eb, request).onSuccess(user -> {
			RequestUtils.bodyToJson(request, pathPrefix + "pageUpdateList", pagePayload -> {
				final PageListRequest list = PageListRequest.fromJson(pagePayload);
				wikiService.updatePageList(user, request.params().get("id"), list)
						.onSuccess(res -> renderJson(request, res.toJson()))
						.onFailure(err -> renderJson(request, new JsonObject().put("error", err.getMessage()), 400));
			});
		});
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

	@Put("/:id/page/:idpage/comment/:idcomment")
	@ApiDoc("Update a page comment")
	@SecuredAction(value = "wiki.comment", type = ActionType.RESOURCE)
	public void updateComment(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, user -> {
			if (user != null) {
				RequestUtils.bodyToJson(request, body -> {
					final String idWiki = request.params().get("id");
					final String idPage = request.params().get("idpage");
					final String idComment = request.params().get("idcomment");

					final String comment = body.getString("comment", null);
					if (comment == null || comment.trim().isEmpty()) {
						badRequest(request);
						return;
					}

					wikiService.updateComment(idWiki, idPage, idComment, comment, notEmptyResponseHandler(request));
				});
			} else {
				unauthorized(request);
			}
		});
	}

	@Get("/:id/page/:idpage/revisions")
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

	@Get("/:id/page/:idpage/revisions/:idrev")
	@SecuredAction(value = "wiki.contrib", type = ActionType.RESOURCE)
	public void getRevisionById(HttpServerRequest request) {
		String revisionId = request.params().get("idrev");
		if (StringUtils.isEmpty(revisionId)) {
			badRequest(request, "invalid.params");
			return;
		}
		wikiService.getRevisionById(revisionId, notEmptyResponseHandler(request));
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
							.put("wikiUri", "/wiki/id/" + id);
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
							.put("wikiUri", "/wiki/id/" + id);
					params.put("resourceUri", params.getString("wikiUri"));

					shareResource(request, "wiki.shared", false, params, "title");
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

	/**
	 * Notify page creation.
	 * @param request
	 * @param author
	 * @param idWiki
	 * @param idPage
	 * @param pageTitle
	 * @param isVisiblePage
	 */
	private void notifyPageCreated(final HttpServerRequest request, final UserInfos author,
								   final String idWiki, final String idPage, final String pageTitle, final boolean isVisiblePage) {
		// Do not notify hidden page creation
		if (!isVisiblePage) {
			return;
		}

		wikiService.getDataForNotification(idWiki, null, event -> {
			if (event.isRight()) {
				final JsonObject wiki = event.right().getValue();
				final Set<String> recipientSet = new HashSet<>();
				final String wikiOwnerId = wiki.getJsonObject("owner").getString("userId");

				// if wiki owner is not the page author, add wiki owner to recipients
				if (!wikiOwnerId.equals(author.getUserId())) {
					recipientSet.add(wikiOwnerId);
				}

				final JsonArray shared = wiki.getJsonArray("shared");
				if (shared != null) {
					// Get userIds and members of groups, and add them to recipients
					shared.stream()
							.map((sharedItem) -> (JsonObject) sharedItem)
							.forEach(sharedItemJO -> {
								final String sharedUserId = sharedItemJO.getString("userId", null);
								final String sharedGroupId = sharedItemJO.getString("groupId", null);

								if (sharedUserId != null && !sharedUserId.equals(author.getUserId())) {
									recipientSet.add(sharedUserId);
								} else if (sharedGroupId != null) {
									UserUtils.findUsersInProfilsGroups(sharedGroupId, eb, author.getUserId(), false, findUsersEvent -> {
										if (findUsersEvent != null) {
											findUsersEvent.stream()
													.map(user -> (JsonObject) user)
													.forEach(userJO -> {
														recipientSet.add(userJO.getString("id"));
													});
										}
									});
								}
							});

				}
				sendNotification(request, author, recipientSet, pageTitle, wiki, idPage, true, idPage, null);
			} else {
				log.error("Error in service getDataForNotification. Unable to send timeline "
						+ WIKI_PAGE_CREATED_EVENT_TYPE
						+ " notification.");
			}
		});
	}

	/**
	 * Notify comment creation.
	 * @param request
	 * @param author
	 * @param idWiki
	 * @param idPage
	 * @param idComment
	 * @param comment
	 */
	private void notifyCommentCreated(final HttpServerRequest request, final UserInfos author,
									  final String idWiki, final String idPage, final String idComment, final String comment) {
		wikiService.getDataForNotification(idWiki, idPage, event -> {
			if (event.isRight()) {
				final JsonObject wiki = event.right().getValue();
				final JsonObject page = wiki.getJsonArray("pages").getJsonObject(0);

				// Do not notify comment creation for hidden page
				if (!page.getBoolean("isVisible", false)) {
					return;
				}

				final Set<String> recipientSet = new HashSet<>();
				final String wikiOwnerId = wiki.getJsonObject("owner").getString("userId");

				// if wiki owner is not the comment author, add wiki owner to recipients
				if (!wikiOwnerId.equals(author.getUserId())) {
					recipientSet.add(wikiOwnerId);
				}

				final JsonArray shared = wiki.getJsonArray("shared");
				if (shared != null) {
					// Get userIds and members of groups, and add them to recipients
					shared.stream()
							.map((sharedItem) -> (JsonObject) sharedItem)
							.forEach(sharedItemJO -> {
								final String sharedUserId = sharedItemJO.getString("userId", null);
								final String sharedGroupId = sharedItemJO.getString("groupId", null);

								// if shared user is page author then add it to recipients
								if (WikiServiceMongoImpl.isPageAuthor(page, sharedUserId)) {
									recipientSet.add(sharedUserId);
								} else if (!sharedItemJO.getBoolean(
										"net-atos-entng-wiki-controllers-WikiController|updateWiki",
										false)) {
									// if shared user is not manager then skip it
									return;
								} else {
									if (sharedUserId != null && !sharedUserId.equals(author.getUserId())) {
										recipientSet.add(sharedUserId);
									} else if (sharedGroupId != null) {
										UserUtils.findUsersInProfilsGroups(sharedGroupId, eb, author.getUserId(), false, findUsersEvent -> {
											if (findUsersEvent != null) {
												findUsersEvent.stream()
														.map(user -> (JsonObject) user)
														.forEach(userJO -> {
															recipientSet.add(userJO.getString("id"));
														});
											}
										});
									}
								}
							});
				}
				sendNotification(request, author, recipientSet, page.getString("title"), wiki, idPage,
						false, idComment, comment);
			} else {
				log.error("Error in service getDataForNotification. Unable to send timeline "
						+ WIKI_COMMENT_CREATED_EVENT_TYPE
						+ " notification.");
			}
		});
	}

	private void sendNotification(final HttpServerRequest request, final UserInfos author, final Set<String> recipientSet,
								  final String pageTitle, final JsonObject wiki, final String idPage,
								  final boolean isCreatePage, final String idSubResource, String comment) {
		if (recipientSet != null && !recipientSet.isEmpty()){
			List<String> recipients = new ArrayList<>(recipientSet);

			JsonObject params = new JsonObject();
			params.put("uri", "/userbook/annuaire#" + author.getUserId() + "#" + author.getType());
			params.put("username", author.getUsername())
					.put("pageTitle", pageTitle)
					.put("wikiTitle", wiki.getString("title"))
					.put("pageUri", "/wiki/id/" + wiki.getString("_id") + "/page" + "/" + idPage);
			params.put("resourceUri", params.getString("pageUri"));

			if (!isCreatePage && comment != null && !comment.isEmpty()) {
				if (comment.length() > OVERVIEW_LENGTH) {
					comment = comment.substring(0, OVERVIEW_LENGTH) + " [...]";
				}
				params.put("overview", comment);
			}

			String notificationName = isCreatePage ? "page-created" : "comment-added";
			String pushNotifTitle = isCreatePage ? "wiki.push.notif.page-created" : "wiki.push.notif.comment-added";
			String pushNotifBody = isCreatePage
					? I18n.getInstance().translate(
							"wiki.push.notif.page-created",
								getHost(request),
								I18n.acceptLanguage(request),
								author.getUsername(),
								wiki.getString("title"))
					: I18n.getInstance().translate(
							"wiki.push.notif.comment-added",
								getHost(request),
								I18n.acceptLanguage(request),
								author.getUsername(),
								pageTitle);

			params.put("pushNotif", new JsonObject().put("title", pushNotifTitle).put("body", pushNotifBody));
			notification.notifyTimeline(request, "wiki." + notificationName, author, recipients, wiki.getString("_id"), idSubResource, params);
		}

	}

	/**
	 * Notify author of page deletion.
	 *
	 * Note: page creation and page comment notification are handled in sendNotification method,
	 * but this method is already complex to read so in order to keep it simple,
	 * we handle page deletion notification here.
	 *
	 * @param wiki wiki information
	 * @param pageId if pageId is provided then get page info to send in notification
	 * @param user user who deleted the page
	 * @param authorId author of page to send notification
	 * @param request http request to get host and language for notification message
	 */
	private void notifyPageDeleted(final JsonObject wiki, final String pageId, final UserInfos user,
								   final String authorId, final HttpServerRequest request) {
		final String wikiTitle = wiki.getString("title");

		final JsonObject params = new JsonObject()
				.put("uri", "/userbook/annuaire#" + user.getUserId() + "#" + user.getType())
				.put("username", user.getUsername())
				.put("wikiTitle", wikiTitle);

		JsonObject pushNotif = new JsonObject()
				.put("title", "wiki.push.notif.page-deleted.title");

		// if pageId is provided then get page info to send in notification
		if (pageId != null) {
			final String pageTitle = WikiServiceMongoImpl.getPageTitle(wiki, pageId);

			params.put("pageTitle", pageTitle);

			pushNotif.put("body", I18n.getInstance().translate(
					"wiki.push.notif.page-deleted.body",
					getHost(request),
					I18n.acceptLanguage(request),
					user.getUsername(),
					pageTitle,
					wikiTitle));
		} else {
			params.put("pageTitle", I18n.getInstance().translate(
					"timeline.wiki.has.deleted.page.multiple",
					getHost(request),
					I18n.acceptLanguage(request)));

			pushNotif.put("body", I18n.getInstance().translate(
					"wiki.push.notif.pages-deleted.body",
					getHost(request),
					I18n.acceptLanguage(request),
					user.getUsername(),
					wikiTitle));
		}

		params.put("pushNotif", pushNotif);

		notification.notifyTimeline(request,
				"wiki.page-deleted",
				user,
				Collections.singletonList(authorId),
				pageId,
				params);
	}


	/**
	 * Send notification for page update if page visibility has changed from hidden to visible.
	 * @param request
	 * @param user
	 * @param wiki
	 * @param idPage
	 * @param pageTitle
	 */
	private void notifyPageUpdated(final HttpServerRequest request, final UserInfos author, final JsonObject wiki,
								   final String idPage, final String pageTitle) {
		// Get userIds and members of groups, and add them to recipients
		final Set<String> recipientSet = new HashSet<>();
		final String wikiOwnerId = wiki.getJsonObject("owner").getString("userId");

		// if wiki owner is not the page author, add wiki owner to recipients
		if (!wikiOwnerId.equals(author.getUserId())) {
			recipientSet.add(wikiOwnerId);
		}

		final JsonArray shared = wiki.getJsonArray("shared");
		if (shared != null) {
			shared.stream()
					.map((sharedItem) -> (JsonObject) sharedItem)
					.forEach(sharedItemJO -> {
						final String sharedUserId = sharedItemJO.getString("userId", null);
						final String sharedGroupId = sharedItemJO.getString("groupId", null);

						if (sharedUserId != null && !sharedUserId.equals(author.getUserId())) {
							recipientSet.add(sharedUserId);
						} else if (sharedGroupId != null) {
							UserUtils.findUsersInProfilsGroups(sharedGroupId, eb, author.getUserId(),
									false, findUsersEvent -> {
								if (findUsersEvent != null) {
									findUsersEvent.stream()
											.map(findUser -> (JsonObject) findUser)
											.forEach(userJO -> {
												recipientSet.add(userJO.getString("id"));
											});
								}
							});
						}
					});

		}

		// prepare notification info
		final String wikiTitle = wiki.getString("title");
		JsonObject params = new JsonObject();
		params.put("uri", "/userbook/annuaire#" + author.getUserId() + "#" + author.getType());
		params.put("username", author.getUsername())
				.put("pageTitle", pageTitle)
				.put("wikiTitle", wiki.getString("title"))
				.put("pageUri", "/wiki/id/" + wiki.getString("_id") + "/page/" + idPage);
		params.put("resourceUri", params.getString("pageUri"));

		JsonObject pushNotif = new JsonObject()
				.put("title", "wiki.push.notif.page-updated.title");
		params.put("pageTitle", pageTitle);

		pushNotif.put("body", I18n.getInstance().translate(
				"wiki.push.notif.page-updated.body",
				getHost(request),
				I18n.acceptLanguage(request),
				author.getUsername(),
				pageTitle,
				wikiTitle));

		params.put("pushNotif", pushNotif);

		// send notification
		notification.notifyTimeline(request,
				"wiki.page-updated",
				author,
				new ArrayList<>(recipientSet),
				wiki.getString("_id"),
				idPage,
				params);
	}
}
