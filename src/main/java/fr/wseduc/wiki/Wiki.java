package fr.wseduc.wiki;

import org.entcore.common.http.BaseServer;

import fr.wseduc.wiki.controllers.WikiController;

public class Wiki extends BaseServer {

	public final static String WIKI_COLLECTION = "wiki";
	
	@Override
	public void start() {
		super.start();
		addController(new WikiController(WIKI_COLLECTION));
	}

}
