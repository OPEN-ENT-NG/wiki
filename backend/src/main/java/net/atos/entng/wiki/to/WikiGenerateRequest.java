package net.atos.entng.wiki.to;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.vertx.core.json.JsonObject;

@JsonIgnoreProperties(ignoreUnknown = true)
public class WikiGenerateRequest {
    private final String level;
    private final String subject;
    private final String sequence;
    private final String keywords;
    private final String wikiId;

    @JsonCreator
    public WikiGenerateRequest(
            @JsonProperty("level") String level,
            @JsonProperty("subject") String subject,
            @JsonProperty("sequence") String sequence,
            @JsonProperty("keywords") String keywords,
            @JsonProperty("wikiId") String wikiId) {
        this.level = level;
        this.subject = subject;
        this.sequence = sequence;
        this.keywords = keywords;
        this.wikiId = wikiId;
    }

    public String getLevel() {
        return level;
    }

    public String getSubject() {
        return subject;
    }

    public String getSequence() {
        return sequence;
    }

    public String getKeywords() {
        return keywords;
    }

    public String getWikiId() {
        return wikiId;
    }

    public JsonObject toJson() {
        return JsonObject.mapFrom(this);
    }

    public static WikiGenerateRequest fromJson(final JsonObject json) {
        return json.mapTo(WikiGenerateRequest.class);
    }
}