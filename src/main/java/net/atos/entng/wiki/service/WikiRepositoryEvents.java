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
import org.vertx.java.core.eventbus.Message;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;
import org.vertx.java.core.logging.Logger;
import org.vertx.java.core.logging.impl.LoggerFactory;

public class WikiRepositoryEvents implements RepositoryEvents {

	private static final Logger log = LoggerFactory.getLogger(WikiRepositoryEvents.class);
	private final MongoDb mongo = MongoDb.getInstance();
	private final boolean shareOldGroupsToUsers;

	public WikiRepositoryEvents(boolean shareOldGroupsToUsers) {
		this.shareOldGroupsToUsers = shareOldGroupsToUsers;
	}

	@Override
	public void exportResources(String exportId, String userId,
			JsonArray groups, String exportPath, String locale) {
		// TODO
	}

	@Override
	public void deleteGroups(JsonArray groups) {
		// TODO

		// 1) Clean array "shared" in wikis


		if(shareOldGroupsToUsers) {
			// 2) Transmit shares from deleted groups to users

		}
	}

	@Override
	public void deleteUsers(JsonArray users) {

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
							log.error("Error when removing users from array 'shared in wikis' :"+ event.left());
						}
						else {
							log.info("Remove deleted users from array 'shared' successful" + event.right().getValue().toString());
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
		// TODO WIP
		/*
		 *   db.wiki.remove(
				 {
				 	$or : [{
							"owner.userId": {$in: ["622807a5-81e6-4463-aa62-ea3673c3955a", "1e402506-0ab8-420b-a77c-dc887ed6791d", "3ab0192c-7ce8-4f36-8dbf-a06b73c7eb2c"]},
							"shared": {
								$elemMatch: { "userId": {$nin: ["622807a5-81e6-4463-aa62-ea3673c3955a", "1e402506-0ab8-420b-a77c-dc887ed6791d", "3ab0192c-7ce8-4f36-8dbf-a06b73c7eb2c"]}
								}
						 	}
					 	},
					 	{
					 	"owner.deleted":true
					 	}
				 	],
				 	"shared.net-atos-entng-wiki-controllers-WikiController|shareWiki" : {$ne: true}
				 })
		 */
		DBObject deletedUsers = new BasicDBObject();
		deletedUsers.put("owner.userId", new BasicDBObject("$in", userIds));

		DBObject ownerIsDeleted = new BasicDBObject("owner.deleted", true);

		JsonObject matcher = MongoQueryBuilder.build(
				QueryBuilder.start("shared.net-atos-entng-wiki-controllers-WikiController|shareWiki").notEquals(true)
				.or(deletedUsers, ownerIsDeleted));


		mongo.delete(WIKI_COLLECTION, matcher,
				MongoDbResult.validActionResultHandler(new Handler<Either<String,JsonObject>>() {
					@Override
					public void handle(Either<String, JsonObject> event) {
						if(event.isLeft()) {
							log.error("Error when removing wikis who have no manager and no owner :"+ event.left());
						}
						else {
							log.info("Remove wikis who have no manager and no owner successful" + event.right().getValue().toString());
							// 3) update remaining wikis (i.e wikis who have a manager)
							// TODO
							/*
							 * db.wiki.update(
								"owner.userId": {$in: ["622807a5-81e6-4463-aa62-ea3673c3955a", "1e402506-0ab8-420b-a77c-dc887ed6791d", "3ab0192c-7ce8-4f36-8dbf-a06b73c7eb2c"]},
								{
									$set: { "owner.deleted": true }
								},
								{ multi: true }
							)
							 */

							// TODO : anonymiser le nom du owner
						}
					}
				}));
	}

}
