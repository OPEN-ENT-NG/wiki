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
    private final Boolean isVisible;
    private final List<PageListEntryTree> childrens;

    public PageListEntryTree(PageListEntryFlat entry) {
        this(entry.getId(), entry.getPosition(), entry.getParentId(), entry.getIsVisible(), new ArrayList<>());
    }

    public PageListEntryTree(String _id, Integer position, Boolean isVisible) {
        this(_id, position, null, isVisible, Collections.emptyList());
    }

    public PageListEntryTree(String id, Integer position, Boolean isVisible, List<PageListEntryTree> childrens) {
        this(id, position, null, isVisible, childrens);
    }

    @JsonCreator
    public PageListEntryTree(@JsonProperty("_id") String _id,
                             @JsonProperty("position") Integer position,
                             @JsonProperty("parentId") String parentId,
                             @JsonProperty("isVisible") Boolean isVisible,
                             @JsonProperty("childrens") List<PageListEntryTree> childrens) {
        this.id = _id;
        this.position = position;
        this.parentId = parentId;
        this.isVisible = isVisible;
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

    public Boolean getIsVisible() {
        return isVisible;
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