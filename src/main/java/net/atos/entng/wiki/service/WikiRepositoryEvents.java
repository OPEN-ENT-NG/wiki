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

import fr.wseduc.mongodb.MongoDb;
import org.entcore.common.service.impl.MongoDbRepositoryEvents;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;

public class WikiRepositoryEvents extends MongoDbRepositoryEvents {

	private final MongoDb mongo = MongoDb.getInstance();

	public WikiRepositoryEvents() {
		super("net-atos-entng-wiki-controllers-WikiController|shareWiki",
				REVISIONS_COLLECTION, "wikiId");
	}

	@Override
	public void exportResources(String exportId, String userId,
			JsonArray groups, String exportPath, String locale, String host, final Handler<Boolean> handler) {
		// TODO
		log.warn("Method exportResources is not implemented in WikiRepositoryEvents");
	}

}
