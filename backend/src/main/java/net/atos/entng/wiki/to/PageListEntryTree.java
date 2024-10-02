package net.atos.entng.wiki.to;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.vertx.core.json.JsonObject;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class PageListEntryTree {
    @JsonProperty("_id")
    private final String id;
    private final Integer position;
    private final String parentId;
    private final List<PageListEntryTree> childrens;

    public PageListEntryTree(PageListEntryFlat entry) {
        this(entry.getId(), entry.getPosition(), entry.getParentId(), new ArrayList<>());
    }

    public PageListEntryTree(String _id, Integer position) {
        this(_id, position, null, Collections.emptyList());
    }

    public PageListEntryTree(String id, Integer position, List<PageListEntryTree> childrens) {
        this(id, position, null, childrens);
    }

    @JsonCreator
    public PageListEntryTree(@JsonProperty("_id") String _id,
                             @JsonProperty("position") Integer position,
                             @JsonProperty("parentId") String parentId,
                             @JsonProperty("childrens") List<PageListEntryTree> childrens) {
        this.id = _id;
        this.position = position;
        this.parentId = parentId;
        this.childrens = childrens;
    }

    public void addChildren(final PageListRequest list){
        final List<PageListEntryFlat> entries =  list.getPageByParentId(this.id);
        for(final PageListEntryFlat flatEntry : entries){
            final PageListEntryTree entry = new PageListEntryTree(flatEntry);
            entry.addChildren(list);
            this.childrens.add(entry);
        }
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

    public JsonObject toJson(){
        return JsonObject.mapFrom(this);
    }

    public static PageListEntryTree fromJson(final JsonObject json){
        return json.mapTo(PageListEntryTree.class);
    }

    public List<PageListEntryTree> getChildrens() {
        return childrens;
    }
}