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

package net.atos.entng.wiki.filters;

import java.util.ArrayList;
import java.util.List;

import org.entcore.common.http.filter.MongoAppFilter;
import org.entcore.common.http.filter.ResourcesProvider;
import org.entcore.common.mongodb.MongoDbConf;
import org.entcore.common.user.UserInfos;
import io.vertx.core.Handler;
import io.vertx.core.http.HttpServerRequest;

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
