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

package net.atos.entng.wiki;

import net.atos.entng.wiki.controllers.WikiController;
import net.atos.entng.wiki.service.WikiRepositoryEvents;

import net.atos.entng.wiki.service.WikiSearchingEvents;
import org.entcore.common.http.BaseServer;
import org.entcore.common.http.filter.ShareAndOwner;
import org.entcore.common.mongodb.MongoDbConf;
import org.entcore.common.service.impl.MongoDbSearchService;

public class Wiki extends BaseServer {

	public final static String WIKI_COLLECTION = "wiki";
	public static final String REVISIONS_COLLECTION = "wikiRevisions";

	@Override
	public void start() {
		super.start();

		// Set RepositoryEvents implementation used to process events published for transition
		setRepositoryEvents(new WikiRepositoryEvents());

		if (config.getBoolean("searching-event", true)) {
			setSearchingEvents(new WikiSearchingEvents(new MongoDbSearchService(WIKI_COLLECTION)));
		}

		addController(new WikiController(WIKI_COLLECTION));
		MongoDbConf.getInstance().setCollection(WIKI_COLLECTION);
		setDefaultResourceFilter(new ShareAndOwner());
	}

}
