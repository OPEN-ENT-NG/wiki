package net.atos.entng.wiki;

import net.atos.entng.wiki.controllers.WikiController;
import net.atos.entng.wiki.service.WikiRepositoryEvents;

import org.entcore.common.events.EventStoreFactory;
import org.entcore.common.http.BaseServer;
import org.entcore.common.http.filter.ShareAndOwner;
import org.entcore.common.mongodb.MongoDbConf;

public class Wiki extends BaseServer {

	public final static String WIKI_COLLECTION = "wiki";
	public static final String REVISIONS_COLLECTION = "wikiRevisions";

	@Override
	public void start() {
		super.start();

		// Set RepositoryEvents implementation used to process events published for transition
		setRepositoryEvents(new WikiRepositoryEvents());

		// Init eventStoreFactory (used for module "statistics")
		EventStoreFactory eventStoreFactory = EventStoreFactory.getFactory();
		eventStoreFactory.setContainer(container);
		eventStoreFactory.setVertx(vertx);

		addController(new WikiController(WIKI_COLLECTION));
		MongoDbConf.getInstance().setCollection(WIKI_COLLECTION);
		setDefaultResourceFilter(new ShareAndOwner());
	}

}
