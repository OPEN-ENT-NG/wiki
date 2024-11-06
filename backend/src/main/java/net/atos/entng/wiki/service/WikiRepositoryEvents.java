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
import static net.atos.entng.wiki.Wiki.WIKI_COLLECTION;

import fr.wseduc.mongodb.MongoDb;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import org.entcore.common.service.impl.MongoDbRepositoryEvents;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import org.entcore.common.storage.Storage;

public class WikiRepositoryEvents extends MongoDbRepositoryEvents {

	public WikiRepositoryEvents(Vertx vertx) {
		super(vertx,"net-atos-entng-wiki-controllers-WikiController|shareWiki",
				REVISIONS_COLLECTION, "wikiId");
	}
	/**
	 * Filter out pages that are not visible
	 * @param resources
	 * @return filtered resources
	 */
	@Override
	protected JsonArray exportResourcesFilter(JsonArray resources, String exportId, String userId) {
		// Iterate over resources
		for(final Object resource : resources){
			if(resource instanceof JsonObject){
				final JsonObject resourceObject = (JsonObject) resource;
				// Get pages
				final JsonArray pages = resourceObject.getJsonArray("pages", new JsonArray());
				// Filter out pages that are not visible or not authored by the user
				final JsonArray filteredPages = new JsonArray();
				for(final Object page : pages){
					final JsonObject pageObject = (JsonObject) page;
					final Boolean isVisible = pageObject.getBoolean("isVisible", false);
					final String author = pageObject.getString("author", "");
					// Keep page if it is visible or authored by the user
					if(isVisible || author.equals(userId)){
						filteredPages.add(page);
					}
				}
				// Update pages
				resourceObject.put("pages", filteredPages);
			}
		}
		return resources;
	}
}
