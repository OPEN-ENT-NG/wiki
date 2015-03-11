package net.atos.entng.wiki.filters;

import java.util.ArrayList;
import java.util.List;

import org.entcore.common.http.filter.MongoAppFilter;
import org.entcore.common.http.filter.ResourcesProvider;
import org.entcore.common.mongodb.MongoDbConf;
import org.entcore.common.user.UserInfos;
import org.vertx.java.core.Handler;
import org.vertx.java.core.http.HttpServerRequest;

import com.mongodb.BasicDBObject;
import com.mongodb.DBObject;
import com.mongodb.QueryBuilder;

import fr.wseduc.mongodb.MongoQueryBuilder;
import fr.wseduc.webutils.http.Binding;

public class OwnerAuthorOrShared implements ResourcesProvider {

	private MongoDbConf conf = MongoDbConf.getInstance();

	@Override
	public void authorize(HttpServerRequest request, Binding binding,
			UserInfos user, Handler<Boolean> handler) {

		String wikiId = request.params().get(conf.getResourceIdLabel());
		String pageId = request.params().get("idpage");
		String commentId = request.params().get("idcomment");

		if (isValidId(wikiId) && isValidId(pageId) && isValidId(commentId)) {
			List<DBObject> groups = new ArrayList<>();
			String sharedMethod = binding.getServiceMethod().replaceAll("\\.", "-");
			groups.add(QueryBuilder.start("userId").is(user.getUserId())
					.put(sharedMethod).is(true).get());
			for (String gpId: user.getGroupsIds()) {
				groups.add(QueryBuilder.start("groupId").is(gpId)
						.put(sharedMethod).is(true).get());
			}

			BasicDBObject commentMatch = new BasicDBObject("_id", commentId);
			commentMatch.put("author", user.getUserId());
			DBObject pageMatch = QueryBuilder.start("_id").is(pageId)
				.put("comments").elemMatch(commentMatch).get();

			// Authorize if current user is the wiki's owner, the comment's author or if the serviceMethod has been shared
			QueryBuilder query = QueryBuilder.start("_id").is(wikiId).or(
					QueryBuilder.start("owner.userId").is(user.getUserId()).get(),
					QueryBuilder.start("pages").elemMatch(pageMatch).get(),
					QueryBuilder.start("shared").elemMatch(
							new QueryBuilder().or(groups.toArray(new DBObject[groups.size()])).get()).get()
			);
			MongoAppFilter.executeCountQuery(request, conf.getCollection(), MongoQueryBuilder.build(query), 1, handler);
		} else {
			handler.handle(false);
		}
	}

	private boolean isValidId(String id) {
		return (id != null && !id.trim().isEmpty());
	}

}
