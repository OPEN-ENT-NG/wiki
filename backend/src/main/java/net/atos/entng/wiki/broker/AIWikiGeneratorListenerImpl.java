package net.atos.entng.wiki.broker;

import io.vertx.core.Future;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import net.atos.entng.wiki.service.WikiService;
import org.entcore.edificewikigenerator.CourseResponse;

/**
 * Listener implementation for AI wiki generator events.
 * Handles asynchronous updates from the AI service by delegating to WikiService.
 */
public class AIWikiGeneratorListenerImpl implements AIWikiGeneratorListener {
    private static final Logger log = LoggerFactory.getLogger(AIWikiGeneratorListenerImpl.class);
    
    private final WikiService wikiService;

    public AIWikiGeneratorListenerImpl(final WikiService wikiService) {
        this.wikiService = wikiService;
    }

    @Override
    public Future<Void> updateWikiStructure(CourseHierarchy structure) {
        if (structure == null) {
            log.error("Received null wiki structure");
            return Future.failedFuture("wiki.structure.null");
        }
        
        final String wikiId = structure.getId();
        if (wikiId == null || wikiId.trim().isEmpty()) {
            log.error("Wiki ID is null or empty in structure update");
            return Future.failedFuture("wiki.id.null");
        }
        
        log.info("Updating wiki structure for wiki: " + wikiId);
        
        // Delegate to service
        return wikiService.updateWikiStructureFromAI(wikiId, structure)
            .onSuccess(v -> log.info("Wiki structure updated successfully for wiki: " + wikiId))
            .onFailure(err -> log.error("Failed to update wiki structure for wiki: " + wikiId, err));
    }

    @Override
    public Future<Void> updateWikiContent(CourseResponse courseResponse) {
        if (courseResponse == null || courseResponse.getData() == null) {
            log.error("Received null wiki content");
            return Future.failedFuture("wiki.content.null");
        }
        
        final String wikiId = courseResponse.getData().getId();
        if (wikiId == null || wikiId.trim().isEmpty()) {
            log.error("Wiki ID is null or empty in content update");
            return Future.failedFuture("wiki.id.null");
        }
        
        log.info("Updating wiki content for wiki: " + wikiId);
        
        // Delegate to service
        return wikiService.updateWikiContentFromAI(wikiId, courseResponse)
            .onSuccess(v -> log.info("Wiki content updated successfully for wiki: " + wikiId))
            .onFailure(err -> log.error("Failed to update wiki content for wiki: " + wikiId, err));
    }
}
