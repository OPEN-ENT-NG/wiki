package net.atos.entng.wiki.to;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.vertx.core.json.JsonObject;

import java.util.ArrayList;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class PageListResponse {
    private final List<PageListEntryTree> pages;

    @JsonCreator
    public PageListResponse(@JsonProperty("pages") List<PageListEntryTree> pages) {
        this.pages = pages;
    }
    public PageListResponse(PageListRequest list) {
        this.pages = new ArrayList<>();
        for(final PageListEntryFlat entryFlat : list.getRootPages()){
            final PageListEntryTree entry = new PageListEntryTree(entryFlat);
            entry.addChildren(list);
            this.pages.add(entry);
        }
    }

    public List<PageListEntryTree> getPages() {
        return pages;
    }

    public JsonObject toJson(){
        return JsonObject.mapFrom(this);
    }

    public static PageListResponse fromJson(final JsonObject json){
        return json.mapTo(PageListResponse.class);
    }
}
