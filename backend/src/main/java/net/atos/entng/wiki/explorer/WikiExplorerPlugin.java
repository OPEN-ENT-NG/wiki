package net.atos.entng.wiki.explorer;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.entcore.broker.api.dto.resources.ResourcesDeletedDTO;
import org.entcore.broker.api.publisher.BrokerPublisherFactory;
import org.entcore.broker.api.utils.AddressParameter;
import org.entcore.broker.proxy.ResourceBrokerPublisher;
import org.entcore.common.explorer.ExplorerMessage;
import org.entcore.common.explorer.ExplorerPluginFactory;
import org.entcore.common.explorer.IExplorerPlugin;
import org.entcore.common.explorer.IExplorerPluginCommunication;
import org.entcore.common.explorer.impl.ExplorerPluginResourceMongo;
import org.entcore.common.explorer.impl.ExplorerSubResource;
import org.entcore.common.share.ShareModel;
import org.entcore.common.share.ShareService;

import fr.wseduc.mongodb.MongoDb;
import fr.wseduc.webutils.security.SecuredAction;
import io.vertx.core.Future;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;
import net.atos.entng.wiki.Wiki;
import org.entcore.common.user.UserInfos;

public class WikiExplorerPlugin extends ExplorerPluginResourceMongo {
    public static final String APPLICATION = Wiki.APPLICATION;
    public static final String TYPE = Wiki.WIKI_TYPE;
    public static final String COLLECTION = Wiki.WIKI_COLLECTION;

    private final Map<String, SecuredAction> securedActions;
    private final MongoClient mongoClient;
    private ShareService shareService;
    private final ResourceBrokerPublisher resourcePublisher;

    public static WikiExplorerPlugin create(final Map<String, SecuredAction> securedActions) throws Exception  {
        final IExplorerPlugin plugin = ExplorerPluginFactory.createMongoPlugin((params)->{
            return new WikiExplorerPlugin(params.getCommunication(), params.getDb(), securedActions);
        });
        return (WikiExplorerPlugin) plugin;
    }

    protected WikiExplorerPlugin(final IExplorerPluginCommunication communication, final MongoClient mongoClient, final Map<String, SecuredAction> securedActions) {
        super(communication, mongoClient);
        this.mongoClient = mongoClient;
        this.securedActions = securedActions;
        // Initialize resource publisher for deletion notifications
        this.resourcePublisher = BrokerPublisherFactory.create(
                ResourceBrokerPublisher.class,
                communication.vertx(),
                new AddressParameter("application", Wiki.APPLICATION)
        );
    }

    public MongoClient getMongoClient() {return mongoClient;}
    
    public ShareService createShareService(final Map<String, List<String>> groupedActions) {
        this.shareService = createMongoShareService(Wiki.WIKI_COLLECTION, securedActions, groupedActions);
        return this.shareService;
    }

    @Override
    protected Optional<ShareService> getShareService() {
        return Optional.ofNullable(shareService);
    }

    @Override
    protected String getApplication() { return APPLICATION; }

    @Override
    protected String getResourceType() { return TYPE; }

    @Override
    protected Future<ExplorerMessage> doToMessage(final ExplorerMessage message, final JsonObject source) {
        final Optional<String> creatorId = getCreatorForModel(source).map(e -> e.getUserId());
        message.withName(source.getString("title", ""));
        message.withContent(source.getString("description", ""), ExplorerMessage.ExplorerContentType.Html);
        message.withPublic(false);
        message.withTrashed(source.getBoolean("trashed", false));
        // "shared" only has meaning if it was explicitly set, otherwise it will reset the resources' shares
        if(source.containsKey("shared")) {
            final ShareModel shareModel = new ShareModel(source.getJsonArray("shared", new JsonArray()), securedActions, creatorId);
            message.withShared(shareModel);
        }
        message.withThumbnail(source.getString("thumbnail", ""));
        message.withDescription(source.getString("description", ""));
        // set updated date
        final Object modified = source.getValue("modified");
        if(modified != null && modified instanceof JsonObject){
            message.withUpdatedAt(MongoDb.parseIsoDate((JsonObject) modified));
        }
        return Future.succeededFuture(message);
    }

    @Override
    public Map<String, SecuredAction> getSecuredActions() {
        return securedActions;
    }

    @Override
    protected String getCollectionName() { return COLLECTION; }

    @Override
    protected List<ExplorerSubResource> getSubResourcesPlugin() {
        return Collections.EMPTY_LIST;
    }

    @Override
    public Optional<UserInfos> getCreatorForModel(final JsonObject json) {
        if(!json.containsKey("owner") || !json.getJsonObject("owner").containsKey("userId")){
            return Optional.empty();
        }
        final JsonObject owner = json.getJsonObject("owner");
        final UserInfos user = new UserInfos();
        user.setUserId( owner.getString("userId"));
        user.setUsername(owner.getString("displayName"));
        return Optional.ofNullable(user);
    }

    @Override
    protected Future<List<Boolean>> doDelete(UserInfos user, List<String> ids) {
        return super.doDelete(user, ids).onSuccess(result -> {
            // Notify resource deletion via broker and dont wait for completion
            final ResourcesDeletedDTO notification = new ResourcesDeletedDTO(ids, Wiki.WIKI_TYPE);
            resourcePublisher.notifyResourcesDeleted(notification);
        });
    }

    @Override
    protected String getCreatedAtColumn() {
        return "created";
    }

    @Override
    protected void setCreatorForModel(final UserInfos user, final JsonObject json) {
        final JsonObject author = new JsonObject();
        author.put("userId", user.getUserId());
        author.put("displayName", user.getUsername());
        json.put("owner", author);
    }
}
