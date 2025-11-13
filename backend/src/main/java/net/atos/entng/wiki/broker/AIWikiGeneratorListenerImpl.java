package net.atos.entng.wiki.broker;

import io.vertx.core.Future;
import io.vertx.core.Vertx;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import net.atos.entng.wiki.service.WikiService;
import org.entcore.edificewikigenerator.AbstractEdificeWikiGeneratorListener;
import org.entcore.edificewikigenerator.CourseHierarchy;
import org.entcore.edificewikigenerator.CourseResponse;

import static io.vertx.core.Future.failedFuture;

/**
 * Listener implementation for AI wiki generator events.
 * Handles asynchronous updates from the AI service by delegating to WikiService.
 */
public class AIWikiGeneratorListenerImpl extends AbstractEdificeWikiGeneratorListener {
    private static final Logger log = LoggerFactory.getLogger(AIWikiGeneratorListenerImpl.class);
    
    private final WikiService wikiService;

    public AIWikiGeneratorListenerImpl(final Vertx vertx, final String platformName, final WikiService wikiService) {
        super(vertx, platformName);
        this.wikiService = wikiService;
    }

    @Override
    public Future<Void> onUpdateWikiStructure(CourseHierarchy structure) {
        if (structure == null) {
            log.error("Received null wiki structure");
            return failedFuture("Received null wiki structure");
        }
        
        final String wikiId = structure.getWikiId();
        if (wikiId == null || wikiId.trim().isEmpty()) {
            log.error("Wiki ID is null or empty in structure update");
            return failedFuture("Wiki ID is null or empty in structure update");
        }
        
        log.info("Updating wiki structure for wiki: " + wikiId);
        
        // Delegate to service
        return wikiService.updateWikiStructureFromAI(wikiId, structure)
            .onSuccess(v -> log.info("Wiki structure updated successfully for wiki: " + wikiId))
            .onFailure(err -> log.error("Failed to update wiki structure for wiki: " + wikiId, err));
    }

    @Override
    public Future<Void> onUpdateWikiContent(CourseResponse courseResponse) {
        if (courseResponse == null || courseResponse.getCourse() == null) {
            log.error("Received null wiki content");
            return failedFuture("Received null wiki content");
        }
        
        final String wikiId = courseResponse.getWikiId();
        if (wikiId == null || wikiId.trim().isEmpty()) {
            log.error("Wiki ID is null or empty in content update");
            return failedFuture("Wiki ID is null or empty in content update");
        }
        
        log.info("Updating wiki content for wiki: " + wikiId);
        
        // Delegate to service
        return wikiService.updateWikiContentFromAI(wikiId, courseResponse)
            .onSuccess(v -> log.info("Wiki content updated successfully for wiki: " + wikiId))
            .onFailure(err -> log.error("Failed to update wiki content for wiki: " + wikiId, err));
    }
}
