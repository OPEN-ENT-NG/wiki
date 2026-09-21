package net.atos.entng.wiki.to;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.vertx.core.json.JsonObject;

public class WikiPdfImportRequest {
    private final String fileUrl;

    @JsonCreator
    public  WikiPdfImportRequest(
        @JsonProperty("file") String fileUrl
    ) {
        this.fileUrl = fileUrl;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public JsonObject toJson() {
        return JsonObject.mapFrom(this);
    }

    public static WikiPdfImportRequest fromJson(final JsonObject json) {
        return json.mapTo(WikiPdfImportRequest.class);
    }
}
