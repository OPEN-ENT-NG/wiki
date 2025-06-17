package net.atos.entng.wiki.listeners;

import io.vertx.core.json.JsonObject;
import org.entcore.broker.api.dto.resources.ResourceInfoDTO;
import org.entcore.broker.proxy.ResourceBrokerListener;
import org.entcore.common.resources.MongoResourceBrokerListenerImpl;

import java.util.Date;

/**
 * Implementation of ResourceBrokerListener for the Wiki module.
 * Retrieves resource information from the wiki collection.
 * Implements ResourceBrokerListener to detect Broker annotations.
 */
public class ResourceBrokerListenerImpl extends MongoResourceBrokerListenerImpl implements ResourceBrokerListener {

    /**
     * Name of the MongoDB collection containing wiki data
     */
    private static final String WIKI_COLLECTION = "wiki";

    /**
     * Create a new MongoDB implementation of ResourceBrokerListener for wikis.
     */
    public ResourceBrokerListenerImpl() {
        super(WIKI_COLLECTION);
    }
    
    /**
     * Convert MongoDB wiki document to ResourceInfoDTO.
     * Overrides parent method to match the specific document structure in wiki.
     *
     * @param resource The MongoDB document from wiki collection
     * @return ResourceInfoDTO with extracted information
     */
    @Override
    protected ResourceInfoDTO convertToResourceInfoDTO(JsonObject resource) {
        if (resource == null) {
            return null;
        }
        
        try {
            // Extract basic information
            final String id = resource.getString("_id");
            final String title = resource.getString("title", "");
            final String description = resource.getString("description", "");
            final String thumbnail = resource.getString("thumbnail", "");
            
            // Extract owner information from wiki-specific structure
            final JsonObject owner = resource.getJsonObject("owner", new JsonObject());
            final String authorId = owner.getString("userId", "");
            final String authorName = owner.getString("displayName", "");
            
            // Handle ISODate format for wiki documents
            Date creationDate = this.parseDate(resource.getValue("created"));
            Date modificationDate = this.parseDate(resource.getValue("modified"));
            
            return new ResourceInfoDTO(
                id,
                title,
                description,
                thumbnail,
                authorName,
                authorId,
                creationDate,
                modificationDate
            );
        } catch (Exception e) {
            log.error("Error converting Wiki document to ResourceInfoDTO", e);
            return null;
        }
    }
}