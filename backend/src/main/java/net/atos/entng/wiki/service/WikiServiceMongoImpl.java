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

package net.atos.entng.wiki.service;

import static com.mongodb.client.model.Filters.*;
import static net.atos.entng.wiki.Wiki.REVISIONS_COLLECTION;
import static org.apache.commons.lang3.StringUtils.isNotBlank;

import java.util.*;

import com.mongodb.client.model.Filters;
import fr.wseduc.transformer.IContentTransformerClient;
import fr.wseduc.transformer.to.ContentTransformerFormat;
import fr.wseduc.transformer.to.ContentTransformerRequest;
import fr.wseduc.transformer.to.ContentTransformerResponse;
import fr.wseduc.webutils.Utils;
import io.vertx.core.CompositeFuture;
import io.vertx.core.Future;
import io.vertx.core.Promise;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import net.atos.entng.wiki.controllers.WikiController;
import net.atos.entng.wiki.explorer.WikiExplorerPlugin;
import net.atos.entng.wiki.to.PageId;
import net.atos.entng.wiki.to.PageListEntryFlat;
import net.atos.entng.wiki.to.PageListRequest;
import net.atos.entng.wiki.to.PageListResponse;
import org.bson.conversions.Bson;
import org.entcore.common.audience.AudienceHelper;
import org.entcore.common.audience.to.AudienceCheckRightRequestMessage;
import org.entcore.common.editor.IContentTransformerEventRecorder;
import org.bson.types.ObjectId;
import org.entcore.common.explorer.IdAndVersion;
import org.entcore.common.mongodb.MongoDbResult;
import org.entcore.common.service.impl.MongoDbCrudService;
import org.entcore.common.share.ShareNormalizer;
import org.entcore.common.share.ShareRoles;
import org.entcore.common.user.UserInfos;
import org.entcore.common.utils.StringUtils;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import static org.apache.commons.lang3.StringUtils.isNotBlank;
import com.mongodb.BasicDBObject;

import fr.wseduc.mongodb.MongoDb;
import fr.wseduc.mongodb.MongoQueryBuilder;
import fr.wseduc.mongodb.MongoUpdateBuilder;
import fr.wseduc.webutils.Either;

public class WikiServiceMongoImpl extends MongoDbCrudService implements WikiService {
	protected static final Logger log = LoggerFactory.getLogger(WikiServiceMongoImpl.class);
	private final String collection;
	private final MongoDb mongo;
	private final WikiExplorerPlugin wikiExplorerPlugin;

	private final ShareNormalizer shareNormalizer;

	private final IContentTransformerClient contentTransformerClient;

	private final IContentTransformerEventRecorder contentTransformerEventRecorder;

	private final AudienceHelper audienceHelper;

	public WikiServiceMongoImpl(final String collection, final WikiExplorerPlugin plugin,
								final IContentTransformerClient contentTransformerClient,
								final IContentTransformerEventRecorder contentTransformerEventRecorder,
								final AudienceHelper audienceHelper) {
		super(collection);
		this.collection = collection;
		this.mongo = MongoDb.getInstance();
		this.wikiExplorerPlugin = plugin;
		this.shareNormalizer = new ShareNormalizer(this.wikiExplorerPlugin.getSecuredActions());
		this.contentTransformerClient = contentTransformerClient;
		this.contentTransformerEventRecorder = contentTransformerEventRecorder;
		this.audienceHelper = audienceHelper;
	}

	@Override
	public void getWiki(String id, boolean includeContent, Handler<Either<String, JsonObject>> handler) {
		final Bson query = eq("_id", id);

		JsonObject projection = includeContent? new JsonObject() : new JsonObject()
				.put("pages.content", 0)
				.put("pages.jsonContent", 0)
				.put("pages.contentVersion", 0);

		mongo.findOne(collection, MongoQueryBuilder.build(query), projection,
				result -> {
					final JsonObject body = result.body();
					if (body.containsKey("result")) {
						this.addNormalizedShares(body.getJsonObject("result"));
						this.addChildrenPages(body.getJsonObject("result"));
					}
					handler.handle(Utils.validResult(result));
				});
	}

	private void addChildrenPages(final JsonObject wiki) {
		if (wiki != null) {
			final JsonArray pages = wiki.getJsonArray("pages");
			pages.forEach(page -> {
				final JsonObject pageJO = (JsonObject) page;
				final String parentId = pageJO.getString("parentId");

				if (!StringUtils.isEmpty(parentId)) {
					final Optional<Object> parentPage = pages
							.stream()
							.filter(p -> ((JsonObject) p).getString("_id").equals(parentId))
							.findFirst();
					if (parentPage.isPresent()) {
						final JsonObject parentPageJO = (JsonObject) parentPage.get();
						final JsonObject childPageJO = new JsonObject()
								.put("_id", pageJO.getString("_id"))
								.put("title", pageJO.getString("title"))
								.put("isVisible", pageJO.getBoolean("isVisible"))
								.put("position", pageJO.getInteger("position"));
						if (parentPageJO.getJsonArray("children") != null) {
							parentPageJO.getJsonArray("children").add(childPageJO);
						} else {
							parentPageJO.put("children", new JsonArray().add(childPageJO));
						}
					}
				}
			});
		}
	}

	private JsonObject addNormalizedShares(final JsonObject wiki) {
		if (wiki != null) {
			shareNormalizer.addNormalizedRights(wiki, e -> wikiExplorerPlugin.getCreatorForModel(e).map(UserInfos::getUserId));
		}
		return wiki;
	}

	// TODO: add a print param getWiki to get all information to print a wiki? and then remove this method?
	/* @Override
	public void getWholeWiki(String id, Handler<Either<String, JsonObject>> handler) {
		super.retrieve(id, handler);
	} */

	@Override
	public void getWikis(UserInfos user,
			Handler<Either<String, JsonArray>> handler) {
		// Query : return wikis visible by current user only (i.e. owner or
		// shared)
		List<Bson> groups = new ArrayList<>();
		groups.add(eq("userId", user.getUserId()));
		if(!user.getGroupsIds().isEmpty()){
			groups.add(in("groupId", user.getGroupsIds()));
		}
		final Bson query = or(
				eq("owner.userId", user.getUserId()),
				elemMatch("shared", or(groups))
		);

		// Projection
		JsonObject projection = new JsonObject();
		projection.put("pages", 0).put("created", 0);

		JsonObject sort = new JsonObject().put("modified", -1);
		mongo.find(collection, MongoQueryBuilder.build(query), sort,
				projection, MongoDbResult.validResultsHandler(handler));
	}

	@Override
	public void getPages(String idWiki, String getContent,
			Handler<Either<String, JsonObject>> handler) {
		final Bson query = eq("_id", idWiki);

		JsonObject projection = new JsonObject()
				.put("_id", 0)
				.put("title", 0)
				.put("thumbnail", 0)
				.put("created", 0)
				.put("modified", 0)
				.put("owner", 0)
				.put("index", 0)
				.put("pages.oldContent", 0);

		if (!Boolean.parseBoolean(getContent)) {
			projection
					.put("pages.content", 0)
					.put("pages.jsonContent", 0)
					.put("pages.contentVersion", 0);
		}

		mongo.findOne(collection, MongoQueryBuilder.build(query), projection,
				MongoDbResult.validResultHandler(handler));
	}

	@Override
	public void listAllPages(UserInfos user, boolean onlyVisible,
							 Handler<Either<String, JsonArray>> handler) {
		// Query : return pages visible by current user only (i.e. owner or
		// shared)
		final List<Bson> groups = new ArrayList<>();
		groups.add(eq("userId", user.getUserId()));
		if (!user.getGroupsIds().isEmpty()) {
			groups.add(in("groupId", user.getGroupsIds()));
		}
		final Bson query = or(
				eq("owner.userId", user.getUserId()),
				elemMatch("shared", or(groups))
		);
		// Projection
		JsonObject projection = new JsonObject();
		projection.put("pages.content", 0).put("created", 0);
		JsonObject sort = new JsonObject().put("pages.title", 1);
		mongo.find(collection, MongoQueryBuilder.build(query), sort,
				projection, MongoDbResult.validResultsHandler(res -> {
					// If the result is right, we want to filter the pages
					if(res.isRight()){
						// We get the wikis
						final JsonArray wikis = res.right().getValue();
						// We iterate over the wikis
						for(final Object wiki : wikis){
							// We get the wiki
							final JsonObject wikiJO = (JsonObject) wiki;
							// We get the pages
							final JsonArray pages = wikiJO.getJsonArray("pages", new JsonArray());
							final JsonArray filteredPages = new JsonArray();
							// We iterate over the pages
							for(final Object page : pages){
								final JsonObject pageJO = (JsonObject) page;
								// We check if the page is visible
								boolean isVisible = pageJO.getBoolean("isVisible", true);
								// We check if the page is visible
								boolean isAuthor = isPageAuthor(pageJO, user.getUserId());
								// We check if the page is visible
								boolean isManager = isManager(wikiJO, user);
								// If the page is visible, we want to return it
                                if (!onlyVisible || // If onlyVisible is true, we only want to return pages that are visible
                                    isVisible || // If isVisible is true, we want to return the page
                                    isManager || // If isManager is true, we want to return the page
                                    isAuthor) { // If isAuthor is true, we want to return the page
									filteredPages.add(pageJO);
								}
							}
							// We add the filtered pages to the wiki
							wikiJO.put("pages", filteredPages);
						}
					}
					handler.handle(res);
				}));
	}


	@Override
	public void createWiki(UserInfos user, String wikiTitle, String thumbnail, String description,
	final Optional<Number> folderId,
			Handler<Either<String, JsonObject>> handler) {

		JsonObject newWiki = new JsonObject();
		newWiki
				.put("title", wikiTitle)
				.put("description", description)
				.put("pages", new JsonArray());
		if(thumbnail!=null && !thumbnail.trim().isEmpty()){
			newWiki.put("thumbnail", thumbnail);
		}

		super.create(newWiki, user, r -> {
			if(r.isRight()) {
				// notify Explorer
				newWiki.put("version", System.currentTimeMillis());
				newWiki.put("_id", r.right().getValue().getString("_id"));
				wikiExplorerPlugin.notifyUpsert(user, newWiki, folderId)
					.onSuccess(e -> {
						// on success return 200
						handler.handle(r);
					})
					.onFailure(e -> {
						// on error return message
						handler.handle(new Either.Left<>(e.getMessage()));
					});
			} else {
				handler.handle(r);
			}
		});
	}

	@Override
	public void updateWiki(UserInfos user, String idWiki, String wikiTitle, String thumbnail, String description,
			Handler<Either<String, JsonObject>> handler) {
		JsonObject data = new JsonObject();
		data
				.put("title", wikiTitle)
				.put("description", description);

		if(thumbnail==null || thumbnail.trim().isEmpty()){
			data.put("thumbnail", "");
		} else {
			data.put("thumbnail", thumbnail);
		}

		super.update(idWiki, data, r -> {
			if (r.isRight()) {
				// notify EUR
				data.put("_id", idWiki);
				data.put("version", System.currentTimeMillis());
				wikiExplorerPlugin.notifyUpsert(user, data)
						.onSuccess(e -> {
							// on success return 200
							handler.handle(r);
						})
						.onFailure(e -> {
							// on error return message
							handler.handle(new Either.Left<>(e.getMessage()));
						});
			} else {
				handler.handle(r);
			}
		});
	}

	@Override
	public void deleteWiki(UserInfos user, String idWiki,
			Handler<Either<String, JsonObject>> handler) {
		super.delete(idWiki, r -> {
			if (r.isRight()) {
				// notify EUR
				wikiExplorerPlugin.notifyDeleteById(user, new IdAndVersion(idWiki, System.currentTimeMillis()))
						.onSuccess(e -> {
							// on success return 200
							handler.handle(r);
						})
						.onFailure(e -> {
							// on error return message
							handler.handle(new Either.Left<>(e.getMessage()));
						});
			} else {
				handler.handle(r);
			}
		});
	}

	@Override
	public void getPage(final String idWiki, final String idPage, final HttpServerRequest request, boolean originalFormat, final Handler<Either<String, JsonObject>> handler) {
		final Bson query = and(
				eq("_id", idWiki),
				eq("pages._id", idPage)
		);

		// Projection
		JsonObject projection = new JsonObject()
				.put("_id", 0)
				.put("pages.$", 1);

		// Find page
		mongo.findOne(collection, MongoQueryBuilder.build(query), projection, res -> {
			if (res.body() == null ||
					res.body().getJsonObject("result") == null ||
					res.body().getJsonObject("result").getJsonArray("pages") == null ||
					res.body().getJsonObject("result").getJsonArray("pages").isEmpty()
			) {
				log.info("No page found with id: " + idPage);
				handler.handle(new Either.Left<>("No page found with id: " + idPage));
				return;
			}
			final JsonObject page = res.body().getJsonObject("result").getJsonArray("pages").getJsonObject(0);
			// Tiptap Transformer
			handleOldContent(idWiki, idPage, page, originalFormat, request)
					.onFailure(fail -> handler.handle(new Either.Left<>(fail.getMessage())))
					.onSuccess(success -> handler.handle(new Either.Right<>(success)));
		});
	}

	/**
	 * If {@code page} does not have contentVersion or if version is 0 then old content is transformed to new content.<br />
	 * Otherwise, nothing is done
	 * @param idWiki ID of the wiki whose page could be transformed
	 * @param idPage ID of Page whose content could be transformed
	 * @param page Page whose content could be transformed
	 * @return The modified page (actually the same as {@code page})
	 */
	private Future<JsonObject> handleOldContent(final String idWiki, final String idPage, final JsonObject page, final boolean originalFormatRequested,
												final HttpServerRequest request) {
		final Promise<JsonObject> promise = Promise.promise();
		final JsonObject oldPage = page.copy();
		if (page.containsKey("jsonContent")) {
			log.debug("Page has already been transformed, nothing to do.");
			promise.complete(page);
		} else if (org.apache.commons.lang3.StringUtils.isEmpty(page.getString("content"))) {
			log.debug("No content to transform");
			promise.complete(page);
		} else {
			Set<ContentTransformerFormat> desiredFormats = new HashSet<>();
			desiredFormats.add(ContentTransformerFormat.HTML);
			desiredFormats.add(ContentTransformerFormat.JSON);
			final ContentTransformerRequest transformerRequest = new ContentTransformerRequest(desiredFormats, 0, page.getString("content"), null);
			contentTransformerClient.transform(transformerRequest)
					.onComplete(response -> {
						if (response.failed()) {
							log.error("Content transformation failed", response.cause());
							promise.fail("content.transformation.failed");
						} else if (response.result() == null) {
							log.info("No content transformed");
							promise.complete(page);
						} else {
							// contentVersion set to 0 to indicate that content has been transformed for the first time.
							final ContentTransformerResponse transformedContent = response.result();
							page.put("contentVersion", 0)
									.put("jsonContent", transformedContent.getJsonContent())
									.put("oldContent", oldPage.getString("content"))
									.put("content", transformedContent.getCleanHtml());
							// Update query
							final BasicDBObject idPageDBO = new BasicDBObject("_id", idPage);
							final Bson queryUpdatePage = and(eq("_id", idWiki), elemMatch("pages", idPageDBO));
							final MongoUpdateBuilder modifier = new MongoUpdateBuilder()
									.set("pages.$.contentVersion", page.getInteger("contentVersion"))
									.set("pages.$.jsonContent", page.getJsonObject("jsonContent"))
									.set("pages.$.content", page.getString("content"))
									.set("pages.$.oldContent", oldPage.getString("content"));
							mongo.update(collection, MongoQueryBuilder.build(queryUpdatePage), modifier.build(),e -> {
								promise.complete(page);
							});
							// Record transformation event
							contentTransformerEventRecorder.recordTransformation(idPage, "page", transformedContent, request);
						}
					});
		}
		return promise.future().map(fetchedPage -> {
			if(originalFormatRequested && oldPage.containsKey("oldContent")) {
				fetchedPage.put("content", oldPage.getString("oldContent"));
			}
			fetchedPage.remove("oldContent");
			return fetchedPage;
		});
	}

	@Override
	public void createPage(final UserInfos user, final String wikiId, final JsonObject page,
						   final HttpServerRequest request, final Handler<Either<String, JsonObject>> handler) {
		final Bson query = eq("_id", wikiId);
		getWiki(wikiId, wikiRes -> {
			if(wikiRes.isRight()){
				final JsonObject wiki = wikiRes.right().getValue();
				// if not a manager of the wiki => the page isVisible
				final boolean isManager = isManager(wiki, user);
				final boolean oldVisibility = page.getBoolean("isVisible", true);
				final boolean newVisibility = isManager? oldVisibility : true;
				final int lastPosition = wiki.getJsonArray("pages").size();
				// Add extra fields to page
				final JsonObject mongoNow = MongoDb.now();
				page
						.put("_id", page.getString("_id"))
						.put("author", user.getUserId())
						.put("authorName", user.getUsername())
						.put("modified", mongoNow)
						.put("created", mongoNow)
						// Set the position of the new page to the last position in the list
						.put("position", lastPosition)
						// a manager
						.put("isVisible", newVisibility);
						// Set the position of the new page to the last position in the list



				// Tiptap Transformer
				Future<ContentTransformerResponse> contentTransformerResponseFuture;
				if (isNotBlank(page.getString("content", ""))) {
					Set<ContentTransformerFormat> desiredFormats = new HashSet<>();
					desiredFormats.add(ContentTransformerFormat.HTML);
					desiredFormats.add(ContentTransformerFormat.JSON);

					// request to transform page "content" to desiredFormats
					ContentTransformerRequest transformerRequest = new ContentTransformerRequest(
							desiredFormats,
							page.getInteger("contentVersion", 0),
							page.getString("content", ""),
							null
					);

					contentTransformerResponseFuture = this.contentTransformerClient
							.transform(transformerRequest);
				} else {
					contentTransformerResponseFuture = Future.succeededFuture();
				}

				contentTransformerResponseFuture.onComplete(transformerResponse -> {
					if (transformerResponse.failed()) {
						log.error("Error while transforming the content", transformerResponse.cause());
					} else {
						if (transformerResponse.result() == null) {
							log.debug("No content transformed.");
						} else {
							page.put("contentVersion", transformerResponse.result().getContentVersion());
							page.put("content", transformerResponse.result().getCleanHtml());
							page.put("jsonContent", transformerResponse.result().getJsonContent());
							// Record transformation event
							contentTransformerEventRecorder.recordTransformation(page.getString("_id"), "page", transformerResponse.result(), request);
						}
					}

					MongoUpdateBuilder modifier = new MongoUpdateBuilder();
					modifier.push("pages", page);

					if (Boolean.TRUE.equals(page.getBoolean("isIndex"))) {
						// Set new page as index
						modifier.set("index", page.getString("_id"));
					}
					// update wiki modified date
					modifier.set("modified", mongoNow);

					mongo.update(collection,
							MongoQueryBuilder.build(query),
							modifier.build(),
							res -> {
								if (res.body() != null && "ok".equals(res.body().getString("status"))) {
									// notify Explorer that wiki has been updated
									wiki.getJsonArray("pages").add(page);
									wiki.put("modified", mongoNow);
									wiki.put("version", System.currentTimeMillis());

									wikiExplorerPlugin.notifyUpsert(user, wiki)
											.onSuccess(e -> handler.handle(new Either.Right<>(page)))
											.onFailure(e -> {
												log.error("[Wiki] Error while notifying Explorer after page creation", e);
												handler.handle(new Either.Left<>(e.getMessage()));
											});
								} else {
									String errorMessage = res.body().getString("message", "");
									log.error("[Wiki] Error while creating page", errorMessage);
									handler.handle(new Either.Left<>(errorMessage));
								}
							});
				});
			}else{
				handler.handle(wikiRes);
			}
		});
	}

	@Override
	public void updatePage(final UserInfos user, final String idWiki, final String idPage, final JsonObject pagePayload,
						   final HttpServerRequest request, Handler<Either<String, JsonObject>> handler) {
		final JsonObject page = new JsonObject(pagePayload.toString());

		// Tiptap Transformer
		Future<ContentTransformerResponse> transformFuture;
		if (!page.getString("content", "").isEmpty()) {
			Set<ContentTransformerFormat> desiredFormats = new HashSet<>();
			desiredFormats.add(ContentTransformerFormat.HTML);
			desiredFormats.add(ContentTransformerFormat.JSON);

			// request to transform page "content" to desiredFormats
			ContentTransformerRequest transformerRequest = new ContentTransformerRequest(
					desiredFormats,
					page.getInteger("contentVersion", 0),
					page.getString("content", ""),
					null
			);

			transformFuture = this.contentTransformerClient.transform(transformerRequest);
		} else {
			transformFuture = Future.succeededFuture();
		}

		transformFuture.onComplete(transformerResponse -> {
			// Mongo update query
			final Bson query = and(
				eq("_id", idWiki),
				elemMatch("pages", new BasicDBObject("_id", idPage))
			);
			// Mongo Modifier
			MongoUpdateBuilder modifier = new MongoUpdateBuilder();

			if (transformerResponse.failed()) {
				log.error("Error while transforming the content", transformerResponse.cause());
			} else {
				if (transformerResponse.result() == null) {
					log.debug("No content transformed.");
				} else {
					modifier.set("pages.$.content", transformerResponse.result().getCleanHtml());
					modifier.set("pages.$.contentVersion", transformerResponse.result().getContentVersion());
					modifier.set("pages.$.jsonContent", transformerResponse.result().getJsonContent());
					modifier.unset("pages.$.oldContent");
					// Record transformation event
					contentTransformerEventRecorder.recordTransformation(idPage, "page", transformerResponse.result(), request);
				}
			}

			// Update fields if present in the payload
			if (!page.getString("title", "").isEmpty()) {
				modifier.set("pages.$.title", page.getString("title"));
			}
			if (page.getBoolean("isVisible", null) != null) {
				modifier.set("pages.$.isVisible", page.getBoolean("isVisible"));
			}
			if (page.getInteger("position", null) != null) {
				modifier.set("pages.$.position", page.getInteger("position"));
			}

			if (page.containsKey("parentId") && page.getString("parentId") == null) {
				modifier.unset("pages.$.parentId");
			} else if (!page.getString("parentId", "").isEmpty()) {
				modifier.set("pages.$.parentId", page.getString("parentId"));
			}

			modifier.set("pages.$.lastContributer", user.getUserId());
			modifier.set("pages.$.lastContributerName", user.getUsername());

			JsonObject now = MongoDb.now();
			modifier.set("pages.$.modified", now);
			modifier.set("modified", now);

			if (Boolean.TRUE.equals(page.getBoolean("isIndex", false))) {
				// Set updated page as index
				modifier.set("index", idPage);
			} else if (Boolean.TRUE.equals(page.getBoolean("wasIndex", false))) {
				// Unset index when the value of isIndex has changed from true to false
				modifier.unset("index");
			}

			// before updating the page with new values,
			// we get the previous page values from database to manage visibility update and revision creation
			this.getPage(idWiki, idPage, request, false, getPageRes -> {
				if (getPageRes.isRight()) {
					JsonObject dbPage = getPageRes.right().getValue();

					// Mongo Update
					mongo.update(collection,
							MongoQueryBuilder.build(query),
							modifier.build(),
							updateResult -> {
								if (updateResult.body() != null
										&& "ok".equals(updateResult.body().getString("status"))) {
									// if page visibility has changed then we update visibility for sub pages too
									final List<Future> futures = new ArrayList<>();
									if (Boolean.compare(
											page.getBoolean("isVisible", false),
											dbPage.getBoolean("isVisible", false)) != 0) {
										final Future<Void> updateSubpagesVisibilityFuture = this.updateSubpagesVisibility(
												idWiki,
												idPage,
												page.getBoolean("isVisible", false));
										futures.add(updateSubpagesVisibilityFuture);
									}

									// Create or update revision
									// if page was not visible and is still not visible then we udpate the last revision
									if (Boolean.FALSE.equals(dbPage.getBoolean("isVisible"))
										&& Boolean.FALSE.equals(page.getBoolean("isVisible"))) {
										Future<Void> lastRevisionFuture = this.updateLastRevision(
												idPage
												, page.getString("title")
												, page.getString("content")
												, page.getBoolean("isVisible")
												, page.getInteger("position"));
										futures.add(lastRevisionFuture);
									} else { // otherwise we create a new revision
										final Future<Void> createRevisionFuture = this.createRevision(
												idWiki,
												idPage,
												user,
												page.getString("title", dbPage.getString("title")),
												page.getString("content", dbPage.getString("content")),
												page.getBoolean("isVisible", dbPage.getBoolean("isVisible")),
												page.getInteger("position", dbPage.getInteger("position")));
										futures.add(createRevisionFuture);
									}

									CompositeFuture
										.all(futures)
										.onSuccess(res -> {
											// notify Explorer that wiki has been updated
											this.getWiki(idWiki, wikiRes -> {
												if (wikiRes.isRight()) {
													final JsonObject wiki = wikiRes.right().getValue();
													wiki.put("version", System.currentTimeMillis());
													wikiExplorerPlugin.notifyUpsert(user, wiki)
															.onSuccess(e -> handler.handle(new Either.Right<>(page)))
															.onFailure(e -> {
																log.error("[Wiki] Error while notifying Explorer after page update", e);
																handler.handle(new Either.Left<>(e.getMessage()));
															});
												} else {
													log.error("[Wiki] Error while updating page", wikiRes.left().getValue());
													handler.handle(new Either.Left<>(wikiRes.left().getValue()));
												}
											});
										})
										.onFailure(err -> {
											log.error("[Wiki] Error while updating page", err);
											handler.handle(new Either.Left<>(err.getMessage()));
										});
								} else {
									String errorMessage = updateResult.body().getString("message", "");
									log.error(errorMessage);
									handler.handle(new Either.Left<>(errorMessage));
								}
							});
				} else {
					String errorMessage = "[Wiki] Error when updating page: page with id " + idPage + " was not found.";
					log.error(errorMessage);
					handler.handle(new Either.Left<>(errorMessage));
				}
			});
		});
	}

	@Override
	public Future<PageListResponse> updatePageList(UserInfos user, String idWiki, PageListRequest pageList) {
		if(pageList.getPages().isEmpty()){
			return Future.succeededFuture(new PageListResponse(Collections.emptyList()));
		}
		final Promise<PageListResponse> promise = Promise.promise();
		final JsonArray commmands = new JsonArray();
		for(final PageListEntryFlat entry : pageList.getPages()){
			final JsonObject criteria = new JsonObject().put("_id", idWiki).put("pages._id", entry.getId());
			final JsonObject set = new MongoUpdateBuilder()
					.set("pages.$.position", entry.getPosition())
					.set("pages.$.isVisible", entry.getIsVisible())
					.set("pages.$.parentId", entry.getParentId()).build();
			commmands.add(new JsonObject().put("operation", "update").put("document", set).put("criteria", criteria));
		}
		mongo.bulk(collection, commmands, result -> {
			if ("ok".equals(result.body().getString("status"))) {
				final PageListResponse response = new PageListResponse(pageList);
				promise.complete(response);
			} else {
				promise.fail(result.body().getString("message"));
			}
		});
		return promise.future();
	}

	/**
	 * Update visibility for subpages.
	 * @param idWiki id of the related wiki
	 * @param idPage id of the Parent page
	 * @param isVisible the visibility of the parent page
	 * @return Future
	 */
	private Future<Void> updateSubpagesVisibility(String idWiki, String idPage, boolean isVisible) {
		final Promise<Void> promise = Promise.promise();

		// Mongo Query
		final Bson visibilityQuery = eq("_id", idWiki);

		// Mongo Modifier
		MongoUpdateBuilder visibilityModifier = new MongoUpdateBuilder();
		visibilityModifier.set("pages.$[elem].isVisible", isVisible);

		// Mongo arrayFilters
		JsonArray arrayFilters = new JsonArray()
				.add(new JsonObject().put("elem.parentId", idPage));

		// Mongo Update
		mongo.update(collection,
				MongoQueryBuilder.build(visibilityQuery),
				visibilityModifier.build(),
				arrayFilters,
				res -> {
					if ("ok".equals(res.body().getString("status"))) {
						promise.complete();
					} else {
						promise.fail(res.body().getString("message"));
					}
				});

		return promise.future();
	}
	@Override
	public Future<Map<String, List<String>>> deletePage(UserInfos user, JsonObject wiki, String idPage) {
		final Set<String> idPages = new HashSet<>();
		idPages.add(idPage);
		return deletePages(user, wiki, idPages);
	}

	@Override
	public Future<Map<String, List<String>>> deletePages(UserInfos user, JsonObject wiki, Set<String> idPages) {
		// Page IDs to delete
		final List<String> pageIDsToDelete = new ArrayList<>();

		// Subpages IDs that will become a page
		final List<String> subpageIDsToPage = new ArrayList<>();

		// Map of authorId and pageIDs, used to send notification if manager deletes their page
		final Map<String, List<String>> authorPagesNotifyMap = new HashMap<>();

		// We implement the following rules:
		// - if manager:
		//   => delete all subpages + pages matching idPages
		// - if contrib:
		//   => if user is author: delete subpages + pages matching idPages
		//   => if user is NOT author:  subpages will become pages
		final Promise<Map<String, List<String>>> promise = Promise.promise();

		final JsonArray toDeletePages = new JsonArray()
				.addAll(getPages(wiki, idPages))
				.addAll(getSubPages(wiki, idPages));

		if (!toDeletePages.isEmpty()) {
			toDeletePages.stream()
					.map(page -> (JsonObject) page)
					.forEach(jsonPage -> {
						String pageId = jsonPage.getString("_id");
						String authorId = jsonPage.getString("author");

						if (isManager(wiki, user)) {
							pageIDsToDelete.add(pageId);

							// if user is not author then add author and page to the notify map
							if (!isPageAuthor(jsonPage, user.getUserId())) {
								authorPagesNotifyMap
										.computeIfAbsent(authorId, k -> new ArrayList<>())
										.add(pageId);
							}
						} else if (isContrib(wiki, user)) {
							if (isPageAuthor(jsonPage, user.getUserId())) {
								pageIDsToDelete.add(pageId);
							} else {
								subpageIDsToPage.add(pageId);
							}
						}
					});
		}

		final List<Future> futures = new ArrayList<>();
		// Delete subpages in "pageIDsToDelete"
		final Promise<Void> subpagesDeletePromise = Promise.promise();
		futures.add(subpagesDeletePromise.future());
		// Mongo query
		final Bson subpagesDeleteQuery = eq("_id", wiki.getString("_id"));
		// Mongo modifier
		final MongoUpdateBuilder subpagesDeleteModifier = new MongoUpdateBuilder();
		subpagesDeleteModifier.pull("pages", MongoQueryBuilder.build(in("_id", pageIDsToDelete)));
		subpagesDeleteModifier.set("modified", MongoDb.now());
		// Execute query
		mongo.update(collection,
				MongoQueryBuilder.build(subpagesDeleteQuery),
				subpagesDeleteModifier.build(),
				deleteSubpagesRes -> {
					if ("ok".equals(deleteSubpagesRes.body().getString("status"))) {
						// Notify audience of deletion
						audienceHelper.notifyResourcesDeletion("wiki", "page", new HashSet<>(pageIDsToDelete))
								.onFailure(th -> log.error("Failed to notify audience of post deletion", th));
						// Complete promise
						subpagesDeletePromise.complete();
					} else {
						subpagesDeletePromise.fail(deleteSubpagesRes.body().getString("message"));
					}
				});

		// Converting subpages to pages for subpages in "subpageIDsToPage"
		final Promise<Void> subpagesToPagesPromise = Promise.promise();
		futures.add(subpagesToPagesPromise.future());

		if (!subpageIDsToPage.isEmpty()) {
			// Mongo query
			final Bson subpagesToPageQuery = eq("_id", wiki.getString("_id"));
			// Mongo modifier
			final MongoUpdateBuilder subpagesToPageModifier = new MongoUpdateBuilder();
			subpagesToPageModifier.unset("pages.$[elem].parentId");
			subpagesToPageModifier.set("modified", MongoDb.now());
			// Mongo arrayFilters
			final JsonArray arrayFilters = new JsonArray()
					.add(MongoQueryBuilder.build(in("elem._id", subpageIDsToPage)));
			// Execute query
			mongo.update(collection,
					MongoQueryBuilder.build(subpagesToPageQuery),
					subpagesToPageModifier.build(),
					arrayFilters,
					subpagesToPagesRes -> {
						if ("ok".equals(subpagesToPagesRes.body().getString("status"))) {
							subpagesToPagesPromise.complete();
						} else {
							subpagesToPagesPromise.fail(subpagesToPagesRes.body().getString("message"));
						}

					});
		} else {
			subpagesToPagesPromise.complete();
		}
		CompositeFuture.all(futures).mapEmpty()
				.onSuccess(res -> promise.complete(authorPagesNotifyMap))
				.onFailure(err -> promise.fail(err.getMessage()));
		return promise.future();
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	public void unsetIndex(String idWiki, String idPage,
			Handler<Either<String, JsonObject>> handler) {

		final Bson query = and(eq("_id", idWiki), eq("index", idPage));

		MongoUpdateBuilder modifier = new MongoUpdateBuilder();
		modifier.unset("index");

		mongo.update(collection, MongoQueryBuilder.build(query),
				modifier.build(),
				MongoDbResult.validActionResultHandler(handler));
	}

	@Override
	public void addComment(UserInfos user, String idWiki, String idPage, String newCommentId,
			String comment, String replyTo, Handler<Either<String, JsonObject>> handler) {

		// Query
		BasicDBObject idPageDBO = new BasicDBObject("_id", idPage);
		final Bson query = and(eq("_id", idWiki), elemMatch("pages", idPageDBO));

		// Add new comment to array "comments"
		JsonObject newComment = new JsonObject();
		newComment.put("_id", newCommentId)
				.put("comment", comment)
				.put("author", user.getUserId())
				.put("authorName", user.getUsername())
				.put("created", MongoDb.now());

		if (replyTo != null && !replyTo.isEmpty()) {
			newComment.put("replyTo", replyTo);
		}

		MongoUpdateBuilder modifier = new MongoUpdateBuilder();
		modifier.push("pages.$.comments", newComment);

		mongo.update(collection, MongoQueryBuilder.build(query),
				modifier.build(), MongoDbResult.validActionResultHandler(handler));
	}

	@Override
	public void deleteComment(String idWiki, String idPage, String idComment,
			Handler<Either<String, JsonObject>> handler){
		// Query
		BasicDBObject idPageDBO = new BasicDBObject("_id", idPage);
		final Bson query = and(eq("_id", idWiki), elemMatch("pages", idPageDBO));

		// feat #WB2-1941
		// The specification says:
		// Dans le cas d’un commentaire supprimé une carte de type commentaire est affiché
		// contenant uniquement l’information suivante : contenu supprimé
		// Les réponses sont maintenues dans le fil, elles sont toujours visibles
		// si le gestionnaire ne les a pas supprimées.
		//
		// So we unset the comment content and author for RGPD compliance
		// and keep the comment id and creation date to keep the history
		// and add a deleted field to indicate that the comment has been deleted
		final MongoUpdateBuilder modifier = new MongoUpdateBuilder();
		modifier.unset("pages.$[page].comments.$[comment].comment");
		modifier.unset("pages.$[page].comments.$[comment].author");
		modifier.unset("pages.$[page].comments.$[comment].authorName");
		modifier.set("pages.$[page].comments.$[comment].deleted", true);

		final JsonArray arrayFilters = new JsonArray()
				.add(new JsonObject().put("page._id", idPage))
				.add(new JsonObject().put("comment._id", idComment));

		mongo.update(collection,
				MongoQueryBuilder.build(query),
				modifier.build(),
				arrayFilters,
				MongoDbResult.validActionResultHandler(handler));
	}

	@Override
	public void updateComment(String idWiki, String idPage, String idComment, String comment,
							  Handler<Either<String, JsonObject>> handler) {
		// Mongo Query
		final Bson query = and(eq("_id", idWiki), elemMatch("pages", new BasicDBObject("_id", idPage)));

		// Mongo Modifier
		MongoUpdateBuilder modifier = new MongoUpdateBuilder();
		modifier.set("pages.$[page].comments.$[comment].comment", comment)
				.set("pages.$[page].comments.$[comment].modified", MongoDb.now());

		// Mongo ArrayFilters
		JsonArray arrayFilters = new JsonArray()
				.add(new JsonObject().put("page._id", idPage))
				.add(new JsonObject().put("comment._id", idComment));

		mongo.update(collection,
				MongoQueryBuilder.build(query),
				modifier.build(),
				arrayFilters,
				MongoDbResult.validActionResultHandler(handler));
	}

	@Override
	public Future<Void> createRevision(String wikiId, String pageId, UserInfos user, String pageTitle,
										 String pageContent, boolean isVisible, Integer position) {
		final Promise<Void> promise = Promise.promise();

		final JsonObject document = new JsonObject()
				.put("wikiId", wikiId)
				.put("pageId", pageId)
				.put("userId", user.getUserId())
				.put("username", user.getUsername())
				.put("title", pageTitle)
				.put("content", pageContent)
				.put("isVisible", isVisible)
				.put("position", position)
				.put("date", MongoDb.now());

		mongo.save(REVISIONS_COLLECTION, document, res -> {
			if ("ok".equals(res.body().getString("status"))) {
				promise.complete();
			} else {
				log.error("Error creating revision " + wikiId + "/" + pageId + " - " + res.body().getString("message"));
				promise.fail(res.body().getString("message"));
			}
		});

		return promise.future();
	}

	@Override
	public void listRevisions(String wikiId, String pageId, Handler<Either<String, JsonArray>> handler) {
		final Bson query = and(eq("wikiId", wikiId), eq("pageId", pageId));
		JsonObject sort = new JsonObject().put("date", -1);
		JsonObject projection = new JsonObject().put("oldContent", 0);
		mongo.find(REVISIONS_COLLECTION, MongoQueryBuilder.build(query), sort, projection,
				MongoDbResult.validResultsHandler(handler));
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	public void getRevisionById(String revisionId, Handler<Either<String, JsonObject>> handler) {
		final Bson query = eq("_id", revisionId);
		JsonObject projection = new JsonObject().put("oldContent", 0);
		mongo.findOne(REVISIONS_COLLECTION, MongoQueryBuilder.build(query), projection, null,
				MongoDbResult.validResultHandler(handler));
	}

	@Override
	public void deleteRevisions(String wikiId, String pageId, Handler<Either<String, JsonObject>> handler) {
		Bson query = eq("wikiId", wikiId);
		if (pageId != null && !pageId.trim().isEmpty()) {
			query = and(query, eq("pageId", pageId));
		}
		mongo.delete(REVISIONS_COLLECTION, MongoQueryBuilder.build(query), MongoDbResult.validResultHandler(handler));
	}

	@Override
	public Future<List<PageId>> duplicatePage(UserInfos user, String sourceWikiId, String sourcePageId, List<String> targetWikiIdList, boolean shouldIncludeSubPages) {
		final Promise<List<PageId>> globalPromise = Promise.promise();
		final List<PageId> duplicatedPageIds = new ArrayList<>();

		// Get the source wiki
		getWiki(sourceWikiId, true, sourceWikiRes -> {
			// If the source wiki is not found, return an error
			if (sourceWikiRes.isLeft()) {
				globalPromise.fail("wiki.source.not.found");
				return;
			}
			// Get the source wiki
			final JsonObject sourceWiki = sourceWikiRes.right().getValue();
			// Get the source pages
			final JsonArray pages = sourceWiki.getJsonArray("pages", new JsonArray());

			// Find the source page
			final Optional<Object> sourcePageOpt = pages.stream()
					.filter(p -> sourcePageId.equals(((JsonObject)p).getString("_id")))
					.findFirst();

			if (!sourcePageOpt.isPresent()) {
				globalPromise.fail("wiki.page.source.not.found");
				return;
			}
			// Get the source page
			final JsonObject sourcePage = (JsonObject) sourcePageOpt.get();
			// Get the source subpages
			final JsonArray sourceSubPages = getSubPages(sourceWiki, Collections.singleton(sourcePageId));

			// Create futures for each target wiki
			final List<Future<Void>> futures = new ArrayList<>();
			for (String targetWikiId : targetWikiIdList) {
				// Generate a new page ID
				final String newPageId = new ObjectId().toString();
				// Add the new page ID to the list of duplicated page IDs
				duplicatedPageIds.add(new PageId(newPageId, targetWikiId));

				// Duplicate the page
				final JsonObject newPage = sourcePage.copy();
				// Set the new page properties
				newPage.put("_id", newPageId)
					   .put("author", user.getUserId())
					   .put("authorName", user.getUsername())
					   .put("created", MongoDb.now())
					   .put("modified", MongoDb.now())
					   .put("contentVersion", 1)
						.put("comments", new JsonArray())
					   .remove("parentId");

				// Duplicate subpages
				final JsonArray newSubPages = new JsonArray();
				final JsonArray newChildren = new JsonArray();
				if (shouldIncludeSubPages && !sourceSubPages.isEmpty()) {
					for (Object subPage : sourceSubPages) {
						// Get the source subpage
						final JsonObject sourceSubPage = (JsonObject) subPage;
						// Duplicate the source subpage
						final JsonObject newSubPage = sourceSubPage.copy();
						// Generate a new subpage ID
						final String newSubPageId = new ObjectId().toString();
						// Set the new subpage properties
						newSubPage.put("_id", newSubPageId)
								 .put("parentId", newPageId)
								 .put("author", user.getUserId())
								 .put("authorName", user.getUsername())
								 .put("created", MongoDb.now())
								 .put("modified", MongoDb.now())
								 .put("contentVersion", 1);
						// reset comments
						newSubPage.put("comments", new JsonArray());
						// Add the new subpage to the new subpages array
						newSubPages.add(newSubPage);
						// Add child reference to parent page
						final JsonObject child = new JsonObject()
								.put("_id", newSubPageId)
								.put("title", newSubPage.getString("title"))
								.put("isVisible", newSubPage.getBoolean("isVisible"))
								.put("position", newSubPage.getInteger("position"));
						newChildren.add(child);
					}
				}
				// Add children array to parent page
				newPage.put("children", newChildren);

				// Add the page and its subpages to the target wiki
				final Bson query = eq("_id", targetWikiId);
				// Create a JsonArray with all pages to add
				final JsonArray allPages = new JsonArray().add(newPage);
				allPages.addAll(newSubPages);

				// Create the query with JsonObject
				final JsonObject update = new JsonObject()
					.put("$push", new JsonObject()
						.put("pages", new JsonObject()
							.put("$each", allPages)
						)
					);

				// Create a future for the target wiki
				final Future<Void> future = getWikiById(targetWikiId).compose(targetWiki -> {
					// Set the position of the new page
					newPage.put("position", getMaxPagePosition(targetWiki) + 1);
					// Check whether the user is manager of the targetWiki
					if(!isManager(targetWiki, user)){
						// if not manager => make pages visible
						allPages.forEach(object -> {
							final JsonObject page = (JsonObject) object;
							page.put("isVisible", true);
						});
					}
					// Update the target wiki
					return Future.future(updatePromise -> {
						mongo.update(collection, MongoQueryBuilder.build(query), update, res -> {
							if ("ok".equals(res.body().getString("status"))) {
								updatePromise.complete();
							} else {
								updatePromise.fail(res.body().getString("message"));
							}
						});
					});
				});
				// Add the future to the list of futures
				futures.add(future);
			}

			// Wait for all duplications to be completed
			Future.all(futures)
				.onSuccess(res -> globalPromise.complete(duplicatedPageIds))
				.onFailure(err -> globalPromise.fail(err.getMessage()));
		});

		return globalPromise.future();
	}

	/**
	 * Return Subpages from a Page with given pageId.
	 * @param wiki the wiki containing the page we want to get subpages
	 * @param pageIds the page IDs we want to get subpages
	 * @return JsonArray<Page> page subpages IDs
	 */
	public static JsonArray getSubPages(final JsonObject wiki, final Collection<String> pageIds) {
		JsonArray subPages = new JsonArray();

		if (wiki != null) {
			final JsonArray pages = wiki.getJsonArray("pages");
			pages.forEach(page -> {
				final JsonObject pageJO = (JsonObject) page;
				final String parentId = pageJO.getString("parentId");

				if (!StringUtils.isEmpty(parentId) && pageIds.contains(parentId)) {
					subPages.add(pageJO);
				}
			});
		}
		return subPages;
	}
	/**
	 * Return pages from a Page with given _id.
	 * @param wiki the wiki containing the page we want to get subpages
	 * @param pageIds the page IDs we want to get
	 * @return JsonArray<Page> page IDs
	 */
	public static JsonArray getPages(final JsonObject wiki, final Collection<String> pageIds) {
		JsonArray matchingPages = new JsonArray();

		if (wiki != null) {
			final JsonArray pages = wiki.getJsonArray("pages");
			pages.forEach(page -> {
				final JsonObject pageJO = (JsonObject) page;
				final String _id = pageJO.getString("_id");

				if (!StringUtils.isEmpty(_id) && pageIds.contains(_id)) {
					matchingPages.add(pageJO);
				}
			});
		}
		return matchingPages;
	}

	// TODO: this method is coming from Explorer project -> centralize this in entcore
	// but be careful: the owner property in resource is different from app to app
	// in Wiki it is "owner" but in other app it may be "createdBy"
	public static boolean isManager(final JsonObject wiki, final UserInfos user) {
		final String userId = user.getUserId();
		final JsonArray rights = wiki.getJsonArray("rights");

		// Check if we are the owner
		if (rights == null) {
		    if (userId != null && wiki.getJsonObject("owner") != null) {
				return userId.equals(wiki.getJsonObject("owner").getString("userId"));
			}
		} else { // Otherwise check rights
			final Set<String> myAdminRights = new HashSet<>();
			myAdminRights.add(ShareRoles.Manager.getSerializedForUser(userId));
			myAdminRights.add(ShareRoles.getSerializedForCreator(userId));
			final List<String> groupIds = user.getGroupsIds();
			if (groupIds != null) {
				for (String groupId : user.getGroupsIds()) {
					myAdminRights.add(ShareRoles.Manager.getSerializedForGroup(groupId));
				}
			}
			return rights.stream().anyMatch(myAdminRights::contains);
		}

		return false;
	}

	// TODO: centralize this in entcore
	public static boolean isContrib(final JsonObject wiki, final UserInfos user) {
		final JsonArray rights = wiki.getJsonArray("rights");

		if (rights != null) {
			final Set<String> myRights = new HashSet<>();
			myRights.add(ShareRoles.Contrib.getSerializedForUser(user.getUserId()));

			final List<String> groupIds = user.getGroupsIds();
			if(groupIds != null) {
				for (String groupId : user.getGroupsIds()) {
					myRights.add(ShareRoles.Contrib.getSerializedForGroup(groupId));
				}
			}

			return rights.stream().anyMatch(myRights::contains);
		}

		return false;
	}

	public static boolean isPageAuthor(final JsonObject page, final String userId) {
		return page.getString("author") != null
				&& page.getString("author").equals(userId);
	}

	public static String getPageTitle(JsonObject wiki, String pageId) {
		final JsonObject page = wiki.getJsonArray("pages")
				.stream()
				.map(p -> (JsonObject) p)
				.filter(pageJson -> pageJson.getString("_id") != null
						&& pageJson.getString("_id").equals(pageId))
				.findFirst()
				.orElse(null);

		return page != null ? page.getString("title") : "";
	}

	private Future<JsonObject> getLastRevisionByPageId(String pageId) {
		final Promise<JsonObject> promise = Promise.promise();

		final Bson query = eq("pageId", pageId);
		final JsonObject sort = new JsonObject().put("date", -1);
		final JsonObject projection = new JsonObject().put("oldContent", 0).put("content", 0);
		final int skip = 0;
		final int limit = 1;
		final int batchSize = 1;

		mongo.find(REVISIONS_COLLECTION, MongoQueryBuilder.build(query), sort, projection, skip, limit, batchSize, res -> {
			if ("ok".equals(res.body().getString("status"))) {
				// if OK returns the Promise with the last revision found
				promise.complete(res.body());
			} else {
				log.error("Error retrieving the last revision for page "
						+ pageId + " - " + res.body().getString("message"));
				promise.fail(res.body().getString("message"));
			}
		});

		return promise.future();
	}

	private Future<Void> updateLastRevision(String pageId, String pageTitle, String pageContent,
											boolean isVisible, Integer position) {
		final Promise<Void> promise = Promise.promise();

		Future<JsonObject> lastRevisionFuture = this.getLastRevisionByPageId(pageId);
		lastRevisionFuture
				.onSuccess(lastRevisionRes -> {
					JsonArray result = lastRevisionRes.getJsonArray("results");
					if (!result.isEmpty()) {
						JsonObject lastRevision = result.getJsonObject(0);

						final Bson query = eq("_id", lastRevision.getString("_id"));

						final MongoUpdateBuilder modifier = new MongoUpdateBuilder();
						modifier.set("title", pageTitle)
								.set("content", pageContent)
								.set("isVisible", isVisible)
								.set("position", position)
								.set("date", MongoDb.now());

						mongo.update(REVISIONS_COLLECTION, MongoQueryBuilder.build(query), modifier.build(), res -> {
							if ("ok".equals(res.body().getString("status"))) {
								promise.complete();
							} else {
								log.error("Error updating revision " + lastRevision.getString("_id") + " - " + res.body().getString("message"));
								promise.fail(res.body().getString("message"));
							}
						});
					} else {
						String errorMessage = "Error retrieving last revision of page: " + pageId;
						log.error(errorMessage);
						promise.fail(errorMessage);
					}
				});

		return promise.future();
	}

	private Integer getMaxPagePosition(final JsonObject wiki){
		if (wiki != null) {
			JsonArray pages = wiki.getJsonArray("pages", new JsonArray());
			// Find the max position
			int maxPosition = pages.stream()
					.map(p -> ((JsonObject)p).getInteger("position", 0))
					.max(Integer::compareTo)
					.orElse(-1);
			return maxPosition;
		} else {
			return 0;
		}
	}

	private Future<JsonObject> getWikiById(String wikiId) {
		final Promise<JsonObject> promise = Promise.promise();
		
		// Get the wiki with the pages position
		final Bson query = eq("_id", wikiId);
		final JsonObject projection = new JsonObject().put("pages.position", 1).put("owner", 1).put("shared", true);
		mongo.findOne(collection, MongoQueryBuilder.build(query), projection, res -> {
			if ("ok".equals(res.body().getString("status"))) {
				final JsonObject wiki = res.body().getJsonObject("result");
				promise.complete(wiki);
			} else {
				promise.fail(res.body().getString("message"));
			}
		});
		
		return promise.future();
	}

	/**
	 * Called by the audience rights checker when querying Audience APIs.
	 * @param audienceCheckRightRequestMessage
	 * @return Future<Boolean> true if user has rights to retrieve data about the pages.
	 */
	@Override
	public Future<Boolean> apply(AudienceCheckRightRequestMessage audienceCheckRightRequestMessage) {
		final String userId = audienceCheckRightRequestMessage.getUserId();
		final Set<String> userGroupsIds = audienceCheckRightRequestMessage.getUserGroups();

		return this.hasAccessRightsOnAllPages(userId, userGroupsIds, audienceCheckRightRequestMessage.getResourceIds());
	}

	/**
	 * Check if the user has access right on all pages.
	 * @param userId
	 * @param userGroupsIds
	 * @param pagesIds
	 * @return
	 */
	private Future<Boolean> hasAccessRightsOnAllPages(final String userId, final Set<String> userGroupsIds,
												final Set<String> pagesIds) {
		final Promise<Boolean> promise = Promise.promise();

		final Bson query = elemMatch("pages", in("_id", pagesIds));

		mongo.findOne(collection, MongoQueryBuilder.build(query), res -> {
			if ("ok".equals(res.body().getString("status"))) {
				final JsonObject wiki = res.body().getJsonObject("result");
				if (wiki != null) {
					// Check if user is manager or has rights on the wiki
					UserInfos userInfos = new UserInfos();
					userInfos.setUserId(userId);
					userInfos.setGroupsIds(new ArrayList<>(userGroupsIds));

					if (isManager(wiki, userInfos) || isContrib(wiki, userInfos)) {
						promise.complete(Boolean.TRUE);
					} else {
						promise.complete(Boolean.FALSE);
					}
				} else {
					promise.complete(Boolean.FALSE);
				}
			} else {
				promise.fail(res.body().getString("message"));
			}
		});

		return promise.future();

	}
}
