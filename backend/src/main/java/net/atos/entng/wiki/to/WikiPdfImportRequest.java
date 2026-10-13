package net.atos.entng.wiki.to;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.vertx.core.json.JsonObject;

public class WikiPdfImportRequest {
    private final String fileId;
    private final String wikiId;

    @JsonCreator
    public  WikiPdfImportRequest(
        @JsonProperty("fileId") String fileId,
        @JsonProperty("wikiId") String wikiId
    ) {
        this.fileId = fileId;
        this.wikiId = wikiId;
    }

    public String getFileId() {
        return fileId;
    }

    public String getWikiId() {
        return wikiId;
    }

    public JsonObject toJson() {
        return JsonObject.mapFrom(this);
    }

    public static WikiPdfImportRequest fromJson(final JsonObject json) {
        return json.mapTo(WikiPdfImportRequest.class);
    }
}
