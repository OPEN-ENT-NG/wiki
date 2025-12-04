package net.atos.entng.wiki.models.poll;

import io.vertx.core.json.JsonObject;

public class VotesSummary {
    private String pollName;
    private int numberOfYes;
    private int numberOfNo;

    public String getPollName() {
        return pollName;
    }

    public void setPollName(String pollName) {
        this.pollName = pollName;
    }

    public int getNumberOfYes() {
        return numberOfYes;
    }

    public void setNumberOfYes(int numberOfYes) {
        this.numberOfYes = numberOfYes;
    }

    public int getNumberOfNo() {
        return numberOfNo;
    }

    public void setNumberOfNo(int numberOfNo) {
        this.numberOfNo = numberOfNo;
    }

    public JsonObject toJson(){
        return JsonObject.mapFrom(this);
    }
}
