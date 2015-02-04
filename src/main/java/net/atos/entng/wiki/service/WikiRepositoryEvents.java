package net.atos.entng.wiki.service;

import static net.atos.entng.wiki.Wiki.WIKI_COLLECTION;

import com.mongodb.BasicDBObject;
import com.mongodb.DBObject;
import com.mongodb.QueryBuilder;

import fr.wseduc.mongodb.MongoDb;
import fr.wseduc.mongodb.MongoQueryBuilder;
import fr.wseduc.mongodb.MongoUpdateBuilder;
import fr.wseduc.webutils.Either;

import org.entcore.common.mongodb.MongoDbResult;
import org.entcore.common.user.RepositoryEvents;
import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;
import org.vertx.java.core.logging.Logger;
import org.vertx.java.core.logging.impl.LoggerFactory;

public class WikiRepositoryEvents implements RepositoryEvents {

	private static final Logger log = LoggerFactory.getLogger(WikiRepositoryEvents.class);
	private final MongoDb mongo = MongoDb.getInstance();

	@Override
	public void exportResources(String exportId, String userId,
			JsonArray groups, String exportPath, String locale) {
		// TODO
	}

	/**
	 * Remove deleted groups from array "shared" in wikis
	 */
	@Override
	public void deleteGroups(JsonArray groups) {

		if(groups == null || groups.size() == 0) {
			log.warn("JsonArray groups is null or empty");
			return;
		}

		final String [] groupIds = new String[groups.size()];
		for (int i = 0; i < groups.size(); i++) {
			JsonObject j = groups.get(i);
			groupIds[i] = j.getString("group");
		}

		final JsonObject matcher = MongoQueryBuilder.build(QueryBuilder.start("shared.groupId").in(groupIds));

		MongoUpdateBuilder modifier = new MongoUpdateBuilder();
		modifier.pull("shared", MongoQueryBuilder.build(QueryBuilder.start("groupId").in(groupIds)));

		mongo.update(WIKI_COLLECTION, matcher, modifier.build(), false, true,
				MongoDbResult.validActionResultHandler(new Handler<Either<String,JsonObject>>() {
					@Override
					public void handle(Either<String, JsonObject> event) {
						if(event.isLeft()) {
							log.error("Error when removing groups from array 'shared' in wikis : "+ event.left());
						}
						else {
							String message = "Remove deleted groups from array 'shared' in wikis successful : ";
							if(event.right().getValue() != null) {
								message += event.right().getValue().toString();
							}
							log.info(message);
						}
					}
				}));
	}

	@Override
	public void deleteUsers(JsonArray users) {

		if(users == null || users.size() == 0) {
			log.warn("JsonArray users is null or empty");
			return;
		}

		final String [] userIds = new String[users.size()];
		for (int i = 0; i < users.size(); i++) {
			JsonObject j = users.get(i);
			userIds[i] = j.getString("id");
		}

		// 1) Remove deleted users from array "shared"
		// TODO : anonymiser les noms dans les pages et commentaires
		final JsonObject criteria = MongoQueryBuilder.build(QueryBuilder.start("shared.userId").in(userIds));

		MongoUpdateBuilder modifier = new MongoUpdateBuilder();
		modifier.pull("shared", MongoQueryBuilder.build(QueryBuilder.start("userId").in(userIds)));

		mongo.update(WIKI_COLLECTION, criteria, modifier.build(), false, true,
				MongoDbResult.validActionResultHandler(new Handler<Either<String,JsonObject>>() {
					@Override
					public void handle(Either<String, JsonObject> event) {
						if(event.isLeft()) {
							log.error("Error when removing users from array 'shared' in wikis : "+ event.left());
						}
						else {
							String message = "Remove deleted users from array 'shared' in wikis successful : ";
							if(event.right().getValue() != null) {
								message += event.right().getValue().toString();
							}
							log.info(message);

							// 2) remove wikis who have no manager and no owner
							WikiRepositoryEvents.this.removeWikis(userIds);
						}
					}
				}));
	}

	/*
	 * Remove wikis who have no manager and no owner
	 */
	private void removeWikis(final String [] userIds) {
		DBObject deletedUsers = new BasicDBObject();
		deletedUsers.put("owner.userId", new BasicDBObject("$in", userIds));

		DBObject ownerIsDeleted = new BasicDBObject("owner.deleted", true);

		// Match wikis who have no manager and no owner (owner is deleted during current transition, or has been deleted in a previous transition)
		JsonObject matcher = MongoQueryBuilder.build(
				QueryBuilder.start("shared.net-atos-entng-wiki-controllers-WikiController|shareWiki").notEquals(true)
				.or(deletedUsers, ownerIsDeleted));

		mongo.delete(WIKI_COLLECTION, matcher,
				MongoDbResult.validActionResultHandler(new Handler<Either<String,JsonObject>>() {
					@Override
					public void handle(Either<String, JsonObject> event) {
						if(event.isLeft()) {
							log.error("Error when removing wikis who have no manager and no owner : "+ event.left());
						}
						else {
							String message = "Remove wikis who have no manager and no owner successful : ";
							if(event.right().getValue() != null) {
								message += event.right().getValue().toString();
							}
							log.info(message);
							// 3) update remaining wikis
							WikiRepositoryEvents.this.updateWikis(userIds);
						}
					}
				}));
	}

	/*
	 * Mark owners of remaining wikis (i.e wikis who have a manager and whose owner is deleted in current transition) as deleted
	 */
	private void updateWikis(final String [] userIds) {
		// TODO : anonymiser le nom du owner

		final JsonObject criteria = MongoQueryBuilder.build(QueryBuilder.start("owner.userId").in(userIds));

		MongoUpdateBuilder modifier = new MongoUpdateBuilder();
		modifier.set("owner.deleted", true);

		mongo.update(WIKI_COLLECTION, criteria, modifier.build(), false, true,
				MongoDbResult.validActionResultHandler(new Handler<Either<String,JsonObject>>() {
					@Override
					public void handle(Either<String, JsonObject> event) {
						if(event.isLeft()) {
							log.error("Error when updating wikis : "+ event.left());
						}
						else {
							String message = "Update wikis successful : ";
							if(event.right().getValue() != null) {
								message += event.right().getValue().toString();
							}
							log.info(message);
						}
					}
				}));
	}

}
