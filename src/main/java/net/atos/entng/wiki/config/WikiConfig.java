package net.atos.entng.wiki.config;

import io.vertx.core.json.JsonObject;


public class WikiConfig {

    private final Number wikiPaginationLimit;
    private static final Number WIKI_PAGINATION_DEFAULT = 5;

    public WikiConfig(JsonObject config) {
        this.wikiPaginationLimit = config.getNumber("pagination-limit", WIKI_PAGINATION_DEFAULT);
    }

    public Number wikiPaginationLimit() {
        return this.wikiPaginationLimit;
    }
}
