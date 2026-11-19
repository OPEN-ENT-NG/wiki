package net.atos.entng.wiki.broker;

import io.edifice.aiwiki.events.WikiReceiverBrokerListener;
import io.edifice.aiwiki.v1.CourseHierarchy;
import io.edifice.aiwiki.v1.CourseResponse;
import io.edifice.aiwiki.v1.MessageReceived;
import io.vertx.core.Future;
import io.vertx.core.Promise;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import net.atos.entng.wiki.service.WikiService;

import static io.vertx.core.Future.failedFuture;

/**
 * Listener implementation for AI wiki generator events.
 * Handles asynchronous updates from the AI service by delegating to WikiService.
 */
public class AIWikiGeneratorListenerImpl implements WikiReceiverBrokerListener {
    private static final Logger log = LoggerFactory.getLogger(AIWikiGeneratorListenerImpl.class);
    
    private final WikiService wikiService;

    public AIWikiGeneratorListenerImpl(final WikiService wikiService) {
        this.wikiService = wikiService;
    }

    @Override
    public Future<MessageReceived> updateWikiStructure(CourseHierarchy structure) {
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
        final Promise<MessageReceived> promise = Promise.promise();
        wikiService.updateWikiStructureFromAI(wikiId, structure)
            .onSuccess(v -> {
                log.info("Wiki structure updated successfully for wiki: " + wikiId);
                promise.complete(new MessageReceived(true, null));
            })
            .onFailure(err -> {
                log.error("Failed to update wiki structure for wiki: " + wikiId, err);
                promise.complete(new MessageReceived(false, err.getMessage()));
            });
        return promise.future();
    }

    @Override
    public Future<MessageReceived> updateWikiContent(CourseResponse courseResponse) {
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
        final Promise<MessageReceived> promise = Promise.promise();
        wikiService.transformPage(courseResponse)
            .otherwise(courseResponse)
            .compose(transformedCourse ->
            wikiService.updateWikiContentFromAI(wikiId, transformedCourse)
                .onSuccess(v -> {
                    log.info("Wiki content updated successfully for wiki: " + wikiId);
                    promise.complete(new MessageReceived(true, null));
                })
                .onFailure(err -> {
                    log.error("Failed to update wiki content for wiki: " + wikiId, err);
                    promise.complete(new MessageReceived(false, err.getMessage()));
                })
        );
        return promise.future();
    }
}
