package net.atos.entng.wiki;

import net.atos.entng.wiki.controllers.WikiController;
import net.atos.entng.wiki.service.WikiRepositoryEvents;

import org.entcore.common.http.BaseServer;
import org.entcore.common.http.filter.ShareAndOwner;
import org.entcore.common.mongodb.MongoDbConf;
import org.entcore.common.user.RepositoryHandler;

public class Wiki extends BaseServer {

	public final static String WIKI_COLLECTION = "wiki";

	@Override
	public void start() {
		super.start();

		// Subscribe to events published for transition
		setRepositoryEvents(new WikiRepositoryEvents());

		addController(new WikiController(WIKI_COLLECTION));
		MongoDbConf.getInstance().setCollection(WIKI_COLLECTION);
		setDefaultResourceFilter(new ShareAndOwner());
	}

}
