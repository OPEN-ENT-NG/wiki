package net.atos.entng.wiki.to;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.vertx.core.json.JsonObject;

@JsonIgnoreProperties(ignoreUnknown = true)
public class PageId {
    private final String pageId;
    private final String wikiId;

    @JsonCreator
    public PageId(@JsonProperty("pageId") String pageId, @JsonProperty("wikiId") String wikiId) {
        this.pageId = pageId;
        this.wikiId = wikiId;
    }

    public String getPageId() {
        return pageId;
    }

    public String getWikiId() {
        return wikiId;
    }

    public JsonObject toJson() {
        return JsonObject.mapFrom(this);
    }

    public static PageId fromJson(final JsonObject json) {
        return json.mapTo(PageId.class);
    }
}