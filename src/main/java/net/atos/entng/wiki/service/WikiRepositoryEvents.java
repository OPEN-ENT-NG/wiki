package net.atos.entng.wiki.service;

import static net.atos.entng.wiki.Wiki.REVISIONS_COLLECTION;

import fr.wseduc.mongodb.MongoDb;
import org.entcore.common.service.impl.MongoDbRepositoryEvents;
import org.vertx.java.core.json.JsonArray;

public class WikiRepositoryEvents extends MongoDbRepositoryEvents {

	private final MongoDb mongo = MongoDb.getInstance();

	public WikiRepositoryEvents() {
		super("net-atos-entng-wiki-controllers-WikiController|shareWiki",
				REVISIONS_COLLECTION, "wikiId");
	}

	@Override
	public void exportResources(String exportId, String userId,
			JsonArray groups, String exportPath, String locale) {
		// TODO
		log.warn("Method exportResources is not implemented in WikiRepositoryEvents");
	}

}
