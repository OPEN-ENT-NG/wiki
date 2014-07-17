package fr.wseduc.wiki;

import org.entcore.common.http.BaseServer;

import fr.wseduc.wiki.controllers.WikiController;
import org.entcore.common.http.filter.ShareAndOwner;
import org.entcore.common.mongodb.MongoDbConf;

public class Wiki extends BaseServer {

	public final static String WIKI_COLLECTION = "wiki";
	
	@Override
	public void start() {
		super.start();
		addController(new WikiController(WIKI_COLLECTION));
		MongoDbConf.getInstance().setCollection(WIKI_COLLECTION);
		setDefaultResourceFilter(new ShareAndOwner());
	}

}
