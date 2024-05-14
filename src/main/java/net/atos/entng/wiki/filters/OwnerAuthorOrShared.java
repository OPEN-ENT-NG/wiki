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

import org.bson.conversions.Bson;
import org.entcore.common.http.filter.MongoAppFilter;
import org.entcore.common.http.filter.ResourcesProvider;
import org.entcore.common.mongodb.MongoDbConf;
import org.entcore.common.user.UserInfos;
import io.vertx.core.Handler;
import io.vertx.core.http.HttpServerRequest;

import com.mongodb.BasicDBObject;

import fr.wseduc.mongodb.MongoQueryBuilder;
import fr.wseduc.webutils.http.Binding;

import static com.mongodb.client.model.Filters.*;

public class OwnerAuthorOrShared implements ResourcesProvider {

	private MongoDbConf conf = MongoDbConf.getInstance();

	@Override
	public void authorize(HttpServerRequest request, Binding binding,
			UserInfos user, Handler<Boolean> handler) {

		String wikiId = request.params().get(conf.getResourceIdLabel());
		String pageId = request.params().get("idpage");
		String commentId = request.params().get("idcomment");

		if (isValidId(wikiId) && isValidId(pageId) && isValidId(commentId)) {
			final List<Bson> groups = new ArrayList<>();
			String sharedMethod = binding.getServiceMethod().replaceAll("\\.", "-");
			groups.add(
				and(
					eq("userId", user.getUserId()),
					eq(sharedMethod, true)));
			for (String gpId: user.getGroupsIds()) {
				groups.add(
					and(
						eq("groupId", gpId),
						eq(sharedMethod, true)));
			}

			BasicDBObject commentMatch = new BasicDBObject("_id", commentId);
			commentMatch.put("author", user.getUserId());
			final Bson pageMatch = and(
				eq("_id", pageId),
				elemMatch("comments", commentMatch));

			// Authorize if current user is the wiki's owner, the comment's author or if the serviceMethod has been shared
			final Bson query = and(eq("_id", wikiId), or(
				eq("owner.userId", user.getUserId()),
				elemMatch("pages", pageMatch),
				elemMatch("shared", or(groups))
			));
			MongoAppFilter.executeCountQuery(request, conf.getCollection(), MongoQueryBuilder.build(query), 1, handler);
		} else {
			handler.handle(false);
		}
	}

	private boolean isValidId(String id) {
		return (id != null && !id.trim().isEmpty());
	}

}
