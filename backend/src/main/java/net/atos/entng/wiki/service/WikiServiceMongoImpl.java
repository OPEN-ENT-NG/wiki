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

import static net.atos.entng.wiki.Wiki.REVISIONS_COLLECTION;

import java.util.*;
import java.util.stream.Collectors;

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
import net.atos.entng.wiki.explorer.WikiExplorerPlugin;
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

import com.mongodb.BasicDBObject;
import com.mongodb.DBObject;
import com.mongodb.QueryBuilder;

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

	public WikiServiceMongoImpl(final String collection, final WikiExplorerPlugin plugin, final IContentTransformerClient contentTransformerClient) {
		super(collection);
		this.collection = collection;
		this.mongo = MongoDb.getInstance();
		this.wikiExplorerPlugin = plugin;
		this.shareNormalizer = new ShareNormalizer(this.wikiExplorerPlugin.getSecuredActions());
		this.contentTransformerClient = contentTransformerClient;
	}

	@Override
	public void getWiki(String id, Handler<Either<String, JsonObject>> handler) {
		QueryBuilder query = QueryBuilder.start("_id").is(id);

		JsonObject projection = new JsonObject()
				.put("pages.content", 0)
				.put("pages.contentPlain", 0)
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
								.put("title", pageJO.getString("title"));
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
		List<DBObject> groups = new ArrayList<>();
		groups.add(QueryBuilder.start("userId").is(user.getUserId()).get());
		if(!user.getGroupsIds().isEmpty()){
			groups.add(QueryBuilder.start("groupId").in(new JsonArray(user.getGroupsIds())).get());
		}
		QueryBuilder query = new QueryBuilder().or(
				QueryBuilder.start("owner.userId").is(user.getUserId()).get(),
				QueryBuilder
						.start("shared")
						.elemMatch(
								new QueryBuilder().or(
										groups.toArray(new DBObject[groups
												.size()])).get()).get());

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
		final QueryBuilder query = QueryBuilder.start("_id").is(idWiki);

		JsonObject projection = new JsonObject()
				.put("_id", 0)
				.put("title", 0)
				.put("thumbnail", 0)
				.put("created", 0)
				.put("modified", 0)
				.put("owner", 0)
				.put("index", 0);

		if (!Boolean.parseBoolean(getContent)) {
			projection
					.put("pages.content", 0)
					.put("pages.contentPlain", 0)
					.put("pages.jsonContent", 0)
					.put("pages.contentVersion", 0);
		}

		mongo.findOne(collection, MongoQueryBuilder.build(query), projection,
				MongoDbResult.validResultHandler(handler));
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
	public void getPage(final String idWiki, final String idPage, final HttpServerRequest request,
			final Handler<Either<String, JsonObject>> handler) {
		QueryBuilder query = QueryBuilder
				.start("_id").is(idWiki)
				.put("pages._id").is(idPage);

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
			Future<ContentTransformerResponse> contentTransformerResponseFuture;
			if (page.containsKey("jsonContent")) {
				log.debug("Page has already been transformed, nothing to do.");
				contentTransformerResponseFuture = Future.succeededFuture();
			} else {
				Set<ContentTransformerFormat> desiredFormats = new HashSet<>();
				desiredFormats.add(ContentTransformerFormat.HTML);
				desiredFormats.add(ContentTransformerFormat.JSON);
				desiredFormats.add(ContentTransformerFormat.PLAINTEXT);

				ContentTransformerRequest transformerRequest = new ContentTransformerRequest(
						desiredFormats,
						0,
						page.getString("content"),
						null
				);

				contentTransformerResponseFuture = contentTransformerClient.transform(transformerRequest, request);
			}

			contentTransformerResponseFuture.onComplete(transformerResponse -> {
				if (transformerResponse.failed()) {
					log.error("Content transformation failed", transformerResponse.cause());
					handler.handle(new Either.Left<>(transformerResponse.cause().getMessage()));
					return;
				} else {
					if (transformerResponse.result() == null) {
						log.info("No content transformed");
						handler.handle(new Either.Right<>(page));
						return;
					} else {
						// contentVersion set to 0 to indicate that content has been transformed for the first time.
						page
								.put("contentVersion", 0)
								.put("jsonContent", transformerResponse.result().getJsonContent())
								.put("content", transformerResponse.result().getCleanHtml())
								.put("contentPlain", transformerResponse.result().getPlainTextContent());

						// Update query
						BasicDBObject idPageDBO = new BasicDBObject("_id", idPage);
						QueryBuilder queryUpdatePage = QueryBuilder.start("_id").is(idWiki).put("pages")
								.elemMatch(idPageDBO);
						MongoUpdateBuilder modifier = new MongoUpdateBuilder()
								.set("pages.$.contentVersion", page.getInteger("contentVersion"))
								.set("pages.$.jsonContent", page.getJsonObject("jsonContent"))
								.set("pages.$.content", page.getString("content"))
								.set("pages.$.contentPlain", page.getString("contentPlain"));

						mongo.update(collection, MongoQueryBuilder.build(queryUpdatePage), modifier.build(), event -> {
							handler.handle(new Either.Right<>(page));
						});
					}
				}
			});
		});
	}

	@Override
	public void createPage(final UserInfos user, final String wikiId, final JsonObject page,
						   final HttpServerRequest request, final Handler<Either<String, JsonObject>> handler) {
		QueryBuilder query = QueryBuilder.start("_id").is(wikiId);

		// Add extra fields to page
		page
				.put("_id", page.getString("_id"))
				.put("author", user.getUserId())
				.put("authorName", user.getUsername())
				.put("modified", MongoDb.now())
				.put("created", MongoDb.now());

		// Tiptap Transformer
		Future<ContentTransformerResponse> contentTransformerResponseFuture;
		if (page.containsKey("content")) {
			Set<ContentTransformerFormat> desiredFormats = new HashSet<>();
			desiredFormats.add(ContentTransformerFormat.HTML);
			desiredFormats.add(ContentTransformerFormat.JSON);
			desiredFormats.add(ContentTransformerFormat.PLAINTEXT);

			// request to transform page "content" to desiredFormats
			ContentTransformerRequest transformerRequest = new ContentTransformerRequest(
					desiredFormats,
					page.getInteger("contentVersion", 0),
					page.getString("content", ""),
					null
			);

			contentTransformerResponseFuture = this.contentTransformerClient
					.transform(transformerRequest, request);
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
					page.put("contentPlain", transformerResponse.result().getPlainTextContent());
				}
			}

			MongoUpdateBuilder modifier = new MongoUpdateBuilder();
			modifier.push("pages", page);

			if (Boolean.TRUE.equals(page.getBoolean("isIndex"))) {
				// Set new page as index
				modifier.set("index", page.getString("_id"));
			}

			mongo.update(collection, MongoQueryBuilder.build(query),
					modifier.build(),
					MongoDbResult.validActionResultHandler(handler));
		});
	}

	@Override
	public void updatePage(final UserInfos user, final String idWiki, final JsonObject page,
						   final HttpServerRequest request, Handler<Either<String, JsonObject>> handler) {
		// get existing page to compare page values
		this.getPage(idWiki, page.getString("_id"), request, getPageResult -> {
			if (getPageResult.isRight()) {
				JsonObject dbPage = getPageResult.right().getValue();

				// if title, content or visibility has changed then we update the page
				if (pageHasChanged(page, dbPage)) {
					// Preparing the Mongo Update...
					// Tiptap Transformer
					Future<ContentTransformerResponse> contentTransformerResponseFuture;
					if (page.containsKey("content")) {
						Set<ContentTransformerFormat> desiredFormats = new HashSet<>();
						desiredFormats.add(ContentTransformerFormat.HTML);
						desiredFormats.add(ContentTransformerFormat.JSON);
						desiredFormats.add(ContentTransformerFormat.PLAINTEXT);

						// request to transform page "content" to desiredFormats
						ContentTransformerRequest transformerRequest = new ContentTransformerRequest(
								desiredFormats,
								page.getInteger("contentVersion", 0),
								page.getString("content", ""),
								null
						);

						contentTransformerResponseFuture = this.contentTransformerClient
								.transform(transformerRequest, request);
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
								page.put("contentPlain", transformerResponse.result().getPlainTextContent());
							}
						}

						// add extra fields to the page
						page
								.put("lastContributer", user.getUserId())
								.put("lastContributerName", user.getUsername())
								.put("modified", MongoDb.now());

						// Mongo Query
						BasicDBObject idPageDBO = new BasicDBObject("_id", page.getString("_id"));
						QueryBuilder query = QueryBuilder.start("_id").is(idWiki).put("pages")
								.elemMatch(idPageDBO);
						// Mongo Modifier
						MongoUpdateBuilder modifier = new MongoUpdateBuilder();
						JsonObject now = MongoDb.now();
						modifier.set("pages.$.title", page.getString("title"))
								.set("pages.$.contentVersion", page.getInteger("contentVersion"))
								.set("pages.$.content", page.getString("content"))
								.set("pages.$.jsonContent", page.getJsonObject("jsonContent"))
								.set("pages.$.contentPlain", page.getString("contentPlain"))
								.set("pages.$.isVisible", page.getBoolean("isVisible"))
								.set("pages.$.lastContributer", user.getUserId())
								.set("pages.$.lastContributerName", user.getUsername())
								.set("pages.$.modified", now)
								.set("modified", now);

						// Set parentId
						if (!StringUtils.isEmpty(page.getString("parentId"))) {
							modifier.set("pages.$.parentId", page.getString("parentId"));
						}

						if (Boolean.TRUE.equals(page.getBoolean("isIndex"))) {
							// Set updated page as index
							modifier.set("index", page.getString("_id"));
						} else if (Boolean.TRUE.equals(page.getBoolean("wasIndex"))) {
							// Unset index when the value of isIndex has changed from true to false
							modifier.unset("index");
						}

						// Mongo Update
						mongo.update(collection,
								MongoQueryBuilder.build(query),
								modifier.build(),
								updateResult -> {
									if ("ok".equals(updateResult.body().getString("status"))) {
										// If update is OK then we update subPages visibility and create page revision
										final List<Future> futures = new ArrayList<>();

										final Future<Void> updateVisibilityPromise = this.updateVisibility(idWiki, page, dbPage);
										futures.add(updateVisibilityPromise);

										final Promise<Void> createRevisionPromise = Promise.promise();
										futures.add(createRevisionPromise.future());

										// create new revision of a page
										// (if page was not visible and is still not visible then we don't create a new revision)
										if (Boolean.FALSE.equals(dbPage.getBoolean("isVisible"))
												&& Boolean.FALSE.equals(page.getBoolean("isVisible"))) {
											createRevisionPromise.complete();
										} else {
											this.createRevision(idWiki,
													page.getString("_id"),
													user,
													page.getString("title"),
													page.getString("content"),
													page.getBoolean("isVisible"),
													createRevisionResult -> {
														createRevisionPromise.complete();
													});
										}

										CompositeFuture
												.all(futures)
												.onComplete(res -> handler.handle(new Either.Right<>(page)));
									} else {
										handler.handle(
												new Either.Left<>(updateResult.body().getString("message", "")));
									}
								});
					});
				} else {
					// do not update nor create revision
					// return the page json information
					handler.handle(new Either.Right<>(page));
				}
			} else {
				handler.handle(new Either.Left<>(getPageResult.left().getValue()));
			}
		});
	}

	/**
	 * Check if the page from API is different from page from Database.
	 * @param page JsonObject page provided by the Controller
	 * @param dbPage JsonObject page retrieved from the database
	 * @return true if page is different from database (check title, content et isVisible fields)
	 */
	private static boolean pageHasChanged(JsonObject page, JsonObject dbPage) {
		return !StringUtils.isEmpty(page.getString("title"))
				&& page.getString("title").equals(dbPage.getString("title"))
				|| !StringUtils.isEmpty(page.getString("content"))
				&& page.getString("content").equals(dbPage.getString("content"))
				|| Boolean.compare(page.getBoolean("isVisible"), dbPage.getBoolean("isVisible")) != 0;
	}

	/**
	 * Update visibility for subpages.
	 * @param idWiki id of the related wiki
	 * @param page the JsonObject page that is passed from the controller to the updatePage method
	 * @return Future
	 */
	private Future<Void> updateVisibility(String idWiki, JsonObject page, JsonObject dbPage) {
		final Promise<Void> promise = Promise.promise();

		// if page visibility has changed then we update visibility for sub pages too
		if (Boolean.compare(
				page.getBoolean("isVisible"),
				dbPage.getBoolean("isVisible")) != 0) {
			// Mongo Query
			QueryBuilder visibilityQuery = QueryBuilder
					.start("_id")
					.is(idWiki);

			// Mongo Modifier
			MongoUpdateBuilder visibilityModifier = new MongoUpdateBuilder();
			visibilityModifier.set("pages.$[elem].isVisible", page.getBoolean("isVisible"));

			// Mongo arrayFilters
			JsonArray arrayFilters = new JsonArray()
					.add(new JsonObject().put("elem.parentId", page.getString("_id")));

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
		} else {
			promise.complete();
		}

		return promise.future();
	}

	@Override
	public void deletePage(UserInfos user, String idWiki, String idPage,
			Handler<Either<String, JsonObject>> handler) {
		// Page IDs to delete
		final List<String> pageIDsToDelete = new ArrayList<>();
		// For sure, we will delete the page with given idPage
		pageIDsToDelete.add(idPage);

		// Subpages IDs that will become a page
		final List<String> subpageIDsToPage = new ArrayList<>();

		// We check if page has subpages to implement the following rules:
		// - if manager:
		//   => delete all subpages
		// - if contrib:
		//   => delete subpages only if user is author
		//   => non authored subpages will become pages
		this.getWiki(idWiki, getWikiRes -> {
			final JsonObject wiki = getWikiRes.right().getValue();
			final JsonArray subpages = getSubPages(wiki, idPage);
			if (!subpages.isEmpty()) {
				if (isManager(wiki, user)) {
					pageIDsToDelete.addAll(
							subpages
									.stream()
									.map(page -> ((JsonObject) page).getString("_id"))
									.collect(Collectors.toList()));
				} else if (isContrib(wiki, user)) {
					subpages.forEach(subpage -> {
						JsonObject subpageJO = (JsonObject) subpage;
						if (isPageAuthor(subpageJO, user)) {
							pageIDsToDelete.add(subpageJO.getString("_id"));
						} else {
							subpageIDsToPage.add(subpageJO.getString("_id"));
						}
					});
				}
			}

			final List<Future> futures = new ArrayList<>();
			// Delete subpages in "pageIDsToDelete"
			final Promise<Void> subpagesDeletePromise = Promise.promise();
			futures.add(subpagesDeletePromise.future());
			// Mongo query
			final QueryBuilder subpagesDeleteQuery = QueryBuilder
					.start("_id")
					.is(idWiki);
			// Mongo modifier
			final MongoUpdateBuilder subpagesDeleteModifier = new MongoUpdateBuilder();
			subpagesDeleteModifier.pull("pages", MongoQueryBuilder.build(QueryBuilder.start("_id").in(pageIDsToDelete)));
			subpagesDeleteModifier.set("modified", MongoDb.now());
			// Execute query
			mongo.update(collection,
					MongoQueryBuilder.build(subpagesDeleteQuery),
					subpagesDeleteModifier.build(),
					deleteSubpagesRes -> {
						if ("ok".equals(deleteSubpagesRes.body().getString("status"))) {
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
				final QueryBuilder subpagesToPageQuery = QueryBuilder
						.start("_id")
						.is(idWiki);
				// Mongo modifier
				final MongoUpdateBuilder subpagesToPageModifier = new MongoUpdateBuilder();
				subpagesToPageModifier.unset("pages.$[elem].parentId");
				subpagesToPageModifier.set("modified", MongoDb.now());
				// Mongo arrayFilters
				final JsonArray arrayFilters = new JsonArray()
						.add(MongoQueryBuilder.build(QueryBuilder.start("elem._id").in(subpageIDsToPage)));
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

			CompositeFuture
					.all(futures)
					.onSuccess(res -> {
						handler.handle(new Either.Right<>(new JsonObject().put("result", "ok")));
					})
					.onFailure(err -> {
						handler.handle(new Either.Left<>(err.getMessage()));
					});
		});
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	public void unsetIndex(String idWiki, String idPage,
			Handler<Either<String, JsonObject>> handler) {

		QueryBuilder query = QueryBuilder.start("_id").is(idWiki).put("index").is(idPage);

		MongoUpdateBuilder modifier = new MongoUpdateBuilder();
		modifier.unset("index");

		mongo.update(collection, MongoQueryBuilder.build(query),
				modifier.build(),
				MongoDbResult.validActionResultHandler(handler));
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	public void getDataForNotification(String idWiki, String idPage, Handler<Either<String, JsonObject>> handler) {
		QueryBuilder query = QueryBuilder.start("_id").is(idWiki);

		// Projection
		JsonObject projection = new JsonObject();
		projection.put("owner", 1)
			.put("shared", 1)
			.put("title", 1);

		if(idPage!= null && !idPage.trim().isEmpty()) {
			query.put("pages._id").is(idPage);

			JsonObject matchId = new JsonObject().put("_id", idPage);
			JsonObject elemMatch = new JsonObject().put("$elemMatch", matchId);
			projection.put("pages", elemMatch); // returns the whole page. Projection on a field (e.g. "title") of a subdocument of an array is not supported by mongo
		}

		// Send query to event bus
		mongo.findOne(collection, MongoQueryBuilder.build(query), projection,
				MongoDbResult.validResultHandler(handler));
	}

	@Override
	public void addComment(UserInfos user, String idWiki, String idPage, String newCommentId,
			String comment, Handler<Either<String, JsonObject>> handler) {

		// Query
		BasicDBObject idPageDBO = new BasicDBObject("_id", idPage);
		QueryBuilder query = QueryBuilder.start("_id").is(idWiki).put("pages")
				.elemMatch(idPageDBO);

		// Add new comment to array "comments"
		JsonObject newComment = new JsonObject();
		newComment.put("_id", newCommentId)
				.put("comment", comment)
				.put("author", user.getUserId())
				.put("authorName", user.getUsername())
				.put("created", MongoDb.now());

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
		QueryBuilder query = QueryBuilder.start("_id").is(idWiki).put("pages")
				.elemMatch(idPageDBO);

		// Delete comment from array "comments"
		JsonObject commentToDelete = new JsonObject();
		commentToDelete.put("_id", idComment);

		MongoUpdateBuilder modifier = new MongoUpdateBuilder();
		modifier.pull("pages.$.comments", commentToDelete);

		mongo.update(collection, MongoQueryBuilder.build(query),
				modifier.build(), MongoDbResult.validActionResultHandler(handler));
	}

	@Override
	public void updateComment(String idWiki, String idPage, String idComment, String comment,
							  Handler<Either<String, JsonObject>> handler) {
		// Mongo Query
		QueryBuilder query = QueryBuilder
				.start("_id")
				.is(idWiki)
				.put("pages")
				.elemMatch(new BasicDBObject("_id", idPage));

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
	public void createRevision(String wikiId, String pageId, UserInfos user,
							   String pageTitle, String pageContent, boolean isVisible,
							   Handler<Either<String, JsonObject>> handler) {
		JsonObject document = new JsonObject()
				.put("wikiId", wikiId)
				.put("pageId", pageId)
				.put("userId", user.getUserId())
				.put("username", user.getUsername())
				.put("title", pageTitle)
				.put("content", pageContent)
				.put("isVisible", isVisible)
				.put("date", MongoDb.now());
		mongo.save(REVISIONS_COLLECTION, document, MongoDbResult.validResultHandler(handler));
	}

	@Override
	public void listRevisions(String wikiId, String pageId, Handler<Either<String, JsonArray>> handler) {
		QueryBuilder query = QueryBuilder.start("wikiId").is(wikiId).put("pageId").is(pageId);
		JsonObject sort = new JsonObject().put("date", -1);
		mongo.find(REVISIONS_COLLECTION, MongoQueryBuilder.build(query), sort, null,
				MongoDbResult.validResultsHandler(handler));
	}

	@Override
	public void deleteRevisions(String wikiId, String pageId, Handler<Either<String, JsonObject>> handler) {
		QueryBuilder query = QueryBuilder.start("wikiId").is(wikiId);
		if (pageId != null && !pageId.trim().isEmpty()) {
			query.put("pageId").is(pageId);
		}
		mongo.delete(REVISIONS_COLLECTION, MongoQueryBuilder.build(query), MongoDbResult.validResultHandler(handler));
	}

	/**
	 * Return Subpages from a Page with given pageId.
	 * @param wiki the wiki containing the page we want to get subpages
	 * @param pageId the page ID we want to get subpages
	 * @return List<String> page subpages IDs
	 */
	public static JsonArray getSubPages(final JsonObject wiki, final String pageId) {
		JsonArray subPages = new JsonArray();

		if (wiki != null) {
			final JsonArray pages = wiki.getJsonArray("pages");
			pages.forEach(page -> {
				final JsonObject pageJO = (JsonObject) page;
				final String parentId = pageJO.getString("parentId");

				if (!StringUtils.isEmpty(parentId) && parentId.equals(pageId)) {
					subPages.add(pageJO);
				}
			});
		}
		return subPages;
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

	public static boolean isPageAuthor(final JsonObject page, final UserInfos user) {
		return page.getString("author") != null
				&& page.getString("author").equals(user.getUserId());
	}
}
