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
import io.vertx.core.*;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.json.JsonObject;
import org.entcore.common.service.impl.MongoDbRepositoryEvents;
import io.vertx.core.json.JsonArray;
import org.entcore.common.user.UserUtils;

import java.util.*;

public class WikiRepositoryEvents extends MongoDbRepositoryEvents {
	private final EventBus eventBus;

	public static final String MANAGER_RIGHT = "net-atos-entng-wiki-controllers-WikiController|shareWiki";

	public WikiRepositoryEvents(Vertx vertx) {
		super(vertx, MANAGER_RIGHT, REVISIONS_COLLECTION, "wikiId");
		this.eventBus = vertx.eventBus();
	}

	/**
	 * Get group ids for resources
	 * @param resources
	 * @return group ids
	 */
	private Set<String> getGroupIdsForResources(JsonArray resources) {
		final Set<String> groupIds = new HashSet<>();
		// Iterate over resources
		for(final Object resource : resources){
			if(resource instanceof JsonObject){
				final JsonObject resourceObject = (JsonObject) resource;
				// Get shared
				final JsonArray shared = resourceObject.getJsonArray("shared", new JsonArray());
				// Iterate over shared
				for(final Object sharedObject : shared){
					if(sharedObject instanceof JsonObject){
						final JsonObject sharedJson = (JsonObject) sharedObject;
						// Get group id
						final String groupId = sharedJson.getString("groupId", "");
						if(groupId != null && !groupId.isEmpty()){
							// Add group id
							groupIds.add(groupId);
						}
					}
				}
			}
		}
		return groupIds;
	}

	/**
	 * Get user ids for group id
	 * @param groupId
	 * @param userId
	 * @return user ids
	 */
	private Future<Set<String>> getUserIdsByGroupId(String groupId, final String userId) {
		final Promise<Set<String>> promise = Promise.promise();
		// Get user ids for group id
		UserUtils.getUserIdsForGroupIds(Collections.singleton(groupId), userId, eventBus, userIds -> {
			if(userIds.succeeded()){
				promise.complete(userIds.result());
			} else {
				promise.fail(userId);
			}
		});
		// Return user ids promise
		return promise.future();
	}

	/**
	 * Get user ids by group ids
	 * @param groupIds
	 * @param userId
	 * @return user ids by group id
	 */
	private Future<Map<String, Set<String>>> getUserIdsByGroupIds(Set<String> groupIds, final String userId) {
		// Get user ids for group ids
		final Map<String, Future<Set<String>>> futures = new HashMap<>();
		for(final String groupId : groupIds){
			futures.put(groupId, getUserIdsByGroupId(groupId, userId));
		}
		return CompositeFuture.all(new ArrayList<>(futures.values())).map(v -> {
			// Create map of user ids by group id
			final Map<String, Set<String>> userIdsByGroupId = new HashMap<>();
			// Iterate over user ids
			for(final Map.Entry<String, Future<Set<String>>> entry : futures.entrySet()){
				userIdsByGroupId.put(entry.getKey(), entry.getValue().result());
			}
			// Return user ids by group id
			return userIdsByGroupId;
		});
	}

	/**
	 * Get manager group ids
	 * @param shared
	 * @return manager group ids
	 */
	private Set<String> getManagerGroupIds(JsonArray shared) {
		final Set<String> groupIds = new HashSet<>();
		// Iterate over shared
		for(final Object sharedObject : shared){
			if(sharedObject instanceof JsonObject){
				final JsonObject sharedJson = (JsonObject) sharedObject;
				// Get group id
				final String groupId = sharedJson.getString("groupId", "");
				// If group id is not null and not empty and has manager right, add group id
				if(groupId != null && !groupId.isEmpty() && sharedJson.getBoolean(MANAGER_RIGHT, false)){
					// Add group id
					groupIds.add(groupId);
				}
			}
		}
		// Return group ids
		return groupIds;
	}

	private Set<String> getManagerUserIds(JsonArray shared) {
		// Get manager group ids
		final Set<String> userIds = new HashSet<>();
		// Iterate over shared
		for(Object sharedObject : shared){
			if(sharedObject instanceof JsonObject){
				final JsonObject sharedJson = (JsonObject) sharedObject;
				// Get user id
				final String userId = sharedJson.getString("userId", "");
				// If user id is not null and not empty and has manager right, add user id
				if(userId != null && !userId.isEmpty() && sharedJson.getBoolean(MANAGER_RIGHT, false)){
					// Add user id
					userIds.add(userId);
				}
			}
		}
		return userIds;
	}

	/**
	 * Filter out pages that are not visible
	 * @param resources
	 * @return filtered resources
	 */
	@Override
	protected Future<JsonArray> exportResourcesFilter(JsonArray resources, String exportId, String userId) {
		// Get group ids for resources
		final Set<String> groupIds = getGroupIdsForResources(resources);
		// Get user ids for group ids
		return getUserIdsByGroupIds(groupIds, userId).map(userIdsByGroupId -> {
			// Iterate over resources
			for(final Object resource : resources){
				if(resource instanceof JsonObject){
					final JsonObject resourceObject = (JsonObject) resource;
					// if owner of the wiki is the user, keep all pages
					if(resourceObject.getJsonObject("owner", new JsonObject()).getString("userId", "").equals(userId)){
						continue;
					}
					// Get shared
					final JsonArray shared = resourceObject.getJsonArray("shared", new JsonArray());
					// Get manager user ids
					final Set<String> managerUserIds = getManagerUserIds(shared);
					// Get manager group ids
					final Set<String> managerGroupIds = getManagerGroupIds(shared);
					// Iterate over manager group ids
					for(final String managerGroupId : managerGroupIds){
						if(userIdsByGroupId.containsKey(managerGroupId)){
							// Add manager user ids
							managerUserIds.addAll(userIdsByGroupId.get(managerGroupId));
						}
					}
					// Get pages
					final JsonArray pages = resourceObject.getJsonArray("pages", new JsonArray());
					// Filter out pages that are not visible or not authored by the user
					final JsonArray filteredPages = new JsonArray();
					// Iterate over pages
					for(final Object page : pages){
						if(page instanceof JsonObject){
							final JsonObject pageObject = (JsonObject) page;
							// Get is visible
							final Boolean isVisible = pageObject.getBoolean("isVisible", false);
							// Get author
							final String author = pageObject.getString("author", "");
							// Keep page if it is visible or authored by the user or the user is a manager
							if(isVisible || author.equals(userId) || managerUserIds.contains(userId)){
								// Add page
								filteredPages.add(page);
							}
						}
					}
					// Update pages
					resourceObject.put("pages", filteredPages);
				}
			}
			// Return resources
			return resources;
		});
	}
}
