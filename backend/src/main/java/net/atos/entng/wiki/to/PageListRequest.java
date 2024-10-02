package net.atos.entng.wiki.to;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.vertx.core.json.JsonObject;

import java.util.List;
import java.util.stream.Collectors;

@JsonIgnoreProperties(ignoreUnknown = true)
public class PageListRequest {
    private final List<PageListEntryFlat> pages;

    @JsonCreator
    public PageListRequest(@JsonProperty("pages") List<PageListEntryFlat> pages) {
        this.pages = pages;
    }

    public List<PageListEntryFlat> getPages() {
        return pages;
    }

    public List<PageListEntryFlat> getRootPages() {
        return pages.stream().filter(page -> page.isRoot()).collect(Collectors.toList());
    }

    public List<PageListEntryFlat> getPageByParentId(final String id) {
        return pages.stream().filter(page -> page.hasParentId(id)).collect(Collectors.toList());
    }

    public JsonObject toJson(){
        return JsonObject.mapFrom(this);
    }

    public static PageListRequest fromJson(final JsonObject json){
        return json.mapTo(PageListRequest.class);
    }
}
