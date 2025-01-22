package net.atos.entng.wiki.filters;

import fr.wseduc.mongodb.MongoQueryBuilder;
import fr.wseduc.webutils.http.Binding;
import org.bson.conversions.Bson;
import org.entcore.common.http.filter.MongoAppFilter;
import org.entcore.common.http.filter.ResourcesProvider;
import org.entcore.common.mongodb.MongoDbConf;
import org.entcore.common.user.UserInfos;
import io.vertx.core.Handler;
import io.vertx.core.http.HttpServerRequest;

import java.util.ArrayList;
import java.util.List;

import static com.mongodb.client.model.Filters.*;

/**
 * Created by vogelmt on 01/06/2017.
 */
public class OwnerAuthorOrSharedPage implements ResourcesProvider {
    private MongoDbConf conf = MongoDbConf.getInstance();

    @Override
    public void authorize(HttpServerRequest request, Binding binding,
                          UserInfos user, Handler<Boolean> handler) {

        String wikiId = request.params().get(conf.getResourceIdLabel());
        String pageId = request.params().get("idpage");

        if (isValidId(wikiId) && isValidId(pageId) ) {
            final List<Bson> groups = new ArrayList<>();
            String sharedMethod = binding.getServiceMethod().replaceAll("\\.", "-");
            groups.add(and(eq("userId", user.getUserId()), eq(sharedMethod, true)));
            for (String gpId: user.getGroupsIds()) {
                groups.add(and(eq("groupId", gpId), eq(sharedMethod, true)));
            }

            final Bson pageMatch = eq("_id", pageId);

            // Authorize if current user is the wiki's owner, the comment's author or if the serviceMethod has been shared
            final Bson query = and(
              eq("_id", wikiId),
              elemMatch("pages", pageMatch),
              or(
                eq("owner.userId", user.getUserId()),
                elemMatch("shared", or(groups))
              )
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
