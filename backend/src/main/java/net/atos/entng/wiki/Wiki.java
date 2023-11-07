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

import fr.wseduc.transformer.IContentTransformerClient;
import io.vertx.core.Promise;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import io.vertx.core.shareddata.LocalMap;
import net.atos.entng.wiki.config.WikiConfig;
import net.atos.entng.wiki.controllers.WikiController;
import net.atos.entng.wiki.explorer.WikiExplorerPlugin;
import net.atos.entng.wiki.service.WikiSearchingEvents;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import net.atos.entng.wiki.service.WikiService;
import net.atos.entng.wiki.service.WikiServiceMongoImpl;
import org.entcore.common.editor.EventStoredContentTransformerFactoryProvider;
import org.entcore.common.explorer.IExplorerPluginClient;
import org.entcore.common.explorer.impl.ExplorerRepositoryEvents;
import org.entcore.common.http.BaseServer;
import org.entcore.common.http.filter.ShareAndOwner;
import org.entcore.common.mongodb.MongoDbConf;
import org.entcore.common.service.impl.MongoDbRepositoryEvents;
import org.entcore.common.service.impl.MongoDbSearchService;

import static java.util.Optional.empty;

public class Wiki extends BaseServer {
    public static final String APPLICATION = "wiki";
    public static final String WIKI_TYPE = "wiki";

	public static final String WIKI_COLLECTION = "wiki";
	public static final String REVISIONS_COLLECTION = "wikiRevisions";

	private WikiExplorerPlugin plugin;

	@Override
	public void start(Promise<Void> startPromise) throws Exception {
		super.start(startPromise);

		WikiConfig wikiConfig = new WikiConfig(config);

		// Set Explorer Plugin
        final IExplorerPluginClient mainClient = IExplorerPluginClient.withBus(vertx, APPLICATION, WIKI_TYPE);
		final Map<String, IExplorerPluginClient> pluginClientPerCollection = new HashMap<>();
        pluginClientPerCollection.put(WIKI_COLLECTION, mainClient);
		
        // Set Repository Events
        setRepositoryEvents(new ExplorerRepositoryEvents(new MongoDbRepositoryEvents(vertx), pluginClientPerCollection, mainClient));
		
        // Set Searching Events
        if (config.getBoolean("searching-event", true)) {
			setSearchingEvents(new WikiSearchingEvents(new MongoDbSearchService(WIKI_COLLECTION)));
		}

		// Tiptap Transformer
		EventStoredContentTransformerFactoryProvider.init(vertx);
		final JsonObject contentTransformerConfig = this.getContentTransformerConfig(vertx).orElse(null);
		IContentTransformerClient contentTransformerClient = EventStoredContentTransformerFactoryProvider.getFactory("wiki", contentTransformerConfig).create();

        // Create Explorer plugin
		this.plugin = WikiExplorerPlugin.create(securedActions);

		// Pass the Explorer plugin and the Tiptap transformer to the Wiki Service
		WikiService wikiService = new WikiServiceMongoImpl(WIKI_COLLECTION, this.plugin, contentTransformerClient);

        // Add Wiki Controller
        final WikiController wikiController = new WikiController(WIKI_COLLECTION, wikiConfig, this.plugin, wikiService);
		addController(wikiController);
		
        // Set Mongo Collection
        MongoDbConf.getInstance().setCollection(WIKI_COLLECTION);
		
        setDefaultResourceFilter(new ShareAndOwner());

        // Start Explorer plugin
		this.plugin.start();
		startPromise.tryComplete();
	}

	private Optional<JsonObject> getContentTransformerConfig(final Vertx vertx) {
		final LocalMap<Object, Object> server= vertx.sharedData().getLocalMap("server");
		final String rawConfiguration = (String) server.get("content-transformer");
		final Optional<JsonObject> contentTransformerConfig;
		if(rawConfiguration == null) {
			contentTransformerConfig = empty();
		} else {
			contentTransformerConfig = Optional.of(new JsonObject(rawConfiguration));
		}
		return contentTransformerConfig;
	}

	@Override
	public void stop() throws Exception {
		super.stop();

		if (this.plugin != null) {
			this.plugin.stop();
		}
	}
}
