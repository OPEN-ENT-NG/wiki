package net.atos.entng.wiki.to;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.vertx.core.json.JsonObject;
import org.apache.commons.lang3.StringUtils;

@JsonIgnoreProperties(ignoreUnknown = true)
public class PageListEntryFlat {
    @JsonProperty("_id")
    private final String id;
    private final Integer position;
    private final String parentId;
    private final Boolean isVisible;

    public PageListEntryFlat(String id, Integer position, Boolean isVisible) {
        this(id, position, null, isVisible);
    }

    @JsonCreator
    public PageListEntryFlat(@JsonProperty("_id")  String id, @JsonProperty("position") Integer position, @JsonProperty("parentId") String parentId, @JsonProperty("isVisible") Boolean isVisible) {
        this.id = id;
        this.position = position;
        this.parentId = parentId;
        this.isVisible = isVisible;
    }

    public boolean hasParentId(final String id){
        return StringUtils.equals(this.parentId, id);
    }

    public boolean isRoot(){
        return StringUtils.isEmpty(parentId);
    }

    public String getId() {
        return id;
    }

    public Integer getPosition() {
        return position;
    }

    public String getParentId() {
        return parentId;
    }

    public Boolean getIsVisible() {
        return isVisible;
    }

    public JsonObject toJson(){
        return JsonObject.mapFrom(this);
    }

    public static PageListEntryFlat fromJson(final JsonObject json){
        return json.mapTo(PageListEntryFlat.class);
    }
}